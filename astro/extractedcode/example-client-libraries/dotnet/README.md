# .NET FusionAuth Setup Script

This script will set up a FusionAuth application and link the user you used to sign in to your FusionAuth instance to the application. The script creates a new [FusionAuth Application](https://fusionauth.io/docs/v1/tech/core-concepts/applications) with the following settings:

- The Application is named `.NET FusionAuth Application`.
- The Application Client ID is `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`.
- The Client Secret is `change-this-in-production-to-be-a-real-secret`.
- The Application has a redirect URL of `https://localhost:5001/callback`.
- The Application has a logout URL of `https://localhost:5001/`.

The application is set up with the following OAuth settings:

- The OAuth Authorization Grant Types are `Authorization Code` and `Refresh Token`.
- PKCE (Proof Key for Code Exchange) is required.
- JWT (JSON Web Token) is enabled, using a newly generated asymmetric key pair (RSA).

## Prerequisites

- A running FusionAuth instance.
- .NET 7.0 or later installed.

Note that this setup script has the following assumptions:

- You are running a newly installed localhost FusionAuth instance available at `https://localhost:9011` with only one user and no tenants other than `Default`. A good base installation is a [local Docker installation](https://fusionauth.io/docs/v1/tech/installation-guide/docker).

- Your .NET project will be running on the port `5001`. Your project might not run on the same port, as Visual Studio will randomly choose a port if the chosen one is already in use by another project. It may also be a different port if you run the project through IIS or another web server. In this case, update the `authorizedRedirectURL` and `logoutURL` variables to that of your project. If you need to, you can also update these in the Application settings page in the FusionAuth admin site in [the OAuth tab](https://fusionauth.io/docs/v1/tech/core-concepts/applications#oauth) at any time after you've run the script.

- The script will create a FusionAuth application with a Client ID of `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`, and a Client Secret of `change-this-in-production-to-be-a-real-secret`. Update these as you need, but keep any sensitive secrets safe.

To use the setup script on a FusionAuth instance that does not meet these criteria, you may need to modify the script. All of the above settings can be changed in the static variables at the top of the `Program` class in the script.

### Creating an API key

Before running the script, you will need to create an API key.

Log into your FusionAuth instance. If it's your first time logging in, you'll need to set up a user and a password, as well as accept the terms and conditions.

Navigate to Settings -> API Keys. Click the + button to add a new API Key. Copy the value of the Key field and then note the key. It should  be a value like `CY1EUq2oAQrCgE7azl3A2xwG-OEwGPqLryDRBCoz-13IqyFYMn1_Udjt`.

## Running the Script

Once you have installed FusionAuth, updated the script variables as needed, and created an API key, you can compile and run the script.

First, create a .NET 7 project in a new directory:

```sh
dotnet new console --output SetupFusionAuth && cd SetupFusionAuth
```

Now, copy and paste code in the `Program.cs` file into your project's `Program.cs`.

Import the necessary NuGet packages:

```sh
dotnet add package JSON.Net
dotnet add package FusionAuth.Client 
```

To compile the script, navigate to the script directory and run:

```bash
dotnet publish -r osx-x64
```

Then, to execute the script, run

```bash
fusionauth_api_key=<YOUR_API_KEY> bin/Debug/net7.0/osx-x64/publish/SetupFusionAuth 
```

These commands assume you are running on macOS. If you are on a different platform, you will need to modify the [runtime parameter](https://learn.microsoft.com/en-us/dotnet/core/rid-catalog) in `dotnet publish` and the resulting binary output path in the execution command.

After compiling and running the script, FusionAuth should be set up with a new application named `.NET FusionAuth Application`, and the user you used to sign in to your FusionAuth instance will be linked to the application.
