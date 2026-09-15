# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The data can then be loaded with the bin/rails db:seed command (or created alongside the database
# with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

puts "Creating seed data for OmniAuth demo..."

# Create sample users for testing with more realistic data
users_data = [
  {
    email: "alexandra.kim@techventures.com",
    name: "Alexandra Kim",
    provider: "google_oauth2",
    uid: "108234567890123456789",
    image_url: "https://via.placeholder.com/80/667eea/ffffff?text=AK",
    raw_info: {
      "provider" => "google_oauth2",
      "uid" => "108234567890123456789",
      "info" => {
        "name" => "Alexandra Kim",
        "email" => "alexandra.kim@techventures.com",
        "given_name" => "Alexandra",
        "family_name" => "Kim",
        "image" => "https://via.placeholder.com/80/667eea/ffffff?text=AK",
        "verified_email" => true,
        "locale" => "en"
      },
      "credentials" => {
        "token" => "ya29.sample_token_alex_123",
        "refresh_token" => "1//sample_refresh_alex_456",
        "expires_at" => 2.hours.from_now.to_i
      }
    },
    active: true
  },
  {
    email: "marcus.johnson@creativestudio.net",
    name: "Marcus Johnson",
    provider: "google_oauth2",
    uid: "109876543210987654321",
    image_url: "https://via.placeholder.com/80/764ba2/ffffff?text=MJ",
    raw_info: {
      "provider" => "google_oauth2",
      "uid" => "109876543210987654321",
      "info" => {
        "name" => "Marcus Johnson",
        "email" => "marcus.johnson@creativestudio.net",
        "given_name" => "Marcus",
        "family_name" => "Johnson",
        "image" => "https://via.placeholder.com/80/764ba2/ffffff?text=MJ",
        "verified_email" => true,
        "locale" => "en-US"
      },
      "credentials" => {
        "token" => "ya29.sample_token_marcus_789",
        "refresh_token" => "1//sample_refresh_marcus_012",
        "expires_at" => 1.hour.from_now.to_i
      }
    },
    active: true
  },
  {
    email: "sofia.rodriguez@datainsights.io",
    name: "Sofia Rodriguez",
    provider: "google_oauth2",
    uid: "107123456789012345678",
    image_url: "https://via.placeholder.com/80/f093fb/ffffff?text=SR",
    raw_info: {
      "provider" => "google_oauth2",
      "uid" => "107123456789012345678",
      "info" => {
        "name" => "Sofia Rodriguez",
        "email" => "sofia.rodriguez@datainsights.io",
        "given_name" => "Sofia",
        "family_name" => "Rodriguez",
        "image" => "https://via.placeholder.com/80/f093fb/ffffff?text=SR",
        "verified_email" => true,
        "locale" => "es"
      },
      "credentials" => {
        "token" => "ya29.sample_token_sofia_345",
        "refresh_token" => "1//sample_refresh_sofia_678",
        "expires_at" => 3.hours.from_now.to_i
      }
    },
    active: true
  },
  {
    email: "chen.wei@startupaccel.cn",
    name: "Chen Wei",
    provider: "google_oauth2",
    uid: "106789012345678901234",
    image_url: "https://via.placeholder.com/80/4facfe/ffffff?text=CW",
    raw_info: {
      "provider" => "google_oauth2",
      "uid" => "106789012345678901234",
      "info" => {
        "name" => "Chen Wei",
        "email" => "chen.wei@startupaccel.cn",
        "given_name" => "Wei",
        "family_name" => "Chen",
        "image" => "https://via.placeholder.com/80/4facfe/ffffff?text=CW",
        "verified_email" => true,
        "locale" => "zh-CN"
      },
      "credentials" => {
        "token" => "ya29.sample_token_chen_901",
        "refresh_token" => "1//sample_refresh_chen_234",
        "expires_at" => 90.minutes.from_now.to_i
      }
    },
    active: true
  },
  {
    email: "emma.thompson@freelancedesign.co.uk",
    name: "Emma Thompson",
    provider: "google_oauth2",
    uid: "105456789012345678901",
    image_url: "https://via.placeholder.com/80/43e97b/ffffff?text=ET",
    raw_info: {
      "provider" => "google_oauth2",
      "uid" => "105456789012345678901",
      "info" => {
        "name" => "Emma Thompson",
        "email" => "emma.thompson@freelancedesign.co.uk",
        "given_name" => "Emma",
        "family_name" => "Thompson",
        "image" => "https://via.placeholder.com/80/43e97b/ffffff?text=ET",
        "verified_email" => true,
        "locale" => "en-GB"
      },
      "credentials" => {
        "token" => "ya29.sample_token_emma_567",
        "refresh_token" => "1//sample_refresh_emma_890",
        "expires_at" => 45.minutes.from_now.to_i
      }
    },
    active: true
  },
  {
    email: "raj.patel@consultingfirm.in",
    name: "Raj Patel",
    provider: "google_oauth2",
    uid: "104321098765432109876",
    image_url: "https://via.placeholder.com/80/f6ad55/ffffff?text=RP",
    raw_info: {
      "provider" => "google_oauth2",
      "uid" => "104321098765432109876",
      "info" => {
        "name" => "Raj Patel",
        "email" => "raj.patel@consultingfirm.in",
        "given_name" => "Raj",
        "family_name" => "Patel",
        "image" => "https://via.placeholder.com/80/f6ad55/ffffff?text=RP",
        "verified_email" => true,
        "locale" => "en-IN"
      },
      "credentials" => {
        "token" => "ya29.sample_token_raj_123",
        "refresh_token" => "1//sample_refresh_raj_456",
        "expires_at" => 2.5.hours.from_now.to_i
      }
    },
    active: true
  },
  {
    email: "inactive.oauth@oldaccount.com",
    name: "Inactive OAuth User",
    provider: "google_oauth2",
    uid: "103987654321098765432",
    image_url: "https://via.placeholder.com/80/6c757d/ffffff?text=IO",
    raw_info: {
      "provider" => "google_oauth2",
      "uid" => "103987654321098765432",
      "info" => {
        "name" => "Inactive OAuth User",
        "email" => "inactive.oauth@oldaccount.com",
        "given_name" => "Inactive",
        "family_name" => "User",
        "image" => "https://via.placeholder.com/80/6c757d/ffffff?text=IO",
        "verified_email" => true,
        "locale" => "en"
      },
      "credentials" => {
        "token" => "ya29.expired_token_inactive_789",
        "refresh_token" => "1//expired_refresh_inactive_012",
        "expires_at" => 1.month.ago.to_i
      }
    },
    active: false # Inactive user
  },
  {
    email: "dev.tester@localhost.dev",
    name: "Development Tester",
    provider: "developer",
    uid: "dev.tester@localhost.dev",
    image_url: "https://via.placeholder.com/80/28a745/ffffff?text=DEV",
    raw_info: {
      "provider" => "developer",
      "uid" => "dev.tester@localhost.dev",
      "info" => {
        "name" => "Development Tester",
        "email" => "dev.tester@localhost.dev"
      }
    },
    active: true
  },
  {
    email: "qa.engineer@testingteam.local",
    name: "QA Engineer",
    provider: "developer",
    uid: "qa.engineer@testingteam.local",
    image_url: "https://via.placeholder.com/80/17a2b8/ffffff?text=QA",
    raw_info: {
      "provider" => "developer",
      "uid" => "qa.engineer@testingteam.local",
      "info" => {
        "name" => "QA Engineer",
        "email" => "qa.engineer@testingteam.local"
      }
    },
    active: true
  }
]

users_data.each do |user_data|
  user = User.find_or_initialize_by(provider: user_data[:provider], uid: user_data[:uid])
  
  if user.new_record?
    user.assign_attributes(user_data)
    user.save!
    puts "Created user: #{user.name} (#{user.email}) via #{user.provider_name} - #{user.active? ? 'active' : 'inactive'}"
  else
    puts "User already exists: #{user.name} (#{user.email}) via #{user.provider_name} - #{user.active? ? 'active' : 'inactive'}"
  end
end

puts "Seed data creation complete!"
puts "Total users: #{User.count}"
puts "Active users: #{User.active.count}"
puts "Inactive users: #{User.where(active: false).count}"
puts "Google users: #{User.by_provider('google_oauth2').count}"
puts "Developer users: #{User.by_provider('developer').count}"
puts ""
puts "You can now:"
puts "1. Start the server: rails server -p 3001"
puts "2. Login with Google OAuth or Developer mode"
puts "3. Export users to FusionAuth: ruby export_users_for_fusionauth.rb"
