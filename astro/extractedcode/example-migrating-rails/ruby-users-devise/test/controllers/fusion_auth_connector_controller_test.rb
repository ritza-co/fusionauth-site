require "test_helper"

class FusionAuthConnectorControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:one) # Devise fixture user
    @valid_params = {
      loginId: @user.email,
      password: 'password' # Devise default test password
    }
  end

  test "should authenticate valid devise user and return user data" do
    post '/fusionauth/connector', params: @valid_params, as: :json
    
    assert_response :success
    
    json_response = JSON.parse(response.body)
    user_data = json_response['user']
    
    # Verify required fields
    assert_equal @user.email, user_data['email']
    assert_equal @user.email, user_data['username']
    assert_not_nil user_data['fullName']
    assert_equal 'password', user_data['password']
    assert_equal false, user_data['passwordChangeRequired']
    
    # Verify UUID format
    assert_match(/\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i, user_data['id'])
    
    # Verify registrations
    assert_equal 1, user_data['registrations'].length
    registration = user_data['registrations'].first
    assert_equal 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e', registration['applicationId']
    assert_equal ['user'], registration['roles']
    
    # Verify migration data
    migration_data = user_data['data']
    assert_equal 'devise_authentication', migration_data['migrated_from']
    assert_equal @user.id, migration_data['original_id']
    assert_not_nil migration_data['migrated_at']
  end

  test "should return 404 for invalid credentials" do
    invalid_params = {
      loginId: @user.email,
      password: 'wrongpassword'
    }
    
    post '/fusionauth/connector', params: invalid_params, as: :json
    
    assert_response :not_found
  end

  test "should return 404 for non-existent user" do
    invalid_params = {
      loginId: 'nonexistent@example.com',
      password: 'password'
    }
    
    post '/fusionauth/connector', params: invalid_params, as: :json
    
    assert_response :not_found
  end

  test "should return 400 for missing parameters" do
    post '/fusionauth/connector', params: { loginId: @user.email }, as: :json
    assert_response :bad_request
    
    post '/fusionauth/connector', params: { password: 'password' }, as: :json
    assert_response :bad_request
  end
end 