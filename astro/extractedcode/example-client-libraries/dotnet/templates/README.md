# .NET FusionAuth Templates

Instructions on how to use FusionAuth .NET templates available on [NuGet](https://www.nuget.org/packages/FusionAuth.Templates/).

## Prerequisites

- .NET 7.0 or later installed.

## Installing the Templates

FusionAuth .NET templates are available on [NuGet](https://www.nuget.org/packages/FusionAuth.Templates/). You can install them by running the following command in your terminal.

```bash
dotnet new install FusionAuth.Templates::1.0.0
```

When installed successfully, the templates will be available in the .NET CLI and Visual Studio. The installation is the same for both Windows and macOS.

## Using the Templates

To create a new project from a template, navigate to your new project directory and run the following command.

```bash
dotnet new [template-name] [options]
```

Where `[template-name]` is the name of the template you want to use from one of the following:

- `fusionauthblazorserver` creates a new Blazor Server application with FusionAuth authentication and authorization.
- `fusionauthmvcwebapp` creates a new MVC application with FusionAuth authentication and authorization.
- `fusionauthwebapi` creates a new Web API application with FusionAuth authentication and authorization.

Use `[options]` to provide your FusionAuth URL and FusionAuth Application Client Id. The following options are available:

- `--issuer` is the fully qualified URL to your FusionAuth server. The default value is `http://localhost:9011`.
- `--client-id` is the [Client Id](https://fusionauth.io/docs/v1/tech/core-concepts/applications) associated with your application. The default value is `3c219e58-ed0e-4b18-ad48-f4f92793ae32`.
- `--port` is the port to run on under [Kestrel](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?view=aspnetcore-7.0), using HTTPS. The default value is `5001`. This can be changed after installation in the `appsettings.Development.json` file in the root directory of the project and `launchSettings.json` in the `Properties` directory of the project.

> Some templates will ask for a FusionAuth Client Secret when initializing a new project. Use a non-sensitive secret from a local FusionAuth installation. See the instructions below on setting up FusionAuth.


## FusionAuth Setup

In the root directory of this repository you will find a [README](../../README.md)  with instructions on how to stand up FusionAuth with [Docker](../../docker-compose.yml) and a [Kickstart](../../kickstart/kickstart.json) configuration.

> Note that this Kickstart has the following assumptions:
> - You do not have a local FusionAuth instance running on port `9011`.
> - Your .NET project will be running on the port `5001`. Your project might not run on the same port, as Visual Studio will randomly choose a port if the chosen one is already in use by another project. It may also be a different port if you run the project through IIS or another web server. In this case, update the `authorizedRedirectURL` and `logoutURL` variables to that of your project. If you need to, you can also update these in the Application settings page in the FusionAuth admin site in [the OAuth tab](https://fusionauth.io/docs/v1/tech/core-concepts/applications#oauth) at any time after the Kickstart has run.


The [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart) will set up a FusionAuth application and create a new user to login to the application. The Kickstart creates a new [FusionAuth Application](https://fusionauth.io/docs/v1/tech/core-concepts/applications) with the following settings:

- The Application is named `Example Application`.
- The Application Client Id is `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`.
- The Client Secret is `change-this-in-production-to-be-a-real-secret`.
- The Application has a redirect URL of `https://localhost:5001/callback`.
- The Application has a logout URL of `https://localhost:5001/`.

The application is set up with the following OAuth settings:

- The OAuth Authorization Grant Types are `Authorization Code` and `Refresh Token`.
- PKCE (Proof Key for Code Exchange) is required.
- JWT (JSON Web Token) is enabled, using a newly generated asymmetric key pair (RSA).

After running the Docker Compose file, you can access the FusionAuth admin site at [http://localhost:9011](http://localhost:9011). You can log in with the following credentials:

- Email: `admin@example.com`
- Password: `password`


## Testing

In this directory you can find a [convenience script](Program.cs) that demonstrates making authenticated requests to a project created from the `fusionauthwebapi` template. The script requests a bearer token from your FusionAuth instance that you can use to authorize on the Swagger UI and make authenticated requests to the example WeatherForecast API.

To run the script you can set up a test .NET project with the following commands:

```
dotnet new console --output TestWebAPI && cd TestWebAPI
dotnet add package Newtonsoft.Json
```

Then copy the code in [`Program.cs`](Program.cs) to your local `Program.cs` file.
