package domain

import (
	"time"
)

// Base contains common columns for all tables.
type Base struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Tenant represents the 'tenants' table.
type Tenant struct {
	Base
	Name             string     `gorm:"not null" json:"name"`
	Slug             string     `gorm:"uniqueIndex;not null" json:"slug"`
	Status           string     `gorm:"default:active;not null" json:"status"`
	CurrentPlanCode  string     `gorm:"default:start;not null" json:"current_plan_code"`
	BillingStatus    string     `gorm:"default:active;not null" json:"billing_status"`
	BlockedAt        *time.Time `json:"blocked_at"`
	StripeCustomerID *string    `json:"stripe_customer_id"`
}

// User represents the 'users' table.
type User struct {
	Base
	TenantID uint64 `gorm:"not null;index" json:"tenant_id"`
	Tenant   Tenant `json:"tenant,omitempty"`
	Name     string `gorm:"not null" json:"name"`
	Email    string `gorm:"not null" json:"email"`
	Role     string `gorm:"default:admin;not null" json:"role"`
	Status   string `gorm:"default:active;not null" json:"status"`
}

// Profile represents the 'profiles' table.
type Profile struct {
	Base
	TenantID    uint64                 `gorm:"not null;index" json:"tenant_id"`
	UserID      *uint64                `gorm:"index" json:"user_id"`
	Slug        string                 `gorm:"uniqueIndex;not null" json:"slug"`
	DisplayName string                 `gorm:"not null" json:"display_name"`
	Bio         *string                `json:"bio"`
	ThemeConfig map[string]interface{} `gorm:"serializer:json;default:'{}';not null" json:"theme_config"`
	Status      string                 `gorm:"default:active;not null" json:"status"`
}

// Offer represents the 'offers' table.
type Offer struct {
	Base
	TenantID    uint64                 `gorm:"not null;index" json:"tenant_id"`
	ProfileID   uint64                 `gorm:"not null;index" json:"profile_id"`
	Title       string                 `gorm:"not null" json:"title"`
	Description *string                `json:"description"`
	PriceCents  int                    `gorm:"not null" json:"price_cents"`
	Currency    string                 `gorm:"default:BRL;not null" json:"currency"`
	Kind        string                 `gorm:"default:digital_product;not null" json:"kind"`
	Active      bool                   `gorm:"default:true;not null" json:"active"`
	Position    *int                   `json:"position"`
	Metadata    map[string]interface{} `gorm:"serializer:json;default:'{}';not null" json:"metadata"`
}

// Appointment represents the 'appointments' table.
type Appointment struct {
	Base
	TenantID        uint64    `gorm:"not null;index" json:"tenant_id"`
	OfferID         uint64    `gorm:"not null;index" json:"offer_id"`
	ProfileID       uint64    `gorm:"not null;index" json:"profile_id"`
	StartsAt        time.Time `gorm:"not null" json:"starts_at"`
	DurationMinutes int       `gorm:"not null" json:"duration_minutes"`
	Status          string    `gorm:"default:scheduled;not null" json:"status"`
	ClientName      *string   `json:"client_name"`
	ClientEmail     *string   `json:"client_email"`
}

// Subscription represents the 'subscriptions' table.
type Subscription struct {
	Base
	TenantID         uint64                 `gorm:"not null;index" json:"tenant_id"`
	ExternalID       string                 `gorm:"uniqueIndex;not null" json:"external_id"`
	PlanCode         string                 `gorm:"not null" json:"plan_code"`
	Status           string                 `gorm:"not null" json:"status"`
	CurrentPeriodEnd *time.Time             `json:"current_period_end"`
	RawData          map[string]interface{} `gorm:"serializer:json;default:'{}';not null" json:"raw_data"`
}

// Checkout represents the 'checkouts' table.
type Checkout struct {
	Base
	TenantID              uint64                 `gorm:"not null;index" json:"tenant_id"`
	OfferID               uint64                 `gorm:"not null;index" json:"offer_id"`
	StripeSessionID       string                 `gorm:"uniqueIndex;not null" json:"stripe_session_id"`
	StripePaymentIntentID *string                `gorm:"index" json:"stripe_payment_intent_id"`
	Status                string                 `gorm:"default:pending;not null" json:"status"`
	AmountCents           int                    `gorm:"not null" json:"amount_cents"`
	Currency              string                 `gorm:"default:BRL;not null" json:"currency"`
	RawData               map[string]interface{} `gorm:"serializer:json;default:'{}';not null" json:"raw_data"`
}

// AuditLog represents the 'audit_logs' table.
type AuditLog struct {
	Base
	TenantID     uint64                 `gorm:"not null;index" json:"tenant_id"`
	UserID       *uint64                `gorm:"index" json:"user_id"`
	Action       string                 `gorm:"not null" json:"action"`
	ResourceType *string                `json:"resource_type"`
	ResourceID   *uint64                `json:"resource_id"`
	Changeset    map[string]interface{} `gorm:"serializer:json;default:'{}';not null" json:"changeset"`
	Metadata     map[string]interface{} `gorm:"serializer:json;default:'{}';not null" json:"metadata"`
}

// ServiceAvailability represents the 'service_availabilities' table.
type ServiceAvailability struct {
	Base
	TenantID        uint64 `gorm:"not null;index" json:"tenant_id"`
	OfferID         uint64 `gorm:"not null;index" json:"offer_id"`
	Weekday         int    `gorm:"not null" json:"weekday"`
	StartMinute     int    `gorm:"not null" json:"start_minute"`
	EndMinute       int    `gorm:"not null" json:"end_minute"`
	DurationMinutes int    `gorm:"not null" json:"duration_minutes"`
	Active          bool   `gorm:"default:true;not null" json:"active"`
}

// RoadmapFeature represents the 'roadmap_features' table.
type RoadmapFeature struct {
	ID          string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `json:"description"`
	Status      string    `gorm:"default:planned;not null" json:"status"`
	VotesCount  int       `gorm:"default:0" json:"votes_count"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// FeatureVote represents the 'feature_votes' table.
type FeatureVote struct {
	FeatureID string    `gorm:"primaryKey;type:uuid" json:"feature_id"`
	UserID    string    `gorm:"primaryKey;type:uuid" json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
}
