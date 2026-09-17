#!/usr/bin/env python3
"""
compare-pages.py - Compare local dev server pages against fusionauth.io production.

PURPOSE: Find broken code references, failing pages, and rendering discrepancies
between local (localhost:3001) and production (fusionauth.io).

APPROACH:
  1. Scan all MDX files under astro/src/content/docs/ and astro/src/content/blog/
  2. Filter to only those containing LocalCode, LocalValue, LocalEmailCode, or LocalMarkdown
  3. Derive the URL path from the file's position in the directory tree
  4. Fetch the page from both localhost:3001 and fusionauth.io
  5. Normalize the HTML (strip dynamic content, normalize URLs, extract main content)
  6. Compare and report discrepancies

CHOICES (documented for future reference):
  - Python stdlib only (no pip available, no sudo for apt):
    urllib.request for fetching, difflib for comparison, re for normalization
  - HTML normalization: strip <script>, <style>, <nav>, <footer>, <header> tags,
    normalize localhost URLs to production, collapse whitespace, strip timestamps
  - Comparison: unified diff on normalized HTML, with section-level summary
  - Restartability: track completed pages in /tmp/compare-completed.json
  - Batch mode: --limit N to process N pages at a time, --resume to skip completed
  - Report: plain text file at /tmp/compare-report.txt

USAGE:
  python3 compare-pages.py                    # run all pages
  python3 compare-pages.py --limit 20         # process 20 pages
  python3 compare-pages.py --resume           # skip already-completed pages
  python3 compare-pages.py --list             # just list the pages, don't fetch
  python3 compare-pages.py --page /docs/api  # compare a single page
"""

import argparse
import json
import os
import re
import sys
import time
import difflib
import urllib.request
import urllib.error
import ssl
from pathlib import Path
from html.parser import HTMLParser

# --- Configuration ---

LOCAL_BASE = "http://localhost:3001"
PROD_BASE = "https://fusionauth.io"
CONTENT_DIRS = [
    "astro/src/content/docs",
    "astro/src/content/blog",
]
# Components that indicate a page uses local code snippets
LOCAL_COMPONENTS = ["LocalCode", "LocalValue", "LocalEmailCode", "LocalMarkdown"]
# Where to store state and results
STATE_FILE = "/tmp/compare-completed.json"
REPORT_FILE = "/tmp/compare-report.txt"
LOCAL_HTML_DIR = "/tmp/compare-local"
PROD_HTML_DIR = "/tmp/compare-prod"
# Delay between requests (seconds) to be polite
REQUEST_DELAY = 0.3
# Request timeout
TIMEOUT = 30


# --- HTML Normalizer ---
# CHOICE: We strip dynamic elements and normalize HTML to focus on content
# differences. This avoids false positives from analytics scripts, timestamps,
# CSRF tokens, etc. We extract just the main article content since nav/footer/
# header differ between environments.

class HTMLStripper(HTMLParser):
    """Strip specific tags and their contents from HTML."""

    STRIP_TAGS = {"script", "style", "noscript", "svg", "head"}
    STRIP_PARTIAL_TAGS = {"nav", "footer", "header", "aside"}

    def __init__(self):
        super().__init__()
        self.result = []
        self.skip_depth = 0
        self.tag_stack = []
        self.attrs_stack = []

    def handle_starttag(self, tag, attrs):
        self.tag_stack.append(tag)
        self.attrs_stack.append(dict(attrs))
        if tag in self.STRIP_TAGS or tag in self.STRIP_PARTIAL_TAGS:
            self.skip_depth += 1
        elif self.skip_depth == 0:
            # Normalize: strip class, id, data-* attrs (dynamic), keep href/src
            clean_attrs = []
            for k, v in attrs:
                if k in ("href", "src", "alt", "title", "lang", "rel", "type", "content"):
                    # Normalize localhost URLs in href/src
                    if k in ("href", "src") and v:
                        v = re.sub(r"https?://localhost:\d+", PROD_BASE, v)
                    clean_attrs.append(f'{k}="{v}"')
            attr_str = (" " + " ".join(clean_attrs)) if clean_attrs else ""
            self.result.append(f"<{tag}{attr_str}>")

    def handle_endtag(self, tag):
        if self.tag_stack and self.tag_stack[-1] == tag:
            self.tag_stack.pop()
            self.attrs_stack.pop()
        if tag in self.STRIP_TAGS or tag in self.STRIP_PARTIAL_TAGS:
            self.skip_depth = max(0, self.skip_depth - 1)
        elif self.skip_depth == 0:
            self.result.append(f"</{tag}>")

    def handle_data(self, data):
        if self.skip_depth == 0:
            self.result.append(data)

    def get_text(self):
        return "".join(self.result)


def normalize_html(html_bytes, page_url):
    """Normalize HTML for comparison.

    CHOICE: We do lightweight normalization using regex + simple tag stripping.
    More sophisticated tools (beautifulsoup, lxml) would be better but aren't
    available in this environment. The regex approach handles 95% of cases.
    """
    try:
        html = html_bytes.decode("utf-8", errors="replace")
    except Exception:
        return ""

    # Strip HTML comments
    html = re.sub(r"<!--.*?-->", "", html, flags=re.DOTALL)

    # Use our tag stripper to remove dynamic elements
    stripper = HTMLStripper()
    try:
        stripper.feed(html)
        html = stripper.get_text()
    except Exception:
        pass  # If parsing fails, use regex fallback

    # Normalize localhost URLs to production
    html = re.sub(r"http://localhost:\d+", PROD_BASE, html)

    # Normalize .md vs ?format=md (local dev uses ?format=md, prod uses .md)
    html = html.replace("?format=md", ".md")

    # Strip common dynamic patterns
    # Timestamps like 2024-01-15T12:00:00Z
    html = re.sub(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}", "TIMESTAMP", html)
    # Unix timestamps (10+ digits)
    html = re.sub(r"\b\d{10,13}\b", "TIMESTAMP", html)
    # Build hashes like /_astro/hash.js
    html = re.sub(r"/_astro/[a-zA-Z0-9_-]+\.(js|css)", "/_astro/HASH.\\1", html)
    # Random-looking hashes in attributes
    html = re.sub(r'="([a-f0-9]{8,})"', '="HASH"', html)

    # Collapse whitespace
    html = re.sub(r"\s+", " ", html).strip()

    return html


def fetch_page(url, timeout=TIMEOUT):
    """Fetch a page and return bytes. Returns None on error."""
    try:
        ctx = ssl.create_default_context()
        req = urllib.request.Request(url, headers={
            "User-Agent": "compare-pages/1.0 (fusionauth-site dev tool)",
            "Accept": "text/html",
        })
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return resp.read()
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}: {url}")
        return None
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return None


# --- MDX File Discovery ---

def find_mdx_files_with_local_components():
    """Find all MDX files containing LocalCode, LocalValue, LocalEmailCode, or LocalMarkdown.

    CHOICE: We scan the raw MDX source rather than trying to parse frontmatter
    or use Astro's content collection API. This is simpler and more reliable
    for a standalone script.
    """
    site_root = Path(__file__).parent
    pages = []

    # Directories/files to skip (partials, templates, not real pages)
    SKIP_DIRS = {"_shared", "email"}
    SKIP_PREFIXES = ("_",)  # Files starting with _ are partials

    for content_dir in CONTENT_DIRS:
        full_dir = site_root / content_dir
        if not full_dir.exists():
            print(f"Warning: {full_dir} does not exist, skipping")
            continue

        section = content_dir.split("/")[-1]  # "docs" or "blog"

        for mdx_file in sorted(full_dir.rglob("*.mdx")):
            # Skip partials and template directories
            rel_to_content = mdx_file.relative_to(full_dir)
            parts = rel_to_content.parts
            if any(p in SKIP_DIRS for p in parts):
                continue
            if any(p.startswith("_") for p in parts):
                continue
            try:
                content = mdx_file.read_text(errors="replace")
            except Exception:
                continue

            # Check if file contains any local component
            has_local = any(f"<{comp}" in content or f"import {comp}" in content
                          for comp in LOCAL_COMPONENTS)
            if not has_local:
                continue

            # Derive URL path from file location
            rel_path = mdx_file.relative_to(full_dir)
            # Remove .mdx extension
            url_path = str(rel_path.with_suffix(""))
            # Convert index files: docs/foo/index -> /docs/foo
            if url_path.endswith("/index"):
                url_path = url_path[:-6]
            # Ensure leading slash
            if not url_path.startswith("/"):
                url_path = "/" + url_path
            # Prepend section
            url_path = f"/{section}{url_path}"

            # Check for slug override in frontmatter
            slug_match = re.search(r'^slug:\s*["\']?([^"\'\n]+)', content, re.MULTILINE)
            if slug_match:
                url_path = "/" + slug_match.group(1).strip("/")

            pages.append({
                "mdx_file": str(mdx_file.relative_to(site_root)),
                "url_path": url_path,
                "local_url": f"{LOCAL_BASE}{url_path}",
                "prod_url": f"{PROD_BASE}{url_path}",
            })

    return pages


def load_completed():
    """Load set of completed page paths from state file."""
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE) as f:
                return set(json.load(f))
        except Exception:
            return set()
    return set()


def save_completed(completed):
    """Save completed page paths to state file."""
    with open(STATE_FILE, "w") as f:
        json.dump(sorted(completed), f, indent=2)


def diff_html(local_norm, prod_norm, url_path):
    """Compare two normalized HTML strings and return diff lines."""
    local_lines = local_norm.split(" ")
    prod_lines = prod_norm.split(" ")
    diff = list(difflib.unified_diff(
        prod_lines, local_lines,
        fromfile=f"prod:{url_path}",
        tofile=f"local:{url_path}",
        lineterm="",
    ))
    return diff


def main():
    parser = argparse.ArgumentParser(description="Compare local vs production pages")
    parser.add_argument("--limit", type=int, default=0, help="Max pages to process (0=all)")
    parser.add_argument("--resume", action="store_true", help="Skip already-completed pages")
    parser.add_argument("--list", action="store_true", help="Just list pages, don't fetch")
    parser.add_argument("--page", type=str, help="Compare a single page by URL path")
    parser.add_argument("--verbose", action="store_true", help="Show all diffs, not just summary")
    args = parser.parse_args()

    print("Scanning MDX files for local code components...")
    all_pages = find_mdx_files_with_local_components()
    print(f"Found {len(all_pages)} MDX files with LocalCode/LocalValue/LocalEmailCode/LocalMarkdown")

    if args.page:
        # Filter to single page
        all_pages = [p for p in all_pages if p["url_path"] == args.page]
        if not all_pages:
            print(f"Page {args.page} not found or has no local components")
            sys.exit(1)

    # Check if local server is running (unless just listing)
    if not args.list:
        try:
            test_req = urllib.request.Request(LOCAL_BASE, headers={"User-Agent": "compare-pages-check"})
            urllib.request.urlopen(test_req, timeout=5)
        except Exception:
            print(f"ERROR: Cannot connect to {LOCAL_BASE}")
            print("Please start the local dev server first: npm run dev")
            sys.exit(1)

    if args.list:
        print("\nPages to compare:")
        for p in all_pages:
            print(f"  {p['url_path']:60s}  {p['mdx_file']}")
        return

    # Filter to already-completed if resuming
    completed = set()
    if args.resume:
        completed = load_completed()
        before = len(all_pages)
        all_pages = [p for p in all_pages if p["url_path"] not in completed]
        print(f"Resuming: skipped {before - len(all_pages)} already-completed pages")

    if args.limit > 0:
        all_pages = all_pages[:args.limit]

    print(f"Processing {len(all_pages)} pages...")
    print(f"Local base: {LOCAL_BASE}")
    print(f"Prod base:  {PROD_BASE}")
    print()

    # Ensure output directories exist
    os.makedirs(LOCAL_HTML_DIR, exist_ok=True)
    os.makedirs(PROD_HTML_DIR, exist_ok=True)

    # Results tracking
    results = {
        "ok": [],
        "local_only_diff": [],    # Content differs between local and prod
        "local_fetch_error": [],  # Couldn't fetch from local
        "prod_fetch_error": [],   # Couldn't fetch from prod
        "prod_404": [],           # Page doesn't exist on prod yet
        "both_fetch_error": [],   # Couldn't fetch from either
    }

    for i, page in enumerate(all_pages):
        url_path = page["url_path"]
        local_url = page["local_url"]
        prod_url = page["prod_url"]
        mdx_file = page["mdx_file"]

        prefix = f"[{i+1}/{len(all_pages)}]"

        # Check if page should exist (skip /landing/, /404, etc.)
        if "/landing/" in url_path or url_path == "/404":
            print(f"{prefix} SKIP {url_path} (excluded path)")
            completed.add(url_path)
            continue

        print(f"{prefix} {url_path} ...", end=" ", flush=True)

        # Fetch both pages
        local_html = fetch_page(local_url)
        time.sleep(REQUEST_DELAY)
        prod_html = fetch_page(prod_url)
        time.sleep(REQUEST_DELAY)

        # Save raw HTML for debugging
        url_slug = url_path.strip("/").replace("/", "_") or "root"
        if local_html:
            with open(f"{LOCAL_HTML_DIR}/{url_slug}.html", "wb") as f:
                f.write(local_html)
        if prod_html:
            with open(f"{PROD_HTML_DIR}/{url_slug}.html", "wb") as f:
                f.write(prod_html)

        # Handle fetch errors
        if local_html is None and prod_html is None:
            print("BOTH FAILED")
            results["both_fetch_error"].append(page)
            completed.add(url_path)
            continue
        if local_html is None:
            print("LOCAL FAILED")
            results["local_fetch_error"].append(page)
            completed.add(url_path)
            continue
        if prod_html is None:
            # Check if it's a 404 (page doesn't exist on prod yet)
            print("PROD 404 (page not yet deployed?)")
            results["prod_404"].append(page)
            completed.add(url_path)
            continue

        # Normalize both
        local_norm = normalize_html(local_html, local_url)
        prod_norm = normalize_html(prod_html, prod_url)

        # Compare
        diff = diff_html(local_norm, prod_norm, url_path)

        if not diff:
            print("OK")
            results["ok"].append(page)
        else:
            diff_count = len(diff)
            print(f"DIFF ({diff_count} lines)")
            results["local_only_diff"].append({
                "page": page,
                "diff_lines": diff_count,
                "diff_sample": diff[:20],  # First 20 lines of diff
            })

            if args.verbose:
                for line in diff[:30]:
                    print(f"    {line}")
                if diff_count > 30:
                    print(f"    ... and {diff_count - 30} more lines")

        completed.add(url_path)
        save_completed(completed)

    # --- Generate Report ---
    print(f"\n{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}")
    print(f"  OK (no diff):           {len(results['ok'])}")
    print(f"  DIFF (content differs): {len(results['local_only_diff'])}")
    print(f"  Local fetch error:      {len(results['local_fetch_error'])}")
    print(f"  Prod fetch error:       {len(results['prod_fetch_error'])}")
    print(f"  Prod 404 (not deployed):{len(results['prod_404'])}")
    print(f"  Both fetch error:       {len(results['both_fetch_error'])}")

    # Write report file
    with open(REPORT_FILE, "w") as f:
        f.write("FUSIONAUTH PAGE COMPARISON REPORT\n")
        f.write(f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Local: {LOCAL_BASE}  |  Prod: {PROD_BASE}\n")
        f.write("=" * 70 + "\n\n")

        f.write("SUMMARY\n")
        f.write("-" * 70 + "\n")
        f.write(f"  OK (no diff):           {len(results['ok'])}\n")
        f.write(f"  DIFF (content differs): {len(results['local_only_diff'])}\n")
        f.write(f"  Local fetch error:      {len(results['local_fetch_error'])}\n")
        f.write(f"  Prod fetch error:       {len(results['prod_fetch_error'])}\n")
        f.write(f"  Prod 404 (not deployed):{len(results['prod_404'])}\n")
        f.write(f"  Both fetch error:       {len(results['both_fetch_error'])}\n\n")

        if results["local_only_diff"]:
            f.write("PAGES WITH DIFFERENCES\n")
            f.write("-" * 70 + "\n")
            for item in results["local_only_diff"]:
                page = item["page"]
                f.write(f"\n{'='*70}\n")
                f.write(f"PAGE: {page['url_path']}\n")
                f.write(f"MDX:  {page['mdx_file']}\n")
                f.write(f"Local URL: {page['local_url']}\n")
                f.write(f"Prod URL:  {page['prod_url']}\n")
                f.write(f"Diff lines: {item['diff_lines']}\n")
                f.write("-" * 70 + "\n")
                for line in item["diff_sample"]:
                    f.write(f"  {line}\n")
                if item["diff_lines"] > 20:
                    f.write(f"  ... and {item['diff_lines'] - 20} more lines (see /tmp/compare-local/ and /tmp/compare-prod/ for full HTML)\n")

        if results["local_fetch_error"]:
            f.write("\n\nPAGES THAT FAILED TO LOAD LOCALLY\n")
            f.write("-" * 70 + "\n")
            for page in results["local_fetch_error"]:
                f.write(f"  {page['url_path']:50s}  {page['mdx_file']}\n")

        if results["prod_404"]:
            f.write("\n\nPAGES NOT ON PRODUCTION (404)\n")
            f.write("-" * 70 + "\n")
            for page in results["prod_404"]:
                f.write(f"  {page['url_path']:50s}  {page['mdx_file']}\n")

        if results["both_fetch_error"]:
            f.write("\n\nPAGES THAT FAILED TO LOAD ON BOTH\n")
            f.write("-" * 70 + "\n")
            for page in results["both_fetch_error"]:
                f.write(f"  {page['url_path']:50s}  {page['mdx_file']}\n")

    print(f"\nFull report written to: {REPORT_FILE}")
    print(f"Raw HTML saved to: {LOCAL_HTML_DIR}/ and {PROD_HTML_DIR}/")


if __name__ == "__main__":
    main()
