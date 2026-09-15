class User < ApplicationRecord
  # Validations
  validates :provider, presence: true
  validates :uid, presence: true, uniqueness: { scope: :provider }
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  
  # Scopes
  scope :active, -> { where(active: true) }
  scope :by_provider, ->(provider) { where(provider: provider) }
  
  # Class methods
  def self.from_omniauth(auth)
    # Find existing user by provider and uid
    user = find_by(provider: auth.provider, uid: auth.uid)
    
    if user
      # Update existing user with fresh data
      user.update(
        name: auth.info.name,
        email: auth.info.email,
        image_url: auth.info.image,
        raw_info: auth.to_hash
      )
      user
    else
      # Create new user
      create!(
        provider: auth.provider,
        uid: auth.uid,
        name: auth.info.name,
        email: auth.info.email,
        image_url: auth.info.image,
        raw_info: auth.to_hash,
        active: true
      )
    end
  end
  
  def self.find_or_create_by_email(email)
    find_by(email: email) || create!(
      email: email,
      name: email.split('@').first.humanize,
      provider: 'email',
      uid: email,
      active: true
    )
  end
  
  # Instance methods
  def display_name
    name.presence || email.split('@').first.humanize
  end
  
  def provider_name
    case provider
    when 'google_oauth2'
      'Google'
    when 'github'
      'GitHub'
    when 'facebook'
      'Facebook'
    when 'twitter'
      'Twitter'
    when 'developer'
      'Developer'
    else
      provider.humanize
    end
  end
  
  def avatar_url(size = 50)
    if image_url.present?
      image_url
    else
      # Generate Gravatar URL as fallback
      require 'digest/md5'
      hash = Digest::MD5.hexdigest(email.downcase)
      "https://www.gravatar.com/avatar/#{hash}?s=#{size}&d=identicon"
    end
  end
  
  def raw_info_json
    return {} unless raw_info.present?
    
    case raw_info
    when Hash
      raw_info
    when String
      JSON.parse(raw_info)
    else
      {}
    end
  rescue JSON::ParserError
    {}
  end
  
  def provider_profile_url
    case provider
    when 'github'
      "https://github.com/#{raw_info_json.dig('info', 'nickname')}"
    when 'twitter'
      "https://twitter.com/#{raw_info_json.dig('info', 'nickname')}"
    when 'facebook'
      "https://facebook.com/#{uid}"
    else
      nil
    end
  end
end
