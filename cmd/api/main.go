package main

import (
	"log"
	"os"

	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
	"github.com/spf13/viper"
	"github.com/yorrany/Vasta-Go/internal/handlers"
	webhookHandler "github.com/yorrany/Vasta-Go/internal/handlers/webhook"
	"github.com/yorrany/Vasta-Go/internal/middleware"
	"github.com/yorrany/Vasta-Go/internal/service"
	"github.com/yorrany/Vasta-Go/pkg/database"
	"github.com/yorrany/Vasta-Go/pkg/stripe"
)

func main() {
	// 1. Config
	viper.AutomaticEnv()

	// 2. Database
	db, err := database.NewPostgresConnection()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// 3. Services
	stripeClient := stripe.NewClient(os.Getenv("STRIPE_SECRET_KEY"))
	billingService := service.NewBillingService(db, stripeClient)
	slotGenerator := service.NewSlotGenerator(db)

	// 4. Handlers
	h := handlers.NewHandler(db, billingService, slotGenerator)

	// 5. Echo Server
	e := echo.New()

	// Middleware
	e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Recover())
	e.Use(echoMiddleware.CORS())
	// e.Use(echoMiddleware.RateLimiter(...)) // TODO: Configure Rate Limiter

	// Routes
	api := e.Group("/api/v1")

	// Public routes
	api.GET("/plans", h.GetPlans)

	wh := webhookHandler.NewStripeHandler(db)
	api.POST("/webhooks/stripe", wh.Handle)

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.SupabaseAuth())

	protected.GET("/appointments", h.GetAppointments)
	protected.POST("/appointments", h.CreateAppointment)
	protected.GET("/slots", h.GetSlots)

	// Offers
	protected.GET("/offers", h.GetOffers)
	protected.GET("/offers/:id", h.GetOffer)
	protected.POST("/offers", h.CreateOffer)
	protected.PUT("/offers/:id", h.UpdateOffer)
	protected.DELETE("/offers/:id", h.DeleteOffer)

	// Profiles
	protected.GET("/profiles/check_username", h.CheckUsername)

	// Subscriptions
	// Namespaced in Rails as /platform/subscriptions/checkout, but usually RESTful implies /subscriptions
	protected.POST("/subscriptions/checkout", h.CreateSubscription) // Matching Rails route: post "subscriptions/checkout"

	// Users
	protected.GET("/users", h.GetUsers)
	protected.POST("/users", h.CreateUser)

	// Service Availabilities
	protected.GET("/service_availabilities", h.GetServiceAvailabilities)
	protected.POST("/service_availabilities", h.CreateServiceAvailability)

	// Roadmap (New)
	roadmapHandler := handlers.NewRoadmapHandler(db)
	api.GET("/roadmap", roadmapHandler.GetRoadmap)                  // Public
	protected.POST("/roadmap/:id/vote", roadmapHandler.VoteFeature) // Protected (requires auth)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	e.Logger.Fatal(e.Start(":" + port))
}
