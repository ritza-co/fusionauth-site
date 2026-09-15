class PasswordResetsController < ApplicationController
  before_action :require_no_authentication
  before_action :find_user_by_token, only: [:edit, :update]
  
  def new
    # Password reset request form
  end

  def create
    @user = User.find_by(email: params[:email]&.downcase)
    
    if @user
      @user.generate_reset_password_token!
      # In production, send password reset email here
      # UserMailer.password_reset(@user).deliver_now
      redirect_to new_session_path, notice: 'Password reset instructions have been sent to your email.'
    else
      flash.now[:alert] = 'Email address not found.'
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    # Password reset form
  end

  def update
    if @user.reset_password_token_valid?
      if @user.update(password_params)
        @user.clear_reset_password_token!
        sign_in(@user)
        redirect_to root_path, notice: 'Your password has been reset successfully.'
      else
        render :edit, status: :unprocessable_entity
      end
    else
      redirect_to new_password_reset_path, alert: 'Password reset token has expired. Please request a new one.'
    end
  end
  
  private
  
  def find_user_by_token
    @user = User.find_by(reset_password_token: params[:token])
    
    unless @user
      redirect_to new_password_reset_path, alert: 'Invalid password reset token.'
    end
  end
  
  def password_params
    params.require(:user).permit(:password, :password_confirmation)
  end
end
