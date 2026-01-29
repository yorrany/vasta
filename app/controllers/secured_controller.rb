class SecuredController < ApplicationController
  before_action :authenticate_request!

  private

  def authenticate_request!
    token = request.headers["Authorization"]&.split(" ")&.last
    decoded_token = JsonWebToken.decode(token)

    if decoded_token
      # Current.user = User.find(decoded_token["sub"]) # If we had a User model synced
      # For now, we just verify the token is valid and maybe set the ID
      Current.user = OpenStruct.new(id: decoded_token["sub"])
    else
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end
end
