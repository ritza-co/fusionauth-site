# Create seed data for testing Rails authentication
puts "Creating seed data for Rails authentication..."

# Realistic user data
users_data = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    password: "SecurePass123!",
    confirmed_at: 2.months.ago,
    sign_in_count: 45,
    current_sign_in_at: 2.hours.ago,
    last_sign_in_at: 1.day.ago,
    current_sign_in_ip: "10.0.1.25",
    last_sign_in_ip: "10.0.1.24"
  },
  {
    name: "Michael Chen",
    email: "m.chen@startup.io",
    password: "DevLife2024$",
    confirmed_at: 3.weeks.ago,
    sign_in_count: 28,
    current_sign_in_at: 30.minutes.ago,
    last_sign_in_at: 6.hours.ago,
    current_sign_in_ip: "192.168.1.105",
    last_sign_in_ip: "192.168.1.104"
  },
  {
    name: "Emily Rodriguez",
    email: "emily.r@design.studio",
    password: "Creative456#",
    confirmed_at: 1.week.ago,
    sign_in_count: 12,
    current_sign_in_at: 4.hours.ago,
    last_sign_in_at: 2.days.ago,
    current_sign_in_ip: "172.16.0.15",
    last_sign_in_ip: "172.16.0.14"
  },
  {
    name: "David Kim",
    email: "david@freelancer.dev",
    password: "WorkFromHome789&",
    confirmed_at: 5.days.ago,
    sign_in_count: 8,
    current_sign_in_at: 1.day.ago,
    last_sign_in_at: 3.days.ago,
    current_sign_in_ip: "203.0.113.42",
    last_sign_in_ip: "203.0.113.41"
  },
  {
    name: "Lisa Thompson",
    email: "lisa.thompson@marketing.agency",
    password: "BrandStrategy101!",
    confirmed_at: 2.days.ago,
    sign_in_count: 5,
    current_sign_in_at: 8.hours.ago,
    last_sign_in_at: 1.day.ago,
    current_sign_in_ip: "198.51.100.33",
    last_sign_in_ip: "198.51.100.32"
  },
  {
    name: "James Wilson",
    email: "james.wilson@consulting.biz",
    password: "Consultant2024@",
    confirmed_at: 6.weeks.ago,
    sign_in_count: 67,
    current_sign_in_at: 15.minutes.ago,
    last_sign_in_at: 4.hours.ago,
    current_sign_in_ip: "10.1.1.50",
    last_sign_in_ip: "10.1.1.49"
  },
  {
    name: "Maria Garcia",
    email: "maria@nonprofit.org",
    password: "HelpingHands789$",
    confirmed_at: 1.month.ago,
    sign_in_count: 22,
    current_sign_in_at: 3.days.ago,
    last_sign_in_at: 5.days.ago,
    current_sign_in_ip: "192.0.2.88",
    last_sign_in_ip: "192.0.2.87"
  },
  {
    name: "Robert Brown",
    email: "r.brown@university.edu",
    password: "Professor2024!",
    confirmed_at: 4.months.ago,
    sign_in_count: 156,
    current_sign_in_at: 1.hour.ago,
    last_sign_in_at: 12.hours.ago,
    current_sign_in_ip: "172.20.1.77",
    last_sign_in_ip: "172.20.1.76"
  },
  {
    name: "Anna Kowalski",
    email: "anna.k@ecommerce.shop",
    password: "OnlineStore456#",
    confirmed_at: 3.days.ago,
    sign_in_count: 7,
    current_sign_in_at: 2.days.ago,
    last_sign_in_at: 4.days.ago,
    current_sign_in_ip: "10.2.3.101",
    last_sign_in_ip: "10.2.3.100"
  },
  {
    name: "Alex Turner",
    email: "alex.turner@newbie.com",
    password: "FirstTime123!",
    confirmed_at: nil, # Unconfirmed user
    sign_in_count: 0,
    current_sign_in_at: nil,
    last_sign_in_at: nil,
    current_sign_in_ip: nil,
    last_sign_in_ip: nil
  },
  {
    name: "Sophie Martin",
    email: "sophie@inactive.user",
    password: "OldAccount789$",
    confirmed_at: 8.months.ago,
    sign_in_count: 234,
    current_sign_in_at: 3.months.ago,
    last_sign_in_at: 3.months.ago,
    current_sign_in_ip: "203.0.113.200",
    last_sign_in_ip: "203.0.113.199"
  },
  {
    name: "Kevin O'Connor",
    email: "kevin@recentuser.net",
    password: "JustJoined2024@",
    confirmed_at: 1.day.ago,
    sign_in_count: 2,
    current_sign_in_at: 6.hours.ago,
    last_sign_in_at: 1.day.ago,
    current_sign_in_ip: "192.168.100.55",
    last_sign_in_ip: "192.168.100.54"
  }
]

users_data.each do |user_data|
  user = User.find_or_create_by(email: user_data[:email]) do |u|
    u.name = user_data[:name]
    u.password = user_data[:password]
    u.password_confirmation = user_data[:password]
    u.confirmed_at = user_data[:confirmed_at]
    u.sign_in_count = user_data[:sign_in_count]
    u.current_sign_in_at = user_data[:current_sign_in_at]
    u.last_sign_in_at = user_data[:last_sign_in_at]
    u.current_sign_in_ip = user_data[:current_sign_in_ip]
    u.last_sign_in_ip = user_data[:last_sign_in_ip]
  end
  
  status = user.confirmed? ? "confirmed" : "unconfirmed"
  puts "  - #{user.name} (#{user.email}) - #{status}, #{user.sign_in_count} sign-ins"
end

puts "Created #{User.count} users:"
puts "  Confirmed users: #{User.where.not(confirmed_at: nil).count}"
puts "  Unconfirmed users: #{User.where(confirmed_at: nil).count}"
puts "  Active users (signed in last 30 days): #{User.where('current_sign_in_at > ?', 30.days.ago).count}"

puts "Seed data creation complete!"
puts ""
puts "You can now:"
puts "1. Start the server: rails server -p 3002"
puts "2. Login with any confirmed account using their respective passwords"
puts "3. Export users to FusionAuth: ruby scripts/export_users_for_fusionauth.rb"
