Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Root route
  root "home#index"
  
  # OAuth routes
  match "/auth/:provider/callback", to: "sessions#create", via: [:get, :post]
  get "/auth/failure", to: "sessions#failure"
  
  # Session routes
  delete "/sign_out", to: "sessions#destroy", as: :sign_out
  
  # User routes
  resources :users, only: [:show, :edit, :update]
  
  # Home routes
  get "/dashboard", to: "home#index", as: :dashboard
  
  # # FusionAuth Connector
  # post "fusionauth/connector", to: "fusion_auth_connector#authenticate"
end
