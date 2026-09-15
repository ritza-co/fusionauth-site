require "test_helper"

class UserTest < ActiveSupport::TestCase
  def setup
    @user = User.new(
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      password_confirmation: "password123"
    )
  end

  # Validation tests
  test "should be valid with valid attributes" do
    assert @user.valid?
  end

  test "name should be present" do
    @user.name = ""
    assert_not @user.valid?
    assert_includes @user.errors[:name], "can't be blank"
  end

  test "name should not be too short" do
    @user.name = "a"
    assert_not @user.valid?
    assert_includes @user.errors[:name], "is too short (minimum is 2 characters)"
  end

  test "name should not be too long" do
    @user.name = "a" * 51
    assert_not @user.valid?
    assert_includes @user.errors[:name], "is too long (maximum is 50 characters)"
  end

  test "email should be present" do
    @user.email = ""
    assert_not @user.valid?
    assert_includes @user.errors[:email], "can't be blank"
  end

  test "email should be unique" do
    duplicate_user = @user.dup
    @user.save
    assert_not duplicate_user.valid?
    assert_includes duplicate_user.errors[:email], "has already been taken"
  end

  test "email should be case insensitive" do
    duplicate_user = @user.dup
    duplicate_user.email = @user.email.upcase
    @user.save
    assert_not duplicate_user.valid?
  end

  test "email should have valid format" do
    valid_emails = %w[user1@example.com USER2@foo.COM A_US-ER@foo.bar.org first.last@foo.jp alice+bob@baz.cn]
    valid_emails.each_with_index do |valid_email, index|
      user = User.new(name: "Test User #{index}", email: valid_email, password: "password123", password_confirmation: "password123")
      assert user.valid?, "#{valid_email.inspect} should be valid, but got errors: #{user.errors.full_messages}"
    end
  end

  test "email should reject invalid format" do
    invalid_emails = %w[user@example,com user_at_foo.org user.name@example. foo@bar_baz.com foo@bar+baz.com]
    invalid_emails.each do |invalid_email|
      @user.email = invalid_email
      assert_not @user.valid?, "#{invalid_email.inspect} should be invalid"
    end
  end

  test "password should be present for new records" do
    @user.password = @user.password_confirmation = nil
    assert_not @user.valid?
    assert_includes @user.errors[:password], "can't be blank"
  end

  test "password should have minimum length" do
    @user.password = @user.password_confirmation = "a" * 5
    assert_not @user.valid?
    assert_includes @user.errors[:password], "is too short (minimum is 6 characters)"
  end

  test "password should match confirmation" do
    @user.password_confirmation = "different"
    assert_not @user.valid?
    assert_includes @user.errors[:password_confirmation], "doesn't match Password"
  end

  # Callback tests
  test "email should be downcased before saving" do
    mixed_case_email = "Foo@ExAMPle.CoM"
    @user.email = mixed_case_email
    @user.save
    assert_equal mixed_case_email.downcase, @user.reload.email
  end

  test "sign_in_count should default to 0" do
    @user.save
    assert_equal 0, @user.sign_in_count
  end

  # Scope tests
  test "confirmed scope should return only confirmed users" do
    confirmed_user = users(:admin)
    unconfirmed_user = users(:unconfirmed)
    
    confirmed_users = User.confirmed
    assert_includes confirmed_users, confirmed_user
    assert_not_includes confirmed_users, unconfirmed_user
  end

  test "unconfirmed scope should return only unconfirmed users" do
    confirmed_user = users(:admin)
    unconfirmed_user = users(:unconfirmed)
    
    unconfirmed_users = User.unconfirmed
    assert_includes unconfirmed_users, unconfirmed_user
    assert_not_includes unconfirmed_users, confirmed_user
  end

  # Instance method tests
  test "confirmed? should return true for confirmed users" do
    confirmed_user = users(:admin)
    assert confirmed_user.confirmed?
  end

  test "confirmed? should return false for unconfirmed users" do
    unconfirmed_user = users(:unconfirmed)
    assert_not unconfirmed_user.confirmed?
  end

  test "confirm! should set confirmed_at timestamp" do
    unconfirmed_user = users(:unconfirmed)
    assert_nil unconfirmed_user.confirmed_at
    
    unconfirmed_user.confirm!
    assert_not_nil unconfirmed_user.confirmed_at
    assert unconfirmed_user.confirmed?
  end

  test "display_name should return name when present" do
    user = users(:admin)
    assert_equal user.name, user.display_name
  end

  test "display_name should return formatted email when name is blank" do
    user = users(:admin)
    user.name = ""
    expected = user.email.split('@').first.titleize
    assert_equal expected, user.display_name
  end

  test "generate_reset_password_token! should set token and timestamp" do
    user = users(:admin)
    user.generate_reset_password_token!
    
    assert_not_nil user.reset_password_token
    assert_not_nil user.reset_password_sent_at
    assert user.reset_password_token.length > 10
  end

  test "reset_password_token_valid? should return true for recent tokens" do
    user = users(:with_reset_token)
    assert user.reset_password_token_valid?
  end

  test "reset_password_token_valid? should return false for expired tokens" do
    user = users(:with_reset_token)
    user.update!(reset_password_sent_at: 3.hours.ago)
    assert_not user.reset_password_token_valid?
  end

  test "reset_password_token_valid? should return false when no token" do
    user = users(:admin)
    assert_not user.reset_password_token_valid?
  end

  test "clear_reset_password_token! should clear token and timestamp" do
    user = users(:with_reset_token)
    user.clear_reset_password_token!
    
    assert_nil user.reset_password_token
    assert_nil user.reset_password_sent_at
  end

  test "update_tracked_fields! should update tracking information" do
    user = users(:admin)
    old_sign_in_count = user.sign_in_count
    old_current_sign_in_at = user.current_sign_in_at
    
    # Mock request object
    request = Struct.new(:remote_ip).new("192.168.1.1")
    
    user.update_tracked_fields!(request)
    
    assert_equal old_sign_in_count + 1, user.sign_in_count
    assert_equal old_current_sign_in_at, user.last_sign_in_at
    assert_not_nil user.current_sign_in_at
    assert_equal "192.168.1.1", user.current_sign_in_ip
  end

  # Authentication tests
  test "should authenticate with correct password" do
    user = users(:admin)
    assert user.authenticate("password123")
  end

  test "should not authenticate with incorrect password" do
    user = users(:admin)
    assert_not user.authenticate("wrong_password")
  end

  test "should not authenticate with nil password" do
    user = users(:admin)
    assert_not user.authenticate(nil)
  end
end
