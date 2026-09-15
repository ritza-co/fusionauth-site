require "test_helper"

class UserTest < ActiveSupport::TestCase
  def setup
    @valid_attributes = {
      email: "test@example.com",
      name: "Test User",
      provider: "google_oauth2",
      uid: "123456789",
      image_url: "https://example.com/avatar.jpg",
      raw_info: {
        "provider" => "google_oauth2",
        "uid" => "123456789",
        "info" => {
          "name" => "Test User",
          "email" => "test@example.com",
          "given_name" => "Test",
          "family_name" => "User",
          "image" => "https://example.com/avatar.jpg",
          "verified_email" => true,
          "locale" => "en"
        }
      },
      active: true
    }
  end

  test "should be valid with valid attributes" do
    user = User.new(@valid_attributes)
    assert user.valid?
  end

  test "should require provider" do
    user = User.new(@valid_attributes.except(:provider))
    assert_not user.valid?
    assert_includes user.errors[:provider], "can't be blank"
  end

  test "should require uid" do
    user = User.new(@valid_attributes.except(:uid))
    assert_not user.valid?
    assert_includes user.errors[:uid], "can't be blank"
  end

  test "should require email" do
    user = User.new(@valid_attributes.except(:email))
    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test "should validate email format" do
    user = User.new(@valid_attributes.merge(email: "invalid-email"))
    assert_not user.valid?
    assert_includes user.errors[:email], "is invalid"
  end

  test "should enforce uniqueness of uid scoped to provider" do
    User.create!(@valid_attributes)
    duplicate_user = User.new(@valid_attributes)
    assert_not duplicate_user.valid?
    assert_includes duplicate_user.errors[:uid], "has already been taken"
  end

  test "should allow same uid for different providers" do
    User.create!(@valid_attributes)
    different_provider_user = User.new(@valid_attributes.merge(provider: "github"))
    assert different_provider_user.valid?
  end

  test "should have default active value" do
    user = User.new(@valid_attributes.except(:active))
    assert user.active
  end

  test "display_name should return name when present" do
    user = User.new(@valid_attributes)
    assert_equal "Test User", user.display_name
  end

  test "display_name should return humanized email when name is blank" do
    user = User.new(@valid_attributes.merge(name: ""))
    assert_equal "Test", user.display_name
  end

  test "provider_name should return human-readable provider names" do
    user = User.new(@valid_attributes)
    assert_equal "Google", user.provider_name

    user.provider = "github"
    assert_equal "GitHub", user.provider_name

    user.provider = "facebook"
    assert_equal "Facebook", user.provider_name

    user.provider = "twitter"
    assert_equal "Twitter", user.provider_name

    user.provider = "developer"
    assert_equal "Developer", user.provider_name

    user.provider = "custom_provider"
    assert_equal "Custom provider", user.provider_name
  end

  test "avatar_url should return image_url when present" do
    user = User.new(@valid_attributes)
    assert_equal "https://example.com/avatar.jpg", user.avatar_url
  end

  test "avatar_url should return gravatar when image_url is blank" do
    user = User.new(@valid_attributes.merge(image_url: ""))
    gravatar_url = user.avatar_url
    assert_includes gravatar_url, "gravatar.com"
    assert_includes gravatar_url, "s=50"
    assert_includes gravatar_url, "d=identicon"
  end

  test "avatar_url should accept custom size" do
    user = User.new(@valid_attributes.merge(image_url: ""))
    gravatar_url = user.avatar_url(100)
    assert_includes gravatar_url, "s=100"
  end

  test "active scope should return only active users" do
    active_user = User.create!(@valid_attributes)
    inactive_user = User.create!(@valid_attributes.merge(
      uid: "inactive_user",
      email: "inactive@example.com",
      active: false
    ))

    active_users = User.active
    assert_includes active_users, active_user
    assert_not_includes active_users, inactive_user
  end

  test "by_provider scope should return users by provider" do
    google_user = User.create!(@valid_attributes)
    github_user = User.create!(@valid_attributes.merge(
      provider: "github",
      uid: "github_user",
      email: "github@example.com"
    ))

    google_users = User.by_provider("google_oauth2")
    assert_includes google_users, google_user
    assert_not_includes google_users, github_user
  end

  test "from_omniauth should create new user" do
    auth_hash = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "new_user_123",
      info: {
        name: "New User",
        email: "newuser@example.com",
        image: "https://example.com/new_avatar.jpg"
      }
    })

    assert_difference "User.count", 1 do
      user = User.from_omniauth(auth_hash)
      assert user.persisted?
      assert_equal "google_oauth2", user.provider
      assert_equal "new_user_123", user.uid
      assert_equal "New User", user.name
      assert_equal "newuser@example.com", user.email
      assert_equal "https://example.com/new_avatar.jpg", user.image_url
      assert user.active
    end
  end

  test "from_omniauth should update existing user" do
    existing_user = User.create!(@valid_attributes)
    
    auth_hash = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "123456789",
      info: {
        name: "Updated Name",
        email: "updated@example.com",
        image: "https://example.com/updated_avatar.jpg"
      }
    })

    assert_no_difference "User.count" do
      user = User.from_omniauth(auth_hash)
      assert_equal existing_user.id, user.id
      assert_equal "Updated Name", user.name
      assert_equal "updated@example.com", user.email
      assert_equal "https://example.com/updated_avatar.jpg", user.image_url
    end
  end

  test "find_or_create_by_email should find existing user" do
    existing_user = User.create!(@valid_attributes)
    
    assert_no_difference "User.count" do
      user = User.find_or_create_by_email("test@example.com")
      assert_equal existing_user.id, user.id
    end
  end

  test "find_or_create_by_email should create new user" do
    assert_difference "User.count", 1 do
      user = User.find_or_create_by_email("new@example.com")
      assert user.persisted?
      assert_equal "new@example.com", user.email
      assert_equal "email", user.provider
      assert_equal "new@example.com", user.uid
      assert_equal "New", user.name
      assert user.active
    end
  end
end
