import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Login error</h1>
      <h3>You are not logged in. Please click the link below to try again.</h3>
      <ul>
      <li>
          <Link
            to="login"
          >
            Login
          </Link>
        </li>
      </ul>
    </div>
  );
}
