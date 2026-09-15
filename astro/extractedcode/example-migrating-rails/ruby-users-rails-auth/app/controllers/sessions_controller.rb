class SessionsController < ApplicationController
  before_action :require_no_authentication, only: [:new, :create]
  
  def new
    # Login form
  end

  def create
    user = User.find_by(email: params[:email]&.downcase)
    
    if user&.authenticate(params[:password])
      if user.confirmed?
        sign_in(user)
        redirect_to root_path, notice: 'Successfully logged in!'
      else
        redirect_to new_session_path, alert: 'Please confirm your email address before logging in.'
      end
    else
      flash.now[:alert] = 'Invalid email or password.'
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    sign_out
    redirect_to root_path, notice: 'Successfully logged out!'
  end
end
