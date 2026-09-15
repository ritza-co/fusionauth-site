ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "mocha/minitest"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
  end
end

# Configure OmniAuth for testing
OmniAuth.config.test_mode = true
OmniAuth.config.logger = Rails.logger

module ActionDispatch
  class IntegrationTest
    def setup
      OmniAuth.config.mock_auth[:google_oauth2] = nil
      OmniAuth.config.mock_auth[:developer] = nil
    end
    
    def sign_in_user(user_attributes = {})
      default_attributes = {
        provider: "google_oauth2",
        uid: "test_user_123",
        info: {
          name: "Test User",
          email: "test@example.com",
          image: "https://example.com/avatar.jpg"
        }
      }
      
      auth_hash = OmniAuth::AuthHash.new(default_attributes.merge(user_attributes))
      OmniAuth.config.mock_auth[:google_oauth2] = auth_hash
      
      get "/auth/google_oauth2/callback"
      follow_redirect!
    end
  end
end
