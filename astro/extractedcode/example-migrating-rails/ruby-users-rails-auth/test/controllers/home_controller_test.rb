require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:admin)
  end

  test "should get index when not logged in" do
    get root_path
    assert_response :success
    assert_select "h1", "Ruby Users Rails Auth"
    assert_select "h2", "Get Started"
    assert_select "a[href='#{new_session_path}']", "Login"
    assert_select "a[href='#{new_registration_path}']", "Register"
  end

  test "should get index when logged in" do
    sign_in_as(@user)
    get root_path
    assert_response :success
    assert_select "h1", "Ruby Users Rails Auth"
    assert_select "h2", "Welcome back, #{@user.display_name}!"
    assert_select "a[href='#{edit_registration_path}']", "Edit Profile"
    assert_select "a[href='#{destroy_session_path}']", "Logout"
  end

  test "should show correct navigation when not logged in" do
    get root_path
    assert_response :success
    assert_select ".navbar" do
      assert_select "a[href='#{new_session_path}']", "Login"
      assert_select "a[href='#{new_registration_path}']", "Register"
      assert_select "a[href='#{destroy_session_path}']", count: 0
    end
  end

  test "should show correct navigation when logged in" do
    sign_in_as(@user)
    get root_path
    assert_response :success
    assert_select ".navbar" do
      assert_select ".nav-user", text: /Welcome, #{@user.display_name}!/
      assert_select "a[href='#{edit_registration_path}']", "Profile"
      assert_select "a[href='#{destroy_session_path}']", "Logout"
      assert_select "a[href='#{new_session_path}']", count: 0
      assert_select "a[href='#{new_registration_path}']", count: 0
    end
  end

  private

  def sign_in_as(user)
    post session_path, params: { email: user.email, password: "password123" }
  end
end
