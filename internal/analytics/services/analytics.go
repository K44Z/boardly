package services

import (
	"context"

	analytics "github.com/K44Z/boardly/internal/analytics"
	"github.com/K44Z/boardly/internal/analytics/repository"
	"github.com/K44Z/boardly/shared/schemas"
)

type AnalyticsService interface {
	GetBoardAnalytics(ctx context.Context, boardId int32) (*analytics.BoardAnalyticsResponse, error)
}

type analyticsService struct {
	repo repository.AnalyticsRepository
}

func NewAnalyticsService(db *schemas.DB) AnalyticsService {
	return &analyticsService{
		repo: repository.NewAnalyticsRepo(db),
	}
}

func (s *analyticsService) GetBoardAnalytics(ctx context.Context, boardId int32) (*analytics.BoardAnalyticsResponse, error) {
	stats, err := s.repo.GetBoardStats(ctx, boardId)
	if err != nil {
		return nil, err
	}

	activity, err := s.repo.GetBoardActivity(ctx, boardId)
	if err != nil {
		return nil, err
	}

	activityDtos := make([]analytics.BoardActivity, len(activity))
	for i, a := range activity {
		activityDtos[i] = analytics.BoardActivity{
			Date:         a.Date.Time,
			CardsCreated: a.CardsCreated,
			CommentsMade: a.CommentsMade,
		}
	}

	cardsPerList, err := s.repo.GetCardsPerList(ctx, boardId)
	if err != nil {
		return nil, err
	}

	cardsPerListDtos := make([]analytics.CardsPerList, len(cardsPerList))
	for i, c := range cardsPerList {
		cardsPerListDtos[i] = analytics.CardsPerList{
			ListID:    c.ID,
			ListName:  c.Name,
			CardCount: c.CardCount,
		}
	}

	cardsPerMember, err := s.repo.GetCardsPerMember(ctx, boardId)
	if err != nil {
		return nil, err
	}

	cardsPerMemberDtos := make([]analytics.CardsPerMember, len(cardsPerMember))
	for i, c := range cardsPerMember {
		cardsPerMemberDtos[i] = analytics.CardsPerMember{
			UserID:       c.ID,
			Username:     c.Username,
			ProfileImage: c.ProfileImage,
			CardCount:    c.CardCount,
		}
	}

	return &analytics.BoardAnalyticsResponse{
		Stats: analytics.BoardStats{
			TotalLists:    stats.TotalLists,
			TotalCards:    stats.TotalCards,
			TotalMembers:  stats.TotalMembers,
			TotalLabels:   stats.TotalLabels,
			TotalComments: stats.TotalComments,
			OverdueCards:  stats.OverdueCards,
			DueSoonCards:  stats.DueSoonCards,
		},
		Activity:       activityDtos,
		CardsPerList:   cardsPerListDtos,
		CardsPerMember: cardsPerMemberDtos,
	}, nil
}
