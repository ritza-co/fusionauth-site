require "test_helper"

class RegistrationsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:admin)
  end

  test "should get new" do
    get new_registration_path
    assert_response :success
    assert_select "h1", "Create Account"
    assert_select "form"
  end

  test "should redirect to root when already logged in" do
    sign_in_as(@user)
    get new_registration_path
    assert_redirected_to root_path
    assert_equal "You are already logged in.", flash[:notice]
  end

  test "should create user with valid params" do
    assert_difference('User.count') do
      post registration_path, params: {
        user: {
          name: "New User",
          email: "new@example.com",
          password: "password123",
          password_confirmation: "password123"
        }
      }
    end
    
    assert_redirected_to root_path
    assert_equal "Welcome! Your account has been created successfully.", flash[:notice]
    
    new_user = User.find_by(email: "new@example.com")
    assert new_user.confirmed?
    assert_equal new_user.id, session[:user_id]
  end

  test "should not create user with invalid params" do
    assert_no_difference('User.count') do
      post registration_path, params: {
        user: {
          name: "",
          email: "invalid_email",
          password: "short",
          password_confirmation: "different"
        }
      }
    end
    
    assert_response :unprocessable_entity
    assert_select ".error-messages"
  end

  test "should not create user with duplicate email" do
    assert_no_difference('User.count') do
      post registration_path, params: {
        user: {
          name: "Duplicate User",
          email: @user.email,
          password: "password123",
          password_confirmation: "password123"
        }
      }
    end
    
    assert_response :unprocessable_entity
    assert_select ".error-messages"
  end

  test "should get edit when logged in" do
    sign_in_as(@user)
    get edit_registration_path
    assert_response :success
    assert_select "h1", "Edit Profile"
    assert_select "form"
  end

  test "should redirect to login when not logged in" do
    get edit_registration_path
    assert_redirected_to new_session_path
    assert_equal "You must be logged in to access this page.", flash[:alert]
  end

  test "should update user with valid params" do
    sign_in_as(@user)
    patch update_registration_path, params: {
      user: {
        name: "Updated Name",
        email: "updated@example.com"
      }
    }
    
    assert_redirected_to edit_registration_path
    assert_equal "Your profile has been updated successfully.", flash[:notice]
    
    @user.reload
    assert_equal "Updated Name", @user.name
    assert_equal "updated@example.com", @user.email
  end

  test "should update password when provided" do
    sign_in_as(@user)
    patch update_registration_path, params: {
      user: {
        name: @user.name,
        email: @user.email,
        password: "newpassword123",
        password_confirmation: "newpassword123"
      }
    }
    
    assert_redirected_to edit_registration_path
    assert_equal "Your profile has been updated successfully.", flash[:notice]
    
    @user.reload
    assert @user.authenticate("newpassword123")
  end

  test "should not update password when blank" do
    sign_in_as(@user)
    old_password_digest = @user.password_digest
    
    patch update_registration_path, params: {
      user: {
        name: "Updated Name",
        email: @user.email,
        password: "",
        password_confirmation: ""
      }
    }
    
    assert_redirected_to edit_registration_path
    @user.reload
    assert_equal old_password_digest, @user.password_digest
    assert @user.authenticate("password123")
  end

  test "should not update user with invalid params" do
    sign_in_as(@user)
    patch update_registration_path, params: {
      user: {
        name: "",
        email: "invalid_email"
      }
    }
    
    assert_response :unprocessable_entity
    assert_select ".error-messages"
  end

  test "should not update user when not logged in" do
    patch update_registration_path, params: {
      user: {
        name: "Updated Name"
      }
    }
    
    assert_redirected_to new_session_path
    assert_equal "You must be logged in to access this page.", flash[:alert]
  end

  private

  def sign_in_as(user)
    post session_path, params: { email: user.email, password: "password123" }
  end
end
