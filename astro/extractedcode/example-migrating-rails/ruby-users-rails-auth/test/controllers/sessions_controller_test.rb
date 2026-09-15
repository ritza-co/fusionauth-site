require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:admin)
  end

  test "should get new" do
    get new_session_path
    assert_response :success
    assert_select "h1", "Login"
    assert_select "form"
  end

  test "should redirect to root when already logged in" do
    sign_in_as(@user)
    get new_session_path
    assert_redirected_to root_path
    assert_equal "You are already logged in.", flash[:notice]
  end

  test "should create session with valid credentials" do
    post session_path, params: { email: @user.email, password: "password123" }
    assert_redirected_to root_path
    assert_equal "Successfully logged in!", flash[:notice]
    assert_equal @user.id, session[:user_id]
  end

  test "should not create session with invalid email" do
    post session_path, params: { email: "wrong@example.com", password: "password123" }
    assert_response :unprocessable_entity
    assert_select ".alert", "Invalid email or password."
    assert_nil session[:user_id]
  end

  test "should not create session with invalid password" do
    post session_path, params: { email: @user.email, password: "wrong_password" }
    assert_response :unprocessable_entity
    assert_select ".alert", "Invalid email or password."
    assert_nil session[:user_id]
  end

  test "should not create session for unconfirmed user" do
    unconfirmed_user = users(:unconfirmed)
    post session_path, params: { email: unconfirmed_user.email, password: "password123" }
    assert_redirected_to new_session_path
    assert_equal "Please confirm your email address before logging in.", flash[:alert]
    assert_nil session[:user_id]
  end

  test "should handle case insensitive email" do
    post session_path, params: { email: @user.email.upcase, password: "password123" }
    assert_redirected_to root_path
    assert_equal "Successfully logged in!", flash[:notice]
    assert_equal @user.id, session[:user_id]
  end

  test "should destroy session" do
    sign_in_as(@user)
    delete destroy_session_path
    assert_redirected_to root_path
    assert_equal "Successfully logged out!", flash[:notice]
    assert_nil session[:user_id]
  end

  test "should update tracked fields on login" do
    old_sign_in_count = @user.sign_in_count
    post session_path, params: { email: @user.email, password: "password123" }
    
    @user.reload
    assert_equal old_sign_in_count + 1, @user.sign_in_count
    assert_not_nil @user.current_sign_in_at
    assert_equal "127.0.0.1", @user.current_sign_in_ip
  end

  private

  def sign_in_as(user)
    post session_path, params: { email: user.email, password: "password123" }
  end
end
