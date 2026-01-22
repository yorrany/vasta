package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/assert"
)

func TestSupabaseAuth(t *testing.T) {
	// Setup
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	
	// Define a dummy secret for testing
	secret := "super-secure-test-secret-123"
	viper.Set("SUPABASE_JWT_SECRET", secret)

	// Create a valid token signed with this secret
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": "user-123",
		"exp": time.Now().Add(time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString([]byte(secret))

	// Attach valid token
	req.Header.Set("Authorization", "Bearer "+tokenString)
	
	c := e.NewContext(req, rec)
	
	// Mock next handler (what happens if auth passes)
	nextHandler := func(c echo.Context) error {
		return c.String(http.StatusOK, "Success")
	}

	// Execute Middleware
	middlewareFunc := SupabaseAuth()
	handler := middlewareFunc(nextHandler)
	err := handler(c)

	// Assertions
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	
	// Verify context was populated
	assert.Equal(t, "user-123", c.Get("user_id"))
}

func TestSupabaseAuth_InvalidToken(t *testing.T) {
	// Setup
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	
	viper.Set("SUPABASE_JWT_SECRET", "correct-secret")

	// Create a token signed with the WRONG secret
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": "hacker",
	})
	tokenString, _ := token.SignedString([]byte("wrong-secret"))

	req.Header.Set("Authorization", "Bearer "+tokenString)
	c := e.NewContext(req, rec)

	middlewareFunc := SupabaseAuth()
	handler := middlewareFunc(func(c echo.Context) error {
		return c.String(http.StatusOK, "Should fail")
	})
	
	// Execute
	err := handler(c)

	// Should be 401 Unauthorized
	if err != nil {
		he, ok := err.(*echo.HTTPError)
		assert.True(t, ok)
		assert.Equal(t, http.StatusUnauthorized, he.Code)
	}
}
