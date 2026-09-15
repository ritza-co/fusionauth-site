Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Authentication routes
  root "home#index"
  
  # Sessions (login/logout)
  get    "login",  to: "sessions#new",     as: :new_session
  post   "login",  to: "sessions#create",  as: :session
  delete "logout", to: "sessions#destroy", as: :destroy_session
  
  # Registration
  get  "register", to: "registrations#new",    as: :new_registration
  post "register", to: "registrations#create", as: :registration
  get  "profile",  to: "registrations#edit",   as: :edit_registration
  patch "profile", to: "registrations#update", as: :update_registration
  
  # Password resets
  get   "password_reset",         to: "password_resets#new",    as: :new_password_reset
  post  "password_reset",         to: "password_resets#create", as: :password_reset
  get   "password_reset/:token",  to: "password_resets#edit",   as: :edit_password_reset
  patch "password_reset/:token",  to: "password_resets#update", as: :update_password_reset
  
  # FusionAuth Connector
  post "fusionauth/connector", to: "fusion_auth_connector#authenticate"
end
