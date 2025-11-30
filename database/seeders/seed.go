package seeders

import (
	"context"
	"fmt"
	"log"
	"time"

	sqlc "github.com/K44Z/boardly/database/generated"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type Seeder struct {
	pool    *pgxpool.Pool
	queries *sqlc.Queries
}

func NewSeeder(pool *pgxpool.Pool) *Seeder {
	return &Seeder{
		pool:    pool,
		queries: sqlc.New(pool),
	}
}

func (s *Seeder) Seed(ctx context.Context) error {
	log.Println("Starting database seeding...")

	// Seed users
	users, err := s.seedUsers(ctx)
	if err != nil {
		return fmt.Errorf("failed to seed users: %w", err)
	}
	log.Printf("✓ Seeded %d users", len(users))

	// Seed boards
	boards, err := s.seedBoards(ctx, users)
	if err != nil {
		return fmt.Errorf("failed to seed boards: %w", err)
	}
	log.Printf("✓ Seeded %d boards", len(boards))

	// Seed memberships
	memberships, err := s.seedMemberships(ctx, boards, users)
	if err != nil {
		return fmt.Errorf("failed to seed memberships: %w", err)
	}
	log.Printf("✓ Seeded %d memberships", len(memberships))

	// Seed lists
	lists, err := s.seedLists(ctx, boards)
	if err != nil {
		return fmt.Errorf("failed to seed lists: %w", err)
	}
	log.Printf("✓ Seeded %d lists", len(lists))

	// Seed labels
	labels, err := s.seedLabels(ctx, boards)
	if err != nil {
		return fmt.Errorf("failed to seed labels: %w", err)
	}
	log.Printf("✓ Seeded %d labels", len(labels))

	// Seed cards
	cards, err := s.seedCards(ctx, lists)
	if err != nil {
		return fmt.Errorf("failed to seed cards: %w", err)
	}
	log.Printf("✓ Seeded %d cards", len(cards))

	// Seed card labels
	cardLabels, err := s.seedCardLabels(ctx, cards, labels)
	if err != nil {
		return fmt.Errorf("failed to seed card labels: %w", err)
	}
	log.Printf("✓ Seeded %d card labels", cardLabels)

	// Seed assignments
	assignments, err := s.seedAssignments(ctx, cards, users)
	if err != nil {
		return fmt.Errorf("failed to seed assignments: %w", err)
	}
	log.Printf("✓ Seeded %d assignments", assignments)

	// Seed comments
	comments, err := s.seedComments(ctx, cards, users)
	if err != nil {
		return fmt.Errorf("failed to seed comments: %w", err)
	}
	log.Printf("✓ Seeded %d comments", len(comments))

	log.Println("✓ Database seeding completed successfully!")
	return nil
}

func (s *Seeder) seedUsers(ctx context.Context) ([]sqlc.User, error) {
	password, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	usernames := []string{"alice", "bob", "charlie", "diana", "eve"}
	users := make([]sqlc.User, 0, len(usernames))

	for _, username := range usernames {
		user, err := s.queries.CreateUser(ctx, sqlc.CreateUserParams{
			Username: username,
			Email:    fmt.Sprintf("%s@example.com", username),
			Password: string(password),
		})
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func (s *Seeder) seedBoards(ctx context.Context, users []sqlc.User) ([]sqlc.Board, error) {
	boardData := []struct {
		name    string
		ownerId int32
	}{
		{"Development Roadmap", users[0].ID},
		{"Marketing Campaign", users[1].ID},
		{"Product Design", users[0].ID},
		{"Team Building", users[2].ID},
		{"Personal Projects", users[3].ID},
	}

	boards := make([]sqlc.Board, 0, len(boardData))

	for _, data := range boardData {
		board, err := s.queries.CreateBoard(ctx, sqlc.CreateBoardParams{
			Name: data.name,
			OwnerID: pgtype.Int4{
				Int32: data.ownerId,
				Valid: true,
			},
		})
		if err != nil {
			return nil, err
		}
		boards = append(boards, board)
	}

	return boards, nil
}

func (s *Seeder) seedMemberships(ctx context.Context, boards []sqlc.Board, users []sqlc.User) ([]sqlc.Membership, error) {
	membershipData := []struct {
		boardIdx int
		userIdx  int
		role     string
	}{
		{0, 1, "member"},
		{0, 2, "member"},
		{1, 0, "admin"},
		{1, 3, "member"},
		{2, 1, "member"},
		{2, 4, "member"},
		{3, 0, "member"},
		{3, 1, "admin"},
	}

	memberships := make([]sqlc.Membership, 0, len(membershipData))

	for _, data := range membershipData {
		membership, err := s.queries.CreateMembership(ctx, sqlc.CreateMembershipParams{
			BoardID: pgtype.Int4{
				Int32: boards[data.boardIdx].ID,
				Valid: true,
			},
			UserID: pgtype.Int4{
				Int32: users[data.userIdx].ID,
				Valid: true,
			},
			Role: data.role,
		})
		if err != nil {
			return nil, err
		}
		memberships = append(memberships, membership)
	}

	return memberships, nil
}

func (s *Seeder) seedLists(ctx context.Context, boards []sqlc.Board) ([]sqlc.List, error) {
	listData := []struct {
		boardIdx int
		name     string
		position int32
	}{
		{0, "Backlog", 0},
		{0, "In Progress", 1},
		{0, "Review", 2},
		{0, "Done", 3},
		{1, "Ideas", 0},
		{1, "Planning", 1},
		{1, "Execution", 2},
		{2, "Research", 0},
		{2, "Design", 1},
		{2, "Feedback", 2},
		{3, "To Do", 0},
		{3, "Doing", 1},
		{4, "Todo", 0},
		{4, "Completed", 1},
	}

	lists := make([]sqlc.List, 0, len(listData))

	for _, data := range listData {
		list, err := s.queries.CreateList(ctx, sqlc.CreateListParams{
			BoardID: pgtype.Int4{
				Int32: boards[data.boardIdx].ID,
				Valid: true,
			},
			Name:     data.name,
			Position: data.position,
		})
		if err != nil {
			return nil, err
		}
		lists = append(lists, list)
	}

	return lists, nil
}

func (s *Seeder) seedLabels(ctx context.Context, boards []sqlc.Board) ([]sqlc.Label, error) {
	labelData := []struct {
		boardIdx int
		name     string
		color    string
	}{
		{0, "Bug", "#FF0000"},
		{0, "Feature", "#00FF00"},
		{0, "Enhancement", "#0000FF"},
		{1, "Urgent", "#FF6B6B"},
		{1, "Marketing", "#4ECDC4"},
		{2, "UI", "#FFE66D"},
		{2, "UX", "#95E1D3"},
		{3, "High Priority", "#F38181"},
		{4, "Personal", "#AA96DA"},
	}

	labels := make([]sqlc.Label, 0, len(labelData))

	for _, data := range labelData {
		label, err := s.queries.CreateLabel(ctx, sqlc.CreateLabelParams{
			BoardID: pgtype.Int4{
				Int32: boards[data.boardIdx].ID,
				Valid: true,
			},
			Name:  data.name,
			Color: data.color,
		})
		if err != nil {
			return nil, err
		}
		labels = append(labels, label)
	}

	return labels, nil
}

func (s *Seeder) seedCards(ctx context.Context, lists []sqlc.List) ([]sqlc.Card, error) {
	cardData := []struct {
		listIdx     int
		title       string
		description string
		position    int32
		dueDate     *time.Time
	}{
		{0, "Implement authentication", "Add JWT-based authentication system", 0, nil},
		{0, "Setup database migrations", "Configure migration system for database schema", 1, nil},
		{1, "Build user dashboard", "Create main dashboard interface", 0, timePtr(time.Now().AddDate(0, 0, 7))},
		{1, "Integrate payment gateway", "Add Stripe payment integration", 1, timePtr(time.Now().AddDate(0, 0, 14))},
		{2, "Code review for PR #123", "Review and merge authentication PR", 0, nil},
		{3, "Deploy v1.0", "Deploy first production version", 0, nil},
		{4, "Brainstorm campaign ideas", "Generate ideas for Q4 campaign", 0, nil},
		{5, "Create content calendar", "Plan content for next 3 months", 0, timePtr(time.Now().AddDate(0, 0, 5))},
		{6, "Launch social media ads", "Start Facebook and Instagram ads", 0, nil},
		{7, "User research interviews", "Conduct interviews with 10 users", 0, nil},
		{8, "Create wireframes", "Design low-fidelity wireframes", 0, nil},
		{9, "Gather design feedback", "Present designs to stakeholders", 0, nil},
		{10, "Plan team lunch", "Organize team building lunch", 0, timePtr(time.Now().AddDate(0, 0, 3))},
		{12, "Learn Go concurrency", "Study Go concurrency patterns", 0, nil},
		{12, "Build side project", "Create a personal blog", 1, nil},
	}

	cards := make([]sqlc.Card, 0, len(cardData))

	for _, data := range cardData {
		var dueDate pgtype.Timestamp
		if data.dueDate != nil {
			dueDate = pgtype.Timestamp{
				Time:  *data.dueDate,
				Valid: true,
			}
		}

		card, err := s.queries.CreateCard(ctx, sqlc.CreateCardParams{
			ListID: pgtype.Int4{
				Int32: lists[data.listIdx].ID,
				Valid: true,
			},
			Title:       data.title,
			Description: data.description,
			Position:    data.position,
			DueDate:     dueDate,
		})
		if err != nil {
			return nil, err
		}
		cards = append(cards, card)
	}

	return cards, nil
}

func (s *Seeder) seedCardLabels(ctx context.Context, cards []sqlc.Card, labels []sqlc.Label) (int, error) {
	cardLabelData := []struct {
		cardIdx  int
		labelIdx int
	}{
		{0, 0},  // Bug
		{1, 1},  // Feature
		{2, 1},  // Feature
		{3, 1},  // Feature
		{4, 0},  // Bug
		{5, 2},  // Enhancement
		{6, 3},  // Urgent
		{7, 4},  // Marketing
		{10, 7}, // High Priority
	}

	count := 0
	for _, data := range cardLabelData {
		err := s.queries.AddLabelToCard(ctx, sqlc.AddLabelToCardParams{
			CardID:  int32(data.cardIdx),
			LabelID: int32(data.labelIdx),
		})
		if err != nil {
			return 0, err
		}
		count++
	}

	return count, nil
}

func (s *Seeder) seedAssignments(ctx context.Context, cards []sqlc.Card, users []sqlc.User) (int, error) {
	assignmentData := []struct {
		cardIdx int
		userIdx int
	}{
		{0, 0},
		{1, 1},
		{2, 0},
		{2, 1},
		{3, 2},
		{4, 1},
		{5, 0},
		{6, 1},
		{7, 3},
		{8, 0},
		{9, 4},
	}

	count := 0
	for _, data := range assignmentData {
		err := s.queries.AssignUserToCard(ctx, sqlc.AssignUserToCardParams{
			CardID: int32(data.cardIdx),
			UserID: int32(data.userIdx),
		})
		if err != nil {
			return 0, err
		}
		count++
	}

	return count, nil
}

func (s *Seeder) seedComments(ctx context.Context, cards []sqlc.Card, users []sqlc.User) ([]sqlc.Comment, error) {
	commentData := []struct {
		cardIdx int
		userIdx int
		text    string
	}{
		{0, 1, "Should we use JWT or sessions?"},
		{0, 0, "Let's go with JWT for better scalability"},
		{2, 2, "Looking great! When can we review?"},
		{2, 0, "I'll have it ready by tomorrow"},
		{3, 1, "Have we decided on the payment provider?"},
		{6, 3, "Campaign looks promising!"},
		{8, 4, "These wireframes need some adjustments"},
		{10, 2, "How about Italian food?"},
	}

	comments := make([]sqlc.Comment, 0, len(commentData))

	for _, data := range commentData {
		comment, err := s.queries.CreateComment(ctx, sqlc.CreateCommentParams{
			CardID: pgtype.Int4{
				Int32: cards[data.cardIdx].ID,
				Valid: true,
			},
			UserID: pgtype.Int4{
				Int32: users[data.userIdx].ID,
				Valid: true,
			},
			Text: data.text,
		})
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}

func (s *Seeder) Clear(ctx context.Context) error {
	log.Println("Clearing database...")

	tables := []string{
		"comments",
		"assignments",
		"card_labels",
		"cards",
		"labels",
		"lists",
		"memberships",
		"boards",
		"users",
	}

	for _, table := range tables {
		_, err := s.pool.Exec(ctx, fmt.Sprintf("DELETE FROM %s", table))
		if err != nil {
			return fmt.Errorf("failed to clear table %s: %w", table, err)
		}
	}

	log.Println("✓ Database cleared successfully!")
	return nil
}

func timePtr(t time.Time) *time.Time {
	return &t
}
