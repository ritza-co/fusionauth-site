require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  def setup
    super
    @user = users(:google_user)
  end

  test "should handle successful OAuth callback" do
    auth_hash = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "123456789",
      info: {
        name: "Test User",
        email: "test@example.com",
        image: "https://example.com/avatar.jpg"
      }
    })
    
    OmniAuth.config.mock_auth[:google_oauth2] = auth_hash

    get "/auth/google_oauth2/callback"
    
    assert_redirected_to root_path
    follow_redirect!
    assert_select "div.alert-success", text: /Successfully signed in with Google!/
  end

  test "should handle OAuth failure" do
    get "/auth/failure", params: { message: "access_denied" }
    
    assert_redirected_to root_path
    follow_redirect!
    assert_select "div.alert-danger", text: /Sign in failed: Access denied/
  end

  test "should handle OAuth failure without message" do
    get "/auth/failure"
    
    assert_redirected_to root_path
    follow_redirect!
    assert_select "div.alert-danger", text: /Sign in failed: Authentication failed/
  end

  test "should sign out user" do
    # Sign in user first
    sign_in_user
    
    # Verify user is signed in
    get root_path
    assert_select "h1", text: /Welcome back/
    
    # Sign out
    delete "/sign_out"
    
    assert_redirected_to root_path
    follow_redirect!
    assert_select "div.alert-success", text: /You have been signed out/
  end

  test "should handle missing OAuth data" do
    # Clear any mock auth data and simulate empty env
    OmniAuth.config.mock_auth[:google_oauth2] = nil
    
    # Directly call the controller action with empty omniauth.auth
    post "/auth/google_oauth2/callback", env: { "omniauth.auth" => nil }
    
    assert_redirected_to root_path
    follow_redirect!
    assert_select "div.alert-danger", text: /Authentication failed/
  end

  test "should handle user creation failure" do
    # Create a user that will fail validation
    User.any_instance.stubs(:persisted?).returns(false)
    
    auth_hash = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "123456789",
      info: {
        name: "Test User",
        email: "test@example.com",
        image: "https://example.com/avatar.jpg"
      }
    })
    
    OmniAuth.config.mock_auth[:google_oauth2] = auth_hash

    get "/auth/google_oauth2/callback"
    
    assert_redirected_to root_path
    follow_redirect!
    assert_select "div.alert-danger", text: /There was an error signing you in/
  end
end 