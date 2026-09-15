Rails.application.config.middleware.use OmniAuth::Builder do
  # Google OAuth2 - the only provider we're using
  provider :google_oauth2, 
    ENV['GOOGLE_CLIENT_ID'], 
    ENV['GOOGLE_CLIENT_SECRET'],
    {
      scope: 'email,profile',
      prompt: 'select_account',
      image_aspect_ratio: 'square',
      image_size: 50
    }

  # Developer provider for testing (only in development)
  if Rails.env.development?
    provider :developer,
      fields: [:name, :email],
      uid_field: :email
  end
end

# Configure OmniAuth settings
OmniAuth.config.allowed_request_methods = [:post, :get]
OmniAuth.config.silence_get_warning = true 