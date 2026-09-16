// import type { LoaderFunction } from "@remix-run/node";
// import { authenticator } from "~/auth.server";

// export const loader: LoaderFunction = async ({request}) => {

    // Once you've setup a user with the appropriate methods, you
    // can uncomment this to redirect logged out users somewhere
    // let user = await authenticator.isAuthenticated(request, {
    //     failureRedirect: "/",
    // });
// return user;

// }

export default function Dashboard() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>User Dashboard</h1>
      <p>If you were redirected here, the auth process was successful</p>      
    </div>
  );
}
