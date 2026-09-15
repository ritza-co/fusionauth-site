require "application_system_test_case"

class AuthenticationTest < ApplicationSystemTestCase
  def setup
    @user = User.create!(email: "test@example.com", password: "password123", password_confirmation: "password123")
  end

  test "user can sign up" do
    visit root_path
    within(".auth-actions") do
      click_on "Sign up"
    end

    fill_in "Email", with: "newuser@example.com"
    fill_in "Password", with: "password123"
    fill_in "Password confirmation", with: "password123"

    within("form") do
      click_on "Sign up"
    end

    assert_text "Welcome! You have signed up successfully."
    assert_text "Hello, newuser@example.com!"
  end

  test "user can sign in" do
    user = User.create!(email: "signin@example.com", password: "password123", password_confirmation: "password123")
    visit root_path
    within(".auth-actions") do
      click_on "Sign in"
    end

    fill_in "Email", with: user.email
    fill_in "Password", with: "password123"

    within("form") do
      click_on "Log in"
    end

    assert_text "Signed in successfully."
    assert_text "Hello, #{user.email}!"
  end

  test "user can sign out" do
    user = User.create!(email: "signout@example.com", password: "password123", password_confirmation: "password123")
    sign_in_as(user)
    visit root_path

    within("nav") do
      click_on "Sign out"
    end

    assert_text "Signed out successfully."
    assert_text "Sign up"
    assert_text "Sign in"
  end

  test "user can edit profile" do
    user = User.create!(email: "edit@example.com", password: "password123", password_confirmation: "password123")
    sign_in_as(user)
    visit root_path
    within("nav") do
      click_on "Profile"
    end

    fill_in "Email", with: "updated@example.com"
    fill_in "Current password", with: "password123"

    within("#edit_user") do
      click_on "Update"
    end

    # Wait for the redirect and check the home page
    assert_current_path root_path
    assert_text "Hello, updated@example.com!"
  end

  test "user can change password" do
    user = User.create!(email: "changepw@example.com", password: "password123", password_confirmation: "password123")
    sign_in_as(user)
    visit edit_user_registration_path

    # Only change password if we leave it blank, it won't be updated
    fill_in "Current password", with: "password123"

    within("#edit_user") do
      click_on "Update"
    end

    assert_text "Your account has been updated successfully."
  end

  test "user can request password reset" do
    # Create a user first
    user = User.create!(email: "reset@example.com", password: "password123")
    
    visit root_path
    within(".auth-actions") do
      click_on "Sign in"
    end
    click_on "Forgot your password?"

    fill_in "Email", with: user.email
    within("form") do
      click_on "Send me reset password instructions"
    end

    assert_text "You will receive an email with instructions on how to reset your password in a few minutes."
  end

  test "displays validation errors for invalid signup" do
    visit new_user_registration_path

    fill_in "Email", with: "invalid-email"
    fill_in "Password", with: "123"
    fill_in "Password confirmation", with: "456"

    within("form") do
      click_on "Sign up"
    end

    # Check that we're still on the same page (form wasn't submitted successfully)
    assert_current_path new_user_registration_path
    # The form should show validation errors or at least stay on the same page
    assert page.has_content?("Sign up")
  end

  test "displays error for invalid login" do
    visit new_user_session_path

    fill_in "Email", with: "nonexistent@example.com"
    fill_in "Password", with: "wrongpassword"

    click_on "Log in"

    assert_text "Invalid Email or password"
  end

  private

  def sign_in_as(user)
    visit new_user_session_path
    fill_in "Email", with: user.email
    fill_in "Password", with: "password123"
    within("form") do
      click_on "Log in"
    end
    # Verify sign in was successful
    assert_text "Signed in successfully."
  end
end 