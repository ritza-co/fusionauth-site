class User < ApplicationRecord
  has_secure_password
  
  # Validations
  validates :name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :email, presence: true, uniqueness: { case_sensitive: false }, 
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }
  
  # Callbacks
  before_save :downcase_email
  before_create :set_default_values
  
  # Scopes
  scope :confirmed, -> { where.not(confirmed_at: nil) }
  scope :unconfirmed, -> { where(confirmed_at: nil) }
  
  # Instance methods
  def confirmed?
    confirmed_at.present?
  end
  
  def confirm!
    update!(confirmed_at: Time.current)
  end
  
  def display_name
    name.presence || email.split('@').first.titleize
  end
  
  def generate_reset_password_token!
    self.reset_password_token = SecureRandom.urlsafe_base64
    self.reset_password_sent_at = Time.current
    save!
  end
  
  def reset_password_token_valid?
    reset_password_sent_at.present? && reset_password_sent_at > 2.hours.ago
  end
  
  def clear_reset_password_token!
    self.reset_password_token = nil
    self.reset_password_sent_at = nil
    save!
  end
  
  def update_tracked_fields!(request)
    old_current = current_sign_in_at
    new_current = Time.current
    
    self.last_sign_in_at = old_current || new_current
    self.current_sign_in_at = new_current
    
    self.last_sign_in_ip = current_sign_in_ip
    self.current_sign_in_ip = request.remote_ip
    
    self.sign_in_count = (sign_in_count || 0) + 1
    
    save!
  end
  
  private
  
  def downcase_email
    self.email = email.downcase if email.present?
  end
  
  def set_default_values
    self.sign_in_count ||= 0
  end
end
