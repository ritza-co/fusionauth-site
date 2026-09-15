require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "should create user with valid attributes" do
    user = User.new(email: "test@example.com", password: "password123", password_confirmation: "password123")
    assert user.valid?
    assert user.save
  end

  test "should not create user without email" do
    user = User.new(password: "password123", password_confirmation: "password123")
    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test "should not create user with invalid email" do
    user = User.new(email: "invalid-email", password: "password123", password_confirmation: "password123")
    assert_not user.valid?
    assert_includes user.errors[:email], "is invalid"
  end

  test "should not create user with short password" do
    user = User.new(email: "test@example.com", password: "123", password_confirmation: "123")
    assert_not user.valid?
    assert_includes user.errors[:password], "is too short (minimum is 6 characters)"
  end

  test "should not create user with mismatched password confirmation" do
    user = User.new(email: "test@example.com", password: "password123", password_confirmation: "different")
    assert_not user.valid?
    assert_includes user.errors[:password_confirmation], "doesn't match Password"
  end

  test "should not create user with duplicate email" do
    User.create!(email: "test@example.com", password: "password123", password_confirmation: "password123")
    user = User.new(email: "test@example.com", password: "password123", password_confirmation: "password123")
    assert_not user.valid?
    assert_includes user.errors[:email], "has already been taken"
  end

  test "should authenticate user with correct password" do
    user = User.create!(email: "test@example.com", password: "password123", password_confirmation: "password123")
    assert user.valid_password?("password123")
    assert_not user.valid_password?("wrongpassword")
  end
end
