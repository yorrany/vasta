class JsonWebToken
  SECRET_KEY = ENV["SUPABASE_JWT_SECRET"]

  def self.decode(token)
    # Verify the signature using the Supabase JWT Secret
    # Leeway allows for clock drift
    JWT.decode(token, SECRET_KEY, true, { algorithm: "HS256", verify_iat: true })[0]
  rescue JWT::DecodeError
    nil
  end
end
