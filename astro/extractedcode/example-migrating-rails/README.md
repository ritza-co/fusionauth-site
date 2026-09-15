> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-migrating-rails). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.


# FusionAuth Rails Migration Examples

Rails-based authentication migration examples for FusionAuth. Includes Devise, OmniAuth, and Rails built-in authentication.

## Prerequisites

- Ruby 3.3.0+
- Rails 8.0.2+
- Node.js v22.13.0
- npm 10.9.2
- SQLite3
- Docker

## Set Up

Install npm dependencies.

```bash
npm install
```

Start the FusionAuth application.

```bash
docker compose up -d --build
```

Access the FusionAuth instance at <http://localhost:9011>.

## Devise Project

The Devise project in the `ruby-users-devise` folder uses email-and-password authentication and includes a UI for login, signup, and password change.

### Set Up

```bash
npm run setup:devise
```

### Start The Server

Start the server at <http://localhost:3000>.

```bash
npm run start:devise
```

### Export Users

Export users in a JSON file.

```bash
npm run export:devise
```


## OmniAuth Project

The OmniAuth project in the `ruby-users-omniauth` folder uses Google OAuth 2.0 with developer fallback, and includes a UI for social login and profile management.

### Set Up

```bash
npm run setup:omniauth
```

### Start The Server

Start the server at <http://localhost:3001>.

```bash
npm run start:omniauth
```

### Export Users

Export users in a JSON file.

```bash
npm run export:omniauth
```


## Rails Built-In Authentication Project

The Rails built-in authentication project in the `ruby-users-rails-auth` folder uses email-and-password authentication with `has_secure_password, and includes a UI for login, signup, password reset, and user tracking.

### Set Up

```bash
npm run setup:rails-auth
```

### Start The Server

Start the server at <http://localhost:3002>.

```bash
npm run start:rails-auth
```

### Export Users

Export users in a JSON file.

```bash
npm run export:rails-auth
```


## Test Accounts

All projects include these test accounts (password: `password123`):

- <admin@example.com>
- <user@example.com>
- <test@example.com>
- <unconfirmed@example.com>
