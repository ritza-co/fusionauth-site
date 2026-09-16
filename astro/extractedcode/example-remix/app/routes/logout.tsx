import type { LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/auth.server";
export let loader: LoaderFunction = async ({ request }) => {

   await fetch(`${process.env.AUTH_URL}/logout`);

   await authenticator.logout(request, { redirectTo: "/" });
  };