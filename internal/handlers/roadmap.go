package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/yorrany/Vasta-Go/internal/domain"
	"gorm.io/gorm"
)

type RoadmapHandler struct {
	DB *gorm.DB
}

func NewRoadmapHandler(db *gorm.DB) *RoadmapHandler {
	return &RoadmapHandler{DB: db}
}

// GetRoadmap returns the list of roadmap features.
func (h *RoadmapHandler) GetRoadmap(c echo.Context) error {
	var features []domain.RoadmapFeature
	// Sort by votes count descending as a default heuristic for "relevance"
	if err := h.DB.Order("votes_count desc, created_at desc").Find(&features).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch roadmap"})
	}

	// Calculate total votes for "percentage" calculation in frontend (if needed)
	var totalVotes int64
	h.DB.Model(&domain.FeatureVote{}).Count(&totalVotes)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"features":    features,
		"total_votes": totalVotes,
	})
}

// VoteFeature toggles a vote for a feature.
func (h *RoadmapHandler) VoteFeature(c echo.Context) error {
	featureID := c.Param("id")
	userID, ok := c.Get("user_id").(string)

	if !ok || userID == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
	}

	var existingVote domain.FeatureVote
	err := h.DB.Where("feature_id = ? AND user_id = ?", featureID, userID).First(&existingVote).Error

	if err == nil {
		// Vote exists, so remove it (toggle off)
		if err := h.DB.Delete(&existingVote).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to remove vote"})
		}
		return c.JSON(http.StatusOK, map[string]interface{}{
			"voted": false,
		})
	} else if err == gorm.ErrRecordNotFound {
		// Vote does not exist, so add it (toggle on)
		newVote := domain.FeatureVote{
			FeatureID: featureID,
			UserID:    userID,
		}
		if err := h.DB.Create(&newVote).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to add vote"})
		}
		return c.JSON(http.StatusOK, map[string]interface{}{
			"voted": true,
		})
	}

	return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
}
