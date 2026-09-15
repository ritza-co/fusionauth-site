class FusionAuthConnectorController < ApplicationController
  # Skip CSRF protection for API endpoint called by FusionAuth
  skip_before_action :verify_authenticity_token
  
  # Skip the current_user before_action since this is an API endpoint
  skip_before_action :current_user
  
  APPLICATION_ID = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e'.freeze
  
  def authenticate
    Rails.logger.info "FusionAuth connector request received for #{params[:loginId]}"
    
    email = params[:loginId]
    password = params[:password]
    
    # Validate required parameters
    if email.blank? || password.blank?
      Rails.logger.warn "Missing loginId or password in FusionAuth connector request"
      return head :bad_request
    end
    
    # Find user and validate password
    user = User.find_by(email: email.downcase)
    
    if user&.authenticate(password)
      Rails.logger.info "User authentication successful for #{email}. Returning user data to FusionAuth"
      
      user_data = build_fusionauth_user(user, password)
      Rails.logger.debug "Returning user data: #{user_data.inspect}"
      
      render json: { user: user_data }
    else
      Rails.logger.warn "Authentication failed for #{email}"
      head :not_found # 404 as required by FusionAuth for invalid credentials
    end
  rescue StandardError => e
    Rails.logger.error "Error in FusionAuth connector: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    head :internal_server_error
  end
  
  private
  
  def build_fusionauth_user(user, password)
    # Generate consistent UUID based on user ID
    user_uuid = generate_consistent_uuid(user.id)
    
    {
      # Required fields for FusionAuth
      id: user_uuid,
      email: user.email,
      username: user.email,
      
      # Authentication fields
      password: password, # Pass through the plaintext password for FusionAuth to hash
      passwordChangeRequired: false,
      
      # User profile fields
      fullName: user.name,
      firstName: extract_first_name(user.name),
      lastName: extract_last_name(user.name),
      verified: user.confirmed?,
      active: user.confirmed?,
      
      # Application registration - associate user with the application
      registrations: [{
        id: SecureRandom.uuid,
        applicationId: APPLICATION_ID,
        verified: user.confirmed?,
        roles: ['user']
      }],
      
      # Migration metadata stored in user data
      data: {
        migrated_from: 'rails_authentication',
        original_id: user.id,
        migrated_at: Time.current.iso8601,
        sign_in_count: user.sign_in_count,
        last_sign_in_at: user.last_sign_in_at&.iso8601,
        current_sign_in_at: user.current_sign_in_at&.iso8601,
        last_sign_in_ip: user.last_sign_in_ip,
        current_sign_in_ip: user.current_sign_in_ip,
        confirmed_at: user.confirmed_at&.iso8601
      }
    }
  end
  
  def generate_consistent_uuid(user_id)
    # Generate a consistent UUID based on user ID
    # This ensures the same user always gets the same UUID in FusionAuth
    namespace_uuid = '550e8400-e29b-41d4-a716-446655440000' # Arbitrary namespace UUID
    data = "rails_user_#{user_id}"
    
    # Create a deterministic UUID using SHA-1 hash (UUID v5)
    require 'digest/sha1'
    hash = Digest::SHA1.digest("#{namespace_uuid}#{data}")
    
    # Format as UUID v5
    hash_hex = hash.unpack1('H*')
    uuid = "#{hash_hex[0..7]}-#{hash_hex[8..11]}-5#{hash_hex[13..15]}-#{(hash_hex[16].to_i(16) & 0x3 | 0x8).to_s(16)}#{hash_hex[17..19]}-#{hash_hex[20..31]}"
    uuid
  end
  
  def extract_first_name(full_name)
    return '' if full_name.blank?
    full_name.split(' ').first
  end
  
  def extract_last_name(full_name)
    return '' if full_name.blank?
    parts = full_name.split(' ')
    return '' if parts.length < 2
    parts[1..-1].join(' ')
  end
end 