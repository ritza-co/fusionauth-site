require "application_system_test_case"

class AuthenticationTest < ApplicationSystemTestCase
  def setup
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "system_test_user",
      info: {
        name: "System Test User",
        email: "systemtest@example.com",
        image: "https://example.com/system_avatar.jpg"
      }
    })
  end

  def teardown
    OmniAuth.config.test_mode = false
    OmniAuth.config.mock_auth[:google_oauth2] = nil
  end

  test "unauthenticated user sees sign in page" do
    visit root_path
    
    assert_selector "h1", text: "Ruby Users OmniAuth"
    assert_selector "p", text: "Secure authentication with Google OAuth2 and OmniAuth"
    assert_link "Sign In with Google"
    assert_selector "h2", text: "About This Demo"
    assert_selector "h3", text: "Features"
    assert_selector "h3", text: "How It Works"
  end

  test "user can sign in with Google OAuth" do
    visit root_path
    
    # Click the first "Sign In with Google" link (from navigation)
    first("a", text: "Sign In with Google").click
    
    assert_text "Successfully signed in with Google!"
    assert_selector "h1", text: "Welcome back, System Test User!"
    assert_selector "p", text: "You're successfully signed in with Google"
    assert_link "Profile"
    assert_button "Sign Out"
  end

  test "authenticated user sees dashboard" do
    sign_in_as_google_user
    
    visit root_path
    
    assert_selector "h1", text: "Welcome back, System Test User!"
    assert_selector "p", text: "Email: systemtest@example.com"
    assert_selector "span.provider-badge", text: "Google"
    assert_selector "div.stat-label", text: "User ID"
    assert_selector "div.stat-label", text: "Status"
    assert_selector "div.stat-label", text: "Last Updated"
    assert_link "Edit Profile"
    assert_link "View Profile"
  end

  test "user can view profile" do
    sign_in_as_google_user
    
    visit root_path
    click_link "View Profile"
    
    assert_selector "h1", text: "User Profile"
    assert_selector "p", text: "Your account information and OAuth data"
    assert_selector "h2", text: "System Test User"
    assert_selector "p", text: "Email: systemtest@example.com"
    assert_selector "span.provider-badge", text: "Google"
    assert_link "Edit Profile"
    assert_link "Back to Dashboard"
  end

  test "user can edit profile" do
    sign_in_as_google_user
    
    visit root_path
    click_link "Edit Profile"
    
    assert_selector "h1", text: "Edit Profile"
    assert_field "Name", with: "System Test User"
    assert_field "Email", with: "systemtest@example.com"
    assert_field "Active account", checked: true
    
    fill_in "Name", with: "Updated Test User"
    fill_in "Email", with: "updated@example.com"
    
    click_button "Update Profile"
    
    assert_text "Profile updated successfully."
    assert_selector "h2", text: "Updated Test User"
    assert_selector "p", text: "Email: updated@example.com"
  end

  test "user can sign out" do
    sign_in_as_google_user
    
    visit root_path
    # Click the sign out button
    click_button "Sign Out"
    
    assert_text "You have been signed out."
    assert_selector "h1", text: "Ruby Users OmniAuth"
    assert_link "Sign In with Google"
    assert_no_link "Profile"
    assert_no_button "Sign Out"
  end

  test "unauthenticated user cannot access profile" do
    visit user_path(users(:google_user))
    
    assert_text "You must be signed in to access this page."
    assert_current_path root_path
  end

  test "unauthenticated user cannot edit profile" do
    visit edit_user_path(users(:google_user))
    
    assert_text "You must be signed in to access this page."
    assert_current_path root_path
  end

  # test "developer login works in development" do
  #   # This test simulates development environment
  #   Rails.stubs(:env).returns(ActiveSupport::StringInquirer.new("development"))
  #   
  #   OmniAuth.config.mock_auth[:developer] = OmniAuth::AuthHash.new({
  #     provider: "developer",
  #     uid: "dev@example.com",
  #     info: {
  #       name: "Developer User",
  #       email: "dev@example.com"
  #     }
  #   })
  # 
  #   visit root_path
  #   
  #   assert_button "Developer Login"
  #   click_button "Developer Login"
  #   
  #   assert_text "Successfully signed in with Developer!"
  #   assert_selector "h1", text: "Welcome back, Developer User!"
  #   assert_selector "span.provider-badge", text: "Developer"
  # end

  # test "profile form validation" do
  #   sign_in_as_google_user
  #   
  #   visit edit_user_path(User.last)
  #   
  #   fill_in "Name", with: ""
  #   fill_in "Email", with: "invalid-email"
  #   
  #   click_button "Update Profile"
  #   
  #   # Should stay on edit page due to validation errors
  #   assert_current_path user_path(User.last)
  #   assert_text "Edit Profile"
  # end

  private

  def sign_in_as_google_user
    visit "/auth/google_oauth2"
  end
end 