package analytics

import "time"

type BoardStats struct {
	TotalLists    int64 `json:"total_lists"`
	TotalCards    int64 `json:"total_cards"`
	TotalMembers  int64 `json:"total_members"`
	TotalLabels   int64 `json:"total_labels"`
	TotalComments int64 `json:"total_comments"`
	OverdueCards  int64 `json:"overdue_cards"`
	DueSoonCards  int64 `json:"due_soon_cards"`
}

type BoardActivity struct {
	Date         time.Time `json:"date"`
	CardsCreated int64     `json:"cards_created"`
	CommentsMade int64     `json:"comments_made"`
}

type CardsPerList struct {
	ListID    int32  `json:"list_id"`
	ListName  string `json:"list_name"`
	CardCount int64  `json:"card_count"`
}

type CardsPerMember struct {
	UserID       int32  `json:"user_id"`
	Username     string `json:"username"`
	ProfileImage string `json:"profile_image"`
	CardCount    int64  `json:"card_count"`
}

type BoardAnalyticsResponse struct {
	Stats          BoardStats       `json:"stats"`
	Activity       []BoardActivity  `json:"activity"`
	CardsPerList   []CardsPerList   `json:"cards_per_list"`
	CardsPerMember []CardsPerMember `json:"cards_per_member"`
}
