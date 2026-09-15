# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The data can then be loaded with the bin/rails db:seed command (or created alongside the database
# with db:setup).

puts "Creating seed data for Devise authentication..."

# Realistic user data for Devise (basic configuration without trackable/confirmable/lockable)
users_data = [
  {
    email: 'jennifer.adams@techstart.com',
    password: 'StartupLife2024!',
    password_confirmation: 'StartupLife2024!'
  },
  {
    email: 'carlos.rivera@designhub.net',
    password: 'CreativeFlow456#',
    password_confirmation: 'CreativeFlow456#'
  },
  {
    email: 'priya.patel@dataanalyst.io',
    password: 'Analytics789$',
    password_confirmation: 'Analytics789$'
  },
  {
    email: 'thomas.mueller@engineering.de',
    password: 'EngineerPrecision2024@',
    password_confirmation: 'EngineerPrecision2024@'
  },
  {
    email: 'amanda.foster@marketing.pro',
    password: 'BrandBuilding123!',
    password_confirmation: 'BrandBuilding123!'
  },
  {
    email: 'yuki.tanaka@freelance.jp',
    password: 'FreelanceLife456&',
    password_confirmation: 'FreelanceLife456&'
  },
  {
    email: 'dr.sarah.white@research.university',
    password: 'ResearchData789#',
    password_confirmation: 'ResearchData789#'
  },
  {
    email: 'marco.rossi@consultant.it',
    password: 'BusinessStrategy2024$',
    password_confirmation: 'BusinessStrategy2024$'
  },
  {
    email: 'linda.jackson@nonprofit.help',
    password: 'HelpingCommunity456!',
    password_confirmation: 'HelpingCommunity456!'
  },
  {
    email: 'alex.chen@startup.accelerator',
    password: 'Innovation2024!',
    password_confirmation: 'Innovation2024!'
  },
  {
    email: 'maria.gonzalez@consulting.firm',
    password: 'StrategicPlanning789$',
    password_confirmation: 'StrategicPlanning789$'
  },
  {
    email: 'david.williams@tech.solutions',
    password: 'TechSolutions456#',
    password_confirmation: 'TechSolutions456#'
  },
  {
    email: 'lisa.brown@creative.agency',
    password: 'CreativeAgency123!',
    password_confirmation: 'CreativeAgency123!'
  },
  {
    email: 'robert.davis@finance.corp',
    password: 'FinancialPlanning2024@',
    password_confirmation: 'FinancialPlanning2024@'
  },
  {
    email: 'emily.wilson@design.studio',
    password: 'DesignThinking789$',
    password_confirmation: 'DesignThinking789$'
  }
]

users_data.each do |user_data|
  user = User.find_or_create_by(email: user_data[:email]) do |u|
    u.password = user_data[:password]
    u.password_confirmation = user_data[:password_confirmation]
  end
  
  puts "  - #{user.email} - created successfully"
end

puts "Created #{User.count} users:"
puts "  All users are active (basic Devise configuration)"

puts "Seed data creation complete!"
puts ""
puts "You can now:"
puts "1. Start the server: rails server -p 3000"
puts "2. Login with any account using their respective passwords"
puts "3. Export users to FusionAuth: ruby export_users_for_fusionauth.rb"
