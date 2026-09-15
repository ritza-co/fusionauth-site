class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  
  before_action :current_user
  
  private
  
  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  rescue ActiveRecord::RecordNotFound
    session[:user_id] = nil
    @current_user = nil
  end
  
  def user_signed_in?
    current_user.present?
  end
  
  def require_authentication
    unless user_signed_in?
      redirect_to new_session_path, alert: 'You must be logged in to access this page.'
    end
  end
  
  def require_no_authentication
    if user_signed_in?
      redirect_to root_path, notice: 'You are already logged in.'
    end
  end
  
  def sign_in(user)
    session[:user_id] = user.id
    user.update_tracked_fields!(request) if user.respond_to?(:update_tracked_fields!)
    @current_user = user
  end
  
  def sign_out
    session[:user_id] = nil
    @current_user = nil
  end
  
  # Make current_user and user_signed_in? available in views
  helper_method :current_user, :user_signed_in?
end
