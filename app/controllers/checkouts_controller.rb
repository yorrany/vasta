class CheckoutsController < SecuredController
  def create
    offer = Current.tenant.offers.find(params[:offer_id])

    success_url = params[:success_url]
    cancel_url = params[:cancel_url]

    session = Payments::Stripe::CheckoutSessionCreator.new(
      offer: offer,
      success_url: success_url,
      cancel_url: cancel_url
    ).call

    checkout = Current.tenant.checkouts.create!(
      offer: offer,
      stripe_session_id: session.id,
      amount_cents: offer.price_cents,
      currency: offer.currency,
      status: "pending"
    )

    render json: { session_id: session.id, url: session.url, checkout_id: checkout.id }, status: :created
  end
end

