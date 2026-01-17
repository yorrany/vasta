# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins do |source, env|
      if Rails.env.development?
        source == "http://localhost:3000" || source == "http://localhost:3001"
      else
        source == "https://vasta-frontend.vercel.app" ||
        source == "https://www.vasta.pro" ||
        source == "https://app.vasta.pro" ||
        source == "https://vasta.pro" ||
        source == "https://vasta-ruby.vercel.app"
      end
    end

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
