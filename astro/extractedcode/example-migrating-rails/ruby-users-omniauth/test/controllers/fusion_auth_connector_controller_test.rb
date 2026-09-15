require "test_helper"

class FusionAuthConnectorControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:one) # OmniAuth fixture user
    @valid_params = {
      loginId: @user.email,
      password: "#{@user.provider}:#{@user.uid}" # Provider:UID format
    }
  end

  test "should authenticate valid omniauth user with provider:uid format" do
    post '/fusionauth/connector', params: @valid_params, as: :json
    
    assert_response :success
    
    json_response = JSON.parse(response.body)
    user_data = json_response['user']
    
    # Verify required fields
    assert_equal @user.email, user_data['email']
    assert_equal @user.email, user_data['username']
    assert_equal @user.display_name, user_data['fullName']
    assert_not_nil user_data['password'] # Should generate new password
    assert_equal true, user_data['passwordChangeRequired'] # Should require change
    
    # Verify UUID format
    assert_match(/\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i, user_data['id'])
    
    # Verify registrations
    assert_equal 1, user_data['registrations'].length
    registration = user_data['registrations'].first
    assert_equal 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e', registration['applicationId']
    assert_equal ['user'], registration['roles']
    
    # Verify migration data
    migration_data = user_data['data']
    assert_equal 'omniauth_authentication', migration_data['migrated_from']
    assert_equal @user.id, migration_data['original_id']
    assert_equal @user.provider, migration_data['provider']
    assert_equal @user.uid, migration_data['uid']
    assert_not_nil migration_data['migrated_at']
  end

  test "should authenticate with development migration password" do
    dev_params = {
      loginId: @user.email,
      password: 'omniauth_migration_password'
    }
    
    post '/fusionauth/connector', params: dev_params, as: :json
    
    assert_response :success
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
      password: 'google:12345'
    }
    
    post '/fusionauth/connector', params: invalid_params, as: :json
    
    assert_response :not_found
  end

  test "should return 400 for missing parameters" do
    post '/fusionauth/connector', params: { loginId: @user.email }, as: :json
    assert_response :bad_request
    
    post '/fusionauth/connector', params: { password: 'google:12345' }, as: :json
    assert_response :bad_request
  end

  test "should generate consistent UUID for same user" do
    post '/fusionauth/connector', params: @valid_params, as: :json
    first_response = JSON.parse(response.body)
    first_uuid = first_response['user']['id']
    
    post '/fusionauth/connector', params: @valid_params, as: :json
    second_response = JSON.parse(response.body)
    second_uuid = second_response['user']['id']
    
    assert_equal first_uuid, second_uuid, "UUID should be consistent for the same user"
  end
end 