# Ruby Users Rails Auth

A demonstration of **Rails 8.0 built-in authentication** using `has_secure_password` with comprehensive user management features and FusionAuth migration capabilities.

## Features

### 🔐 Rails 8.0 Authentication
- **Secure Password Hashing**: Uses bcrypt with Rails' `has_secure_password`
- **Email Validation**: Built-in email format validation and uniqueness constraints
- **Password Reset**: Secure password reset functionality with time-limited tokens
- **User Tracking**: Track sign-in counts, timestamps, and IP addresses
- **Email Confirmation**: Optional email confirmation system for account verification
- **Session Management**: Secure session handling with Rails' built-in session store

### 🎨 Modern UI
- Responsive design with modern CSS
- Clean, professional interface
- Mobile-friendly layout
- Consistent styling across all pages

### 🧪 Comprehensive Testing
- **71 tests** covering all functionality
- Unit tests for User model
- Controller tests for all authentication flows
- System tests for end-to-end user journeys
- 100% test coverage for authentication features

## Getting Started

### Prerequisites
- Ruby 3.3.0+
- Rails 8.0.2+
- SQLite3

### Installation

1. **Clone and setup**:
   ```bash
   cd ruby-users-rails-auth
   bundle install
   rails db:migrate
   rails db:seed
   ```

2. **Start the server**:
   ```bash
   rails server
   ```

3. **Visit the application**:
   Open [http://localhost:3000](http://localhost:3000)

### Test Accounts

The seed data creates these test accounts (password: `password123`):

- **admin@example.com** - Admin User (confirmed, 15 sign-ins)
- **user@example.com** - Regular User (confirmed, 8 sign-ins)  
- **test@example.com** - Test User (confirmed, 3 sign-ins)
- **unconfirmed@example.com** - Unconfirmed User (unconfirmed, 0 sign-ins)

## Authentication Flow

### Registration
1. User fills out registration form
2. Account is created with bcrypt password hash
3. User is automatically confirmed and logged in
4. Session is established

### Login
1. User enters email and password
2. Password is verified against bcrypt hash
3. User tracking fields are updated
4. Session is established

### Password Reset
1. User requests password reset
2. Secure token is generated and stored
3. User receives reset instructions (email simulation)
4. User can reset password with valid token
5. Token expires after 2 hours

## Technical Implementation

### User Model
```ruby
class User < ApplicationRecord
  has_secure_password
  
  validates :name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }
  
  # Scopes, callbacks, and helper methods...
end
```

### Key Features
- **Password Security**: bcrypt hashing with configurable cost
- **Email Uniqueness**: Case-insensitive email validation
- **User Tracking**: Sign-in counts, timestamps, IP addresses
- **Token Management**: Secure password reset tokens
- **Confirmation System**: Email confirmation workflow

## Database Schema

```sql
create_table "users" do |t|
  t.string :name, null: false
  t.string :email, null: false
  t.string :password_digest, null: false
  t.datetime :confirmed_at
  t.string :reset_password_token
  t.datetime :reset_password_sent_at
  t.datetime :remember_created_at
  t.integer :sign_in_count, default: 0
  t.datetime :current_sign_in_at
  t.datetime :last_sign_in_at
  t.string :current_sign_in_ip
  t.string :last_sign_in_ip
  t.timestamps
end

add_index :users, :email, unique: true
add_index :users, :reset_password_token, unique: true
```

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
rails test

# Run specific test types
rails test:models
rails test:controllers
rails test:system
```

### Test Coverage
- **26 Unit Tests**: User model validations, methods, scopes
- **28 Controller Tests**: Authentication flows, redirects, security
- **17 System Tests**: End-to-end user journeys

## FusionAuth Migration

### Export Users

Export all users to FusionAuth format:

```bash
rails runner scripts/export_users_for_fusionauth.rb
```

### Verify Export

Validate the exported data:

```bash
rails runner scripts/verify_fusionauth_export.rb
```

### Import to FusionAuth

```bash
curl -X POST 'https://your-fusionauth-instance.com/api/user/import' \
     -H 'Authorization: YOUR_API_KEY' \
     -H 'Content-Type: application/json' \
     -d @fusionauth_users_export_TIMESTAMP.json
```

### Migration Benefits

✅ **Password Preservation**: All bcrypt passwords are preserved  
✅ **No Password Reset**: Users can log in with existing passwords  
✅ **User Data**: All tracking information is preserved  
✅ **Account Status**: Confirmed/unconfirmed status is maintained  
✅ **Seamless Transition**: Zero downtime migration possible  

### Export Features

- **Essential Fields Only**: Simplified export focusing on core user data
- **bcrypt Preservation**: Maintains password security and user convenience
- **Rails Metadata**: Preserves sign-in counts, timestamps, and tracking data
- **Flexible Import**: Compatible with FusionAuth User Import API
- **Data Validation**: Built-in verification for export integrity

## Project Structure

```
ruby-users-rails-auth/
├── app/
│   ├── controllers/
│   │   ├── application_controller.rb    # Authentication helpers
│   │   ├── sessions_controller.rb       # Login/logout
│   │   ├── registrations_controller.rb  # User registration/profile
│   │   ├── password_resets_controller.rb # Password reset flow
│   │   └── home_controller.rb           # Main page
│   ├── models/
│   │   └── user.rb                      # User model with has_secure_password
│   └── views/                           # Authentication views
├── scripts/
│   ├── export_users_for_fusionauth.rb   # FusionAuth export script
│   └── verify_fusionauth_export.rb      # Export verification
├── test/                                # Comprehensive test suite
└── db/
    ├── migrate/                         # Database migrations
    └── seeds.rb                         # Test data
```

## Development

### Adding New Features

1. **Models**: Add validations and methods to `User` model
2. **Controllers**: Create new controllers inheriting from `ApplicationController`
3. **Views**: Use consistent styling with existing authentication forms
4. **Tests**: Add comprehensive test coverage for new features
5. **Routes**: Update `config/routes.rb` with RESTful routes

### Security Considerations

- **Password Hashing**: Uses bcrypt with appropriate cost factor
- **Session Security**: Rails' secure session handling
- **CSRF Protection**: Built-in CSRF token validation
- **Input Validation**: Comprehensive model validations
- **SQL Injection**: ActiveRecord query protection
- **XSS Prevention**: ERB template escaping

## Comparison with Other Authentication Solutions

| Feature | Rails Built-in | Devise | OmniAuth |
|---------|---------------|---------|----------|
| Setup Complexity | ⭐⭐ Simple | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐ Complex |
| Customization | ⭐⭐⭐⭐⭐ Full | ⭐⭐⭐ Good | ⭐⭐⭐⭐ Very Good |
| Dependencies | ⭐⭐⭐⭐⭐ Minimal | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐ Many |
| Learning Curve | ⭐⭐ Easy | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐ Steep |
| Performance | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐ Good |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add comprehensive tests
4. Ensure all tests pass
5. Submit a pull request

## License

This project is part of the FusionAuth migration guide and is available under the MIT License.
