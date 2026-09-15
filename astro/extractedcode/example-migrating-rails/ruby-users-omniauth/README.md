# Ruby Users OmniAuth

A Rails application demonstrating OAuth2 authentication using the OmniAuth gem with Google OAuth2 provider. This project shows how to implement secure authentication without storing passwords, using external OAuth providers instead.

## Features

- 🔑 **Google OAuth2 Authentication** - Sign in with your Google account
- 👤 **User Profile Management** - View and edit your profile information
- 🎨 **Modern UI** - Clean, responsive design with smooth animations
- 🔒 **Secure Sessions** - Rails session management with proper authentication
- 🧪 **Developer Mode** - Test authentication without external providers (development only)
- ✅ **Comprehensive Tests** - Full test suite with unit, integration, and system tests

## Prerequisites

- Ruby 3.3.0 or higher
- Rails 8.0.2 or higher
- SQLite3
- A Google account for OAuth2 setup

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ruby-users-omniauth
   ```

2. **Install dependencies:**
   ```bash
   bundle install
   ```

3. **Set up the database:**
   ```bash
   bin/rails db:create db:migrate db:seed
   ```

4. **Set up Google OAuth2 credentials (see below)**

5. **Start the server:**
   ```bash
   bin/rails server
   ```

## Google OAuth2 Setup

To use Google OAuth2 authentication, you need to create a Google Cloud Project and obtain OAuth2 credentials:

### Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give your project a name (e.g., "Ruby Users OmniAuth")
4. Click "Create"

### Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API" and click on it
3. Click "Enable"

### Step 3: Create OAuth2 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" for user type
   - Fill in the required fields:
     - Application name: "Ruby Users OmniAuth"
     - User support email: your email
     - Developer contact information: your email
   - Add scopes: `../auth/userinfo.email` and `../auth/userinfo.profile`
   - Add test users if needed
4. For the OAuth client ID:
   - Application type: "Web application"
   - Name: "Ruby Users OmniAuth"
   - Authorized redirect URIs: 
     - `http://localhost:3000/auth/google_oauth2/callback`
     - `http://127.0.0.1:3000/auth/google_oauth2/callback`

### Step 4: Configure Environment Variables

1. **Create a `.env` file** in the project root:
   ```bash
   touch .env
   ```

2. **Add your credentials** to the `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

3. **Install the dotenv gem** (if not already installed):
   ```bash
   gem install dotenv-rails
   ```

4. **Add to your Gemfile** (if not already present):
   ```ruby
   gem 'dotenv-rails', groups: [:development, :test]
   ```

5. **Load environment variables** by adding to `config/application.rb`:
   ```ruby
   # Load environment variables from .env file
   require 'dotenv/rails-now' if Rails.env.development? || Rails.env.test?
   ```

### Alternative: Using Rails Credentials

Instead of environment variables, you can use Rails encrypted credentials:

1. **Edit credentials:**
   ```bash
   bin/rails credentials:edit
   ```

2. **Add your Google credentials:**
   ```yaml
   google:
     client_id: your_google_client_id_here
     client_secret: your_google_client_secret_here
   ```

3. **Update the OmniAuth configuration** in `config/initializers/omniauth.rb`:
   ```ruby
   provider :google_oauth2, 
     Rails.application.credentials.dig(:google, :client_id),
     Rails.application.credentials.dig(:google, :client_secret),
     # ... rest of configuration
   ```

## Development Mode

For development and testing, you can use the built-in developer provider:

1. Start the server: `bin/rails server`
2. Visit `http://localhost:3000`
3. Click "Developer Login (Development Only)"
4. Enter any name and email to sign in

## Running Tests

The application includes comprehensive tests:

```bash
# Run all tests
bin/rails test

# Run only unit tests
bin/rails test:models

# Run only controller tests  
bin/rails test:controllers

# Run only system tests
bin/rails test:system
```

## Project Structure

```
app/
├── controllers/
│   ├── application_controller.rb  # Authentication helpers
│   ├── home_controller.rb         # Landing page
│   ├── sessions_controller.rb     # OAuth authentication
│   └── users_controller.rb        # User profile management
├── models/
│   └── user.rb                    # User model with OAuth methods
└── views/
    ├── layouts/
    │   └── application.html.erb   # Main layout with navigation
    ├── home/
    │   └── index.html.erb         # Landing page / dashboard
    └── users/
        ├── show.html.erb          # User profile
        └── edit.html.erb          # Edit profile form

config/
├── initializers/
│   └── omniauth.rb               # OmniAuth configuration
└── routes.rb                     # Application routes

db/
├── migrate/
│   └── *_create_users.rb         # User model migration
└── seeds.rb                      # Sample data
```

## Key Files

- **`config/initializers/omniauth.rb`** - OmniAuth configuration with Google OAuth2 provider
- **`app/models/user.rb`** - User model with OAuth authentication methods
- **`app/controllers/sessions_controller.rb`** - Handles OAuth callbacks and session management
- **`app/controllers/application_controller.rb`** - Authentication helpers and before_action filters

## OAuth Flow

1. User clicks "Sign In with Google"
2. Application redirects to Google OAuth2 authorization server
3. User authenticates with Google and grants permissions
4. Google redirects back to application with authorization code
5. Application exchanges code for user information
6. User account is created or updated with Google profile data
7. User is signed in and redirected to dashboard

## Security Features

- **No password storage** - All authentication handled by Google OAuth2
- **Secure session management** - Rails session with proper authentication checks
- **CSRF protection** - Built-in Rails CSRF protection for all forms
- **Input validation** - Comprehensive validation for user data
- **Error handling** - Graceful error handling for OAuth failures

## Deployment Notes

For production deployment:

1. **Set environment variables** on your hosting platform
2. **Configure allowed redirect URIs** in Google Cloud Console for your production domain
3. **Enable SSL/HTTPS** (required for OAuth2 in production)
4. **Set up proper error monitoring** for OAuth failures

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure your redirect URI in Google Cloud Console matches exactly: `http://localhost:3000/auth/google_oauth2/callback`

2. **"invalid_client" error**
   - Check that your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

3. **"access_denied" error**
   - User denied permission or OAuth consent screen not properly configured

4. **Tests failing**
   - Make sure you have the `mocha` gem installed for test stubbing
   - Run `bundle install` to ensure all test dependencies are available

### Debug Mode

To debug OAuth issues, check the Rails logs:

```bash
tail -f log/development.log
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is created for educational purposes as part of the FusionAuth migration guide series.
