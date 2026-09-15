require "application_system_test_case"

class AuthenticationTest < ApplicationSystemTestCase
  def setup
    @user = users(:admin)
  end

  test "user can register a new account" do
    visit root_path
    click_on "Register"
    
    fill_in "Name", with: "New User"
    fill_in "Email", with: "new@example.com"
    fill_in "Password", with: "password123"
    fill_in "Confirm Password", with: "password123"
    click_on "Create Account"
    
    assert_text "Welcome! Your account has been created successfully."
    assert_text "Welcome back, New User!"
    assert_current_path root_path
  end

  test "user cannot register with invalid data" do
    visit new_registration_path
    
    fill_in "Name", with: ""
    fill_in "Email", with: "invalid_email"
    fill_in "Password", with: "short"
    fill_in "Confirm Password", with: "different"
    click_on "Create Account"
    
    assert_text "prohibited this account from being saved"
    assert_text "Name can't be blank"
    assert_text "Email is invalid"
    assert_text "Password is too short"
    assert_text "Password confirmation doesn't match"
  end

  test "user can login with valid credentials" do
    visit root_path
    click_on "Login"
    
    fill_in "Email", with: @user.email
    fill_in "Password", with: "password123"
    click_on "Login"
    
    assert_text "Successfully logged in!"
    assert_text "Welcome back, #{@user.display_name}!"
    assert_current_path root_path
  end

  test "user cannot login with invalid credentials" do
    visit new_session_path
    
    fill_in "Email", with: @user.email
    fill_in "Password", with: "wrong_password"
    click_on "Login"
    
    assert_text "Invalid email or password."
    assert_current_path new_session_path
  end

  test "unconfirmed user cannot login" do
    unconfirmed_user = users(:unconfirmed)
    visit new_session_path
    
    fill_in "Email", with: unconfirmed_user.email
    fill_in "Password", with: "password123"
    click_on "Login"
    
    assert_text "Please confirm your email address before logging in."
    assert_current_path new_session_path
  end

  test "user can logout" do
    login_as(@user)
    visit root_path
    
    click_on "Logout"
    
    assert_text "Successfully logged out!"
    assert_text "Get Started"
    assert_current_path root_path
  end

  test "user can edit their profile" do
    login_as(@user)
    visit root_path
    click_on "Edit Profile"
    
    fill_in "Name", with: "Updated Name"
    fill_in "Email", with: "updated@example.com"
    click_on "Update Profile"
    
    assert_text "Your profile has been updated successfully."
    assert_text "Welcome back, Updated Name!"
  end

  test "user can change their password" do
    login_as(@user)
    visit edit_registration_path
    
    fill_in "New Password (leave blank to keep current)", with: "newpassword123"
    fill_in "Confirm New Password", with: "newpassword123"
    click_on "Update Profile"
    
    assert_text "Your profile has been updated successfully."
    
    # Test login with new password
    click_on "Logout"
    click_on "Login"
    fill_in "Email", with: @user.email
    fill_in "Password", with: "newpassword123"
    click_on "Login"
    
    assert_text "Successfully logged in!"
  end

  test "user can request password reset" do
    visit root_path
    click_on "Login"
    click_on "Forgot your password?"
    
    fill_in "Email", with: @user.email
    click_on "Send Reset Instructions"
    
    assert_text "Password reset instructions have been sent to your email."
    assert_current_path new_session_path
  end

  test "user can reset password with valid token" do
    @user.generate_reset_password_token!
    visit edit_password_reset_path(@user.reset_password_token)
    
    fill_in "New Password", with: "newpassword123"
    fill_in "Confirm New Password", with: "newpassword123"
    click_on "Update Password"
    
    assert_text "Your password has been reset successfully."
    assert_text "Welcome back, #{@user.display_name}!"
    assert_current_path root_path
  end

  test "user cannot reset password with invalid token" do
    visit edit_password_reset_path("invalid_token")
    
    assert_text "Invalid password reset token."
    assert_current_path new_password_reset_path
  end

  test "authenticated user is redirected from auth pages" do
    login_as(@user)
    
    visit new_session_path
    assert_text "You are already logged in."
    assert_current_path root_path
    
    visit new_registration_path
    assert_text "You are already logged in."
    assert_current_path root_path
    
    visit new_password_reset_path
    assert_text "You are already logged in."
    assert_current_path root_path
  end

  test "unauthenticated user is redirected from protected pages" do
    visit edit_registration_path
    assert_text "You must be logged in to access this page."
    assert_current_path new_session_path
  end

  private

  def login_as(user)
    visit new_session_path
    fill_in "Email", with: user.email
    fill_in "Password", with: "password123"
    click_on "Login"
  end
end 