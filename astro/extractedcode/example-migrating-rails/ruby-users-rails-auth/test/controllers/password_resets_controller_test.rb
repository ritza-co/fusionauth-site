require "test_helper"

class PasswordResetsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:admin)
    @user_with_token = users(:with_reset_token)
  end

  test "should get new" do
    get new_password_reset_path
    assert_response :success
    assert_select "h1", "Reset Password"
    assert_select "form"
  end

  test "should redirect to root when already logged in" do
    sign_in_as(@user)
    get new_password_reset_path
    assert_redirected_to root_path
    assert_equal "You are already logged in.", flash[:notice]
  end

  test "should create password reset for existing user" do
    post password_reset_path, params: { email: @user.email }
    assert_redirected_to new_session_path
    assert_equal "Password reset instructions have been sent to your email.", flash[:notice]
    
    @user.reload
    assert_not_nil @user.reset_password_token
    assert_not_nil @user.reset_password_sent_at
  end

  test "should handle case insensitive email" do
    post password_reset_path, params: { email: @user.email.upcase }
    assert_redirected_to new_session_path
    assert_equal "Password reset instructions have been sent to your email.", flash[:notice]
    
    @user.reload
    assert_not_nil @user.reset_password_token
  end

  test "should not create password reset for non-existing user" do
    post password_reset_path, params: { email: "nonexistent@example.com" }
    assert_response :unprocessable_entity
    assert_select ".alert", "Email address not found."
  end

  test "should get edit with valid token" do
    get edit_password_reset_path(@user_with_token.reset_password_token)
    assert_response :success
    assert_select "h1", "Set New Password"
    assert_select "form"
  end

  test "should redirect to new with invalid token" do
    get edit_password_reset_path("invalid_token")
    assert_redirected_to new_password_reset_path
    assert_equal "Invalid password reset token.", flash[:alert]
  end

  test "should redirect to root when already logged in for edit" do
    sign_in_as(@user)
    get edit_password_reset_path(@user_with_token.reset_password_token)
    assert_redirected_to root_path
    assert_equal "You are already logged in.", flash[:notice]
  end

  test "should update password with valid params and token" do
    patch update_password_reset_path(@user_with_token.reset_password_token), params: {
      user: {
        password: "newpassword123",
        password_confirmation: "newpassword123"
      }
    }
    
    assert_redirected_to root_path
    assert_equal "Your password has been reset successfully.", flash[:notice]
    assert_equal @user_with_token.id, session[:user_id]
    
    @user_with_token.reload
    assert @user_with_token.authenticate("newpassword123")
    assert_nil @user_with_token.reset_password_token
    assert_nil @user_with_token.reset_password_sent_at
  end

  test "should not update password with invalid params" do
    patch update_password_reset_path(@user_with_token.reset_password_token), params: {
      user: {
        password: "short",
        password_confirmation: "different"
      }
    }
    
    assert_response :unprocessable_entity
    assert_select ".error-messages"
    
    @user_with_token.reload
    assert_not_nil @user_with_token.reset_password_token
    assert @user_with_token.authenticate("password123")
  end

  test "should not update password with expired token" do
    @user_with_token.update!(reset_password_sent_at: 3.hours.ago)
    
    patch update_password_reset_path(@user_with_token.reset_password_token), params: {
      user: {
        password: "newpassword123",
        password_confirmation: "newpassword123"
      }
    }
    
    assert_redirected_to new_password_reset_path
    assert_equal "Password reset token has expired. Please request a new one.", flash[:alert]
    
    @user_with_token.reload
    assert @user_with_token.authenticate("password123")
  end

  test "should not update password with invalid token" do
    patch update_password_reset_path("invalid_token"), params: {
      user: {
        password: "newpassword123",
        password_confirmation: "newpassword123"
      }
    }
    
    assert_redirected_to new_password_reset_path
    assert_equal "Invalid password reset token.", flash[:alert]
  end

  test "should redirect to root when already logged in for update" do
    sign_in_as(@user)
    patch update_password_reset_path(@user_with_token.reset_password_token), params: {
      user: {
        password: "newpassword123",
        password_confirmation: "newpassword123"
      }
    }
    
    assert_redirected_to root_path
    assert_equal "You are already logged in.", flash[:notice]
  end

  private

  def sign_in_as(user)
    post session_path, params: { email: user.email, password: "password123" }
  end
end
