Rails.application.routes.draw do
  if ENV["VASTA_INTERNO"] == "true"
    namespace :governanca do
      get "ux", to: "ux#index"
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check

  get "plans", to: "plans#index"
  get "profiles/check_username", to: "profiles#check_username"

  namespace :platform do
    post "subscriptions/checkout", to: "subscriptions#checkout"
  end

  post "webhooks/stripe", to: "stripe_webhooks#create"

  root to: proc { [200, { "Content-Type" => "text/plain" }, ["OK"]] }
end
