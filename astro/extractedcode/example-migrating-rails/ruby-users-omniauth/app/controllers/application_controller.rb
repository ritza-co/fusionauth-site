class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  
  # Authentication helpers
  helper_method :current_user, :user_signed_in?
  
  protected
  
  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end
  
  def user_signed_in?
    current_user.present?
  end
  
  def authenticate_user!
    unless user_signed_in?
      redirect_to root_path, alert: "You must be signed in to access this page."
    end
  end
  
  def require_no_authentication
    if user_signed_in?
      redirect_to root_path, notice: "You are already signed in."
    end
  end
end
