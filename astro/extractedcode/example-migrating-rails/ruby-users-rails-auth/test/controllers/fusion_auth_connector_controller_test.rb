require "test_helper"

class FusionAuthConnectorControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:user) # Use the 'user' fixture
    @valid_params = {
      loginId: @user.email,
      password: 'password123' # This matches the fixture password
    }
  end

  test "should authenticate valid user and return user data" do
    post '/fusionauth/connector', params: @valid_params, as: :json
    
    assert_response :success
    
    json_response = JSON.parse(response.body)
    user_data = json_response['user']
    
    # Verify required fields
    assert_equal @user.email, user_data['email']
    assert_equal @user.email, user_data['username']
    assert_equal @user.name, user_data['fullName']
    assert_equal @user.confirmed?, user_data['verified']
    assert_equal @user.confirmed?, user_data['active']
    assert_equal 'password123', user_data['password']
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
    assert_equal 'rails_authentication', migration_data['migrated_from']
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
      password: 'password123'
    }
    
    post '/fusionauth/connector', params: invalid_params, as: :json
    
    assert_response :not_found
  end

  test "should return 400 for missing loginId" do
    invalid_params = {
      password: 'password123'
    }
    
    post '/fusionauth/connector', params: invalid_params, as: :json
    
    assert_response :bad_request
  end

  test "should return 400 for missing password" do
    invalid_params = {
      loginId: @user.email
    }
    
    post '/fusionauth/connector', params: invalid_params, as: :json
    
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

  test "should handle names correctly" do
    # Test user with full name
    user_with_full_name = User.create!(
      name: 'John Michael Doe',
      email: 'johnmichael@example.com',
      password: 'password123',
      confirmed_at: Time.current
    )
    
    params = {
      loginId: user_with_full_name.email,
      password: 'password123'
    }
    
    post '/fusionauth/connector', params: params, as: :json
    
    assert_response :success
    
    json_response = JSON.parse(response.body)
    user_data = json_response['user']
    
    assert_equal 'John', user_data['firstName']
    assert_equal 'Michael Doe', user_data['lastName']
    assert_equal 'John Michael Doe', user_data['fullName']
  end

  test "should handle single name correctly" do
    # Test user with single name
    user_with_single_name = User.create!(
      name: 'Madonna',
      email: 'madonna@example.com',
      password: 'password123',
      confirmed_at: Time.current
    )
    
    params = {
      loginId: user_with_single_name.email,
      password: 'password123'
    }
    
    post '/fusionauth/connector', params: params, as: :json
    
    assert_response :success
    
    json_response = JSON.parse(response.body)
    user_data = json_response['user']
    
    assert_equal 'Madonna', user_data['firstName']
    assert_equal '', user_data['lastName']
    assert_equal 'Madonna', user_data['fullName']
  end
end 