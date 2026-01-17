# In config/initializers/rack_attack.rb

class Rack::Attack
  # Throttle all requests by IP (60rpm)
  # Key: "rack::attack:#{Time.now.to_i/:period}:req/ip:#{req.ip}"
  throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip unless req.path.start_with?('/assets')
  end

  # Throttle login attempts by IP (20rpm)
  # throttle("logins/ip", limit: 20, period: 60.seconds) do |req|
  #   if req.path == '/login' && req.post?
  #     req.ip
  #   end
  # end
  
  # Allow all requests from localhost
  safelist('allow-localhost') do |req|
    '127.0.0.1' == req.ip || '::1' == req.ip
  end
end
