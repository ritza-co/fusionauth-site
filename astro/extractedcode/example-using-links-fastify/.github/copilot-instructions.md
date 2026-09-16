# Project Guidelines
    
This project is based on Fastify, presenting an example implementation for using links from FusionAuth in a Fastify app with Google and Twitter.

The example application is located in ./complete-application/.

A base FusionAuth instance is started with ./docker-compose.yml using .env and ./kickstart/.

# FusionAuth

FusionAuth is a modern platform for Customer Identity and Access Management (CIAM). FusionAuth provides APIs and a responsive web user interface to support
login, registration, localized email, multi-factor authentication, reporting and much more.

## Core Concepts

Legacy identity technologies have complex hierarchy and cryptic terminology like realms, principals, subjects and distinguished names. In order to simplify something perceived to be complex, the best approach is to go back to the basics, to the atomic elements and throw everything else away.

When we built FusionAuth we took the back to basics approach. We identified two atomic elements of identify, Users and Applications. Everyone has Users, and Users need to be authenticated to Applications. For this reason FusionAuth is built upon four core elements:

* [Users](https://fusionauth.io/docs/get-started/core-concepts/users.mdx) - someone that can log into things
* [Applications](https://fusionauth.io/docs/get-started/core-concepts/applications.mdx) - things that Users log into
* [Registrations](https://fusionauth.io/docs/get-started/core-concepts/registrations.mdx) - the connection between a User and an Application they have access to
* [Tenants](https://fusionauth.io/docs/get-started/core-concepts/tenants.mdx) - A way to logically isolate Applications, Users and Registrations

## Getting Started

First you will need to install and configure FusionAuth before starting your integration. Here are some links to get you started:

### Quick Start
* [Register a User and Login](https://fusionauth.io/docs/lifecycle/register-users/register-user-login-api.mdx)
* [Self-service Registration](https://fusionauth.io/docs/lifecycle/register-users/basic-registration-forms.mdx)
* [Common Configuration](https://fusionauth.io/docs/get-started/run-in-the-cloud/common-configuration.mdx)

### Install Options
* [FastPath Install](https://fusionauth.io/docs/get-started/download-and-install/fast-path.mdx)
* [Docker](https://fusionauth.io/docs/get-started/download-and-install/docker.mdx)
* [Package Installation](https://fusionauth.io/docs/get-started/download-and-install/fusionauth-app.mdx)

### Create a User and call an API
* [Register a User and Login](https://fusionauth.io/docs/lifecycle/register-users/register-user-login-api.mdx)
* [API Docs](https://fusionauth.io/docs/apis.mdx)

## API Overview

The core of FusionAuth is a set of RESTful APIs that allow you to quickly integrate login, registration and advanced User management features into your application. The FusionAuth web UI is built upon these APIs. Everything in the user interface is available through an API.

On this page you will find links to each of the API groups and a general overview of the API status codes you can expect back from each API. Each API will also document specific status codes and the specific meaning of the status code.

* [API Authentication](https://fusionauth.io/docs/apis/authentication.mdx)
* [API Errors](https://fusionauth.io/docs/apis/errors.mdx)
  Here's a brief video showing how to use an API:

## APIs

Unless stated otherwise, all of the FusionAuth APIs will expect to receive a JSON request body. Ensure you have added the `Content-Type` HTTP header to your request.

The APIs are grouped into the following categories.

* [Actioning Users](https://fusionauth.io/docs/apis/actioning-users.mdx) - These APIs allow you to take actions on Users or modify previous actions (CRUD operations).
* [API Keys](https://fusionauth.io/docs/apis/api-keys.mdx) - These APIs allow you to take actions on API Keys or modify existing API Keys (CRUD operations).
* [Applications](https://fusionauth.io/docs/apis/applications.mdx) - These APIs allow you to create, retrieve, update and delete Applications and Application Roles
* [Audit Logs](https://fusionauth.io/docs/apis/audit-logs) - These APIs allow you to create, retrieve, search and export the Audit Log.
* [Connectors](https://fusionauth.io/docs/apis/connectors.mdx) - These APIs allow you to manage Connectors (CRUD operations).
* [Consents](https://fusionauth.io/docs/apis/consents.mdx) - These APIs allow you to manage Consent (CRUD operations).
* [Emails](https://fusionauth.io/docs/apis/emails.mdx) - These APIs allow you to both manage Email Templates (CRUD operations) as well as send emails to Users.
* [Entities](https://fusionauth.io/docs/apis/entities/entities.mdx) - These APIs allow you to manage Entities (CRUD operations) as well as search and grant permissions to them.
* [Entity Types](https://fusionauth.io/docs/apis/entities/entity-types.mdx) - These APIs allow you to manage Entity Types.
* [Event Logs](https://fusionauth.io/docs/apis/event-logs.mdx) - These APIs allow you to retrieve and search event logs.
* [Families](https://fusionauth.io/docs/apis/families.mdx) - These APIs allow you to manage Families (CRUD operations).
* [Forms](https://fusionauth.io/docs/apis/custom-forms/forms.mdx) - These APIs allow you to manage Forms (CRUD operations).
* [Form Fields](https://fusionauth.io/docs/apis/custom-forms/form-fields.mdx) - These APIs allow you to manage Form Fields (CRUD operations).
* [Groups](https://fusionauth.io/docs/apis/groups.mdx) - These APIs allow you to manage Groups (CRUD operations) as well Group membership.
* [Hosted Backend](https://fusionauth.io/docs/apis/hosted-backend.mdx) - These APIs allow you initiate OAuth2 code flow logins with FusionAuth-hosted backend endpoints.
* [Identity Providers](https://fusionauth.io/docs/apis/identity-providers.mdx) - These APIs allow you to manage Identity Providers for federating logins.
* [Integrations](https://fusionauth.io/docs/apis/integrations.mdx) - These APIs allow you to manage FusionAuth integrations such as Kafka, Twilio and CleanSpeak.
* [IP Access Control Lists](https://fusionauth.io/docs/apis/ip-acl.mdx) - These APIs allow you to manage IP Access Control Lists.
* [JSON Web Tokens](https://fusionauth.io/docs/apis/jwt.mdx) - These APIs allow you to manage Refresh Tokens, verify Access Tokens and retrieve public keys used for verifying JWT signatures.
* [Keys](https://fusionauth.io/docs/apis/keys.mdx) - These APIs allow you to manage cryptographic keys (CRUD operations).
* [Lambdas](https://fusionauth.io/docs/apis/lambdas.mdx) - These APIs allow you to manage Lambdas (CRUD operations).
* [Login](https://fusionauth.io/docs/apis/login.mdx) - These APIs allow you to authenticate Users.
* [Messengers](https://fusionauth.io/docs/apis/messengers.mdx) - These APIs allow you to manage Messengers (CRUD operations).
* [Multi-Factor](https://fusionauth.io/docs/apis/two-factor.mdx) - This API allows you to enable and disable Multi-Factor Authentication (MFA) on a user.
* [Passwordless](https://fusionauth.io/docs/apis/passwordless.mdx) - These APIs allow you to authenticate Users without a password.
* [Registrations](https://fusionauth.io/docs/apis/registrations.mdx) - These APIs allow you to manage the relationship between Users and Applications, also known as Registrations (CRUD operations).
* [Reactor](https://fusionauth.io/docs/apis/reactor.mdx) - These APIs allow you to manage licensing features.
* [Reports](https://fusionauth.io/docs/apis/reports.mdx) - These APIs allow you to retrieve reporting information from FusionAuth.
* [SCIM](https://fusionauth.io/docs/apis/scim.mdx) - These APIs allow you to provision users and groups in FusionAuth using SCIM requests from a SCIM Client.
* [System](https://fusionauth.io/docs/apis/system.mdx) - These APIs allow you to retrieve and update the system configuration, export system logs and retrieve system status.
* [Tenants](https://fusionauth.io/docs/apis/tenants.mdx) - These APIs allow you to manage Tenants (CRUD operations).
* [Advanced Themes](https://fusionauth.io/docs/apis/themes/advanced-themes.mdx) - These APIs allow you to manage Themes (CRUD operations).
* [Users](https://fusionauth.io/docs/apis/users.mdx) - These APIs allow you to create, retrieve, update and delete Users, Search for Users, Bulk Import and Password Management
* [User Actions](https://fusionauth.io/docs/apis/user-actions.mdx) - These APIs allow you to manage User Actions which are the definitions of actions that can be taken on Users (CRUD operations).
* [User Action Reasons](https://fusionauth.io/docs/apis/user-action-reasons.mdx) - These APIs allow you to manage User Action Reasons which are used when you action Users (CRUD operations).
* [User Comments](https://fusionauth.io/docs/apis/user-comments.mdx) - These APIs allow you to retrieve or create comments on Users.
* [WebAuthn](https://fusionauth.io/docs/apis/webauthn.mdx) - These APIs allow you to register, use, and manage WebAuthn passkeys.
* [Webhooks](https://fusionauth.io/docs/apis/webhooks.mdx) - These APIs allow you to manage Webhooks (CRUD operations).

## FusionAuth.io Full Documentation

https://fusionauth.io/docs/llms-full.txt

# Fastify

## Core Documents

The following list is a subset of the full TOC that detail core Fastify APIs and concepts in
order of most likely importance to the reader:

+ [Server](https://fastify.dev/docs/latest/Reference/Server/): Documents the core Fastify API. Includes documentation
  for the factory function and the object returned by the factory function.
+ [Lifecycle](https://fastify.dev/docs/latest/Reference/Lifecycle/): Explains the Fastify request lifecycle and
  illustrates where [Hooks](https://fastify.dev/docs/latest/Reference/Hooks/) are available for integrating with it.
+ [Routes](https://fastify.dev/docs/latest/Reference/Routes/): Details how to register routes with Fastify and how
  Fastify builds and evaluates the routing trie.
+ [Request](https://fastify.dev/docs/latest/Reference/Request/): Details Fastify's request object that is passed into
  each request handler.
+ [Reply](https://fastify.dev/docs/latest/Reference/Reply/): Details Fastify's response object available to each
  request handler.
+ [Validation and Serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/): Details
  Fastify's support for validating incoming data and how Fastify serializes data
  for responses.
+ [Plugins](https://fastify.dev/docs/latest/Reference/Plugins/): Explains Fastify's plugin architecture and API.
+ [Encapsulation](https://fastify.dev/docs/latest/Reference/Encapsulation/): Explains a core concept upon which all
  Fastify plugins are built.
+ [Decorators](https://fastify.dev/docs/latest/Reference/Decorators/): Explains the server, request, and response
  decorator APIs.
+ [Hooks](https://fastify.dev/docs/latest/Reference/Hooks/): Details the API by which Fastify plugins can inject
  themselves into Fastify's handling of the request lifecycle.

## Reference Documentation Table Of Contents

This table of contents is in alphabetical order.

+ [Content Type Parser](https://fastify.dev/docs/latest/Reference/ContentTypeParser/): Documents Fastify's default
  content type parser and how to add support for new content types.
+ [Decorators](https://fastify.dev/docs/latest/Reference/Decorators/): Explains the server, request, and response
  decorator APIs.
+ [Encapsulation](https://fastify.dev/docs/latest/Reference/Encapsulation/): Explains a core concept upon which all
  Fastify plugins are built.
+ [Errors](https://fastify.dev/docs/latest/Reference/Errors/): Details how Fastify handles errors and lists the
  standard set of errors Fastify generates.
+ [Hooks](https://fastify.dev/docs/latest/Reference/Hooks/): Details the API by which Fastify plugins can inject
  themselves into Fastify's handling of the request lifecycle.
+ [HTTP2](https://fastify.dev/docs/latest/Reference/HTTP2/): Details Fastify's HTTP2 support.
+ [Lifecycle](https://fastify.dev/docs/latest/Reference/Lifecycle/): Explains the Fastify request lifecycle and
  illustrates where [Hooks](https://fastify.dev/docs/latest/Reference/Hooks/) are available for integrating with it.
+ [Logging](https://fastify.dev/docs/latest/Reference/Logging/): Details Fastify's included logging and how to
  customize it.
+ [Long Term Support](https://fastify.dev/docs/latest/Reference/LTS/): Explains Fastify's long term support (LTS)
  guarantee and the exceptions possible to the [semver](https://semver.org)
  contract.
+ [Middleware](https://fastify.dev/docs/latest/Reference/Middleware/): Details Fastify's support for Express.js style
  middleware.
+ [Plugins](https://fastify.dev/docs/latest/Reference/Plugins/): Explains Fastify's plugin architecture and API.
+ [Reply](https://fastify.dev/docs/latest/Reference/Reply/): Details Fastify's response object available to each
  request handler.
+ [Request](https://fastify.dev/docs/latest/Reference/Request/): Details Fastify's request object that is passed into
  each request handler.
+ [Routes](https://fastify.dev/docs/latest/Reference/Routes/): Details how to register routes with Fastify and how
  Fastify builds and evaluates the routing trie.
+ [Server](https://fastify.dev/docs/latest/Reference/Server/): Documents the core Fastify API. Includes documentation
  for the factory function and the object returned by the factory function.
+ [TypeScript](https://fastify.dev/docs/latest/Reference/TypeScript/): Documents Fastify's TypeScript support and
  provides recommendations for writing applications in TypeScript that utilize
  Fastify.
+ [Validation and Serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/): Details
  Fastify's support for validating incoming data and how Fastify serializes data
  for responses.
+ [Warnings](https://fastify.dev/docs/latest/Reference/Warnings/): Details the warnings Fastify emits and how to
  solve them.
