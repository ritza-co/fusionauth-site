class SessionsController < ApplicationController
  def create
    # Handle OAuth callback from Google
    auth = request.env['omniauth.auth']
    
    if auth.present?
      # Find or create user from OAuth data
      user = User.from_omniauth(auth)
      
      if user.persisted?
        # Successfully authenticated
        session[:user_id] = user.id
        redirect_to root_path, notice: "Successfully signed in with #{user.provider_name}!"
      else
        # User creation failed
        redirect_to root_path, alert: "There was an error signing you in. Please try again."
      end
    else
      # No OAuth data received
      redirect_to root_path, alert: "Authentication failed. Please try again."
    end
  rescue => e
    # Handle any other errors
    Rails.logger.error "OAuth authentication error: #{e.message}"
    redirect_to root_path, alert: "Authentication failed. Please try again."
  end
  
  def destroy
    # Sign out user
    session.delete(:user_id)
    redirect_to root_path, notice: "You have been signed out."
  end
  
  def failure
    # Handle OAuth failure
    error_msg = params[:message] || "Authentication failed"
    redirect_to root_path, alert: "Sign in failed: #{error_msg.humanize}"
  end
end 