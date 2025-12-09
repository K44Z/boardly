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

func (s *Seeder) HasData(ctx context.Context) (bool, error) {
	var count int
	err := s.pool.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (s *Seeder) Seed(ctx context.Context) error {
	log.Println("Starting database seeding...")

	users, err := s.seedUsers(ctx)
	if err != nil {
		return fmt.Errorf("failed to seed users: %w", err)
	}
	log.Printf("✓ Seeded %d users", len(users))

	boards, err := s.seedBoards(ctx, users)
	if err != nil {
		return fmt.Errorf("failed to seed boards: %w", err)
	}
	log.Printf("✓ Seeded %d boards", len(boards))

	memberships, err := s.seedMemberships(ctx, boards, users)
	if err != nil {
		return fmt.Errorf("failed to seed memberships: %w", err)
	}
	log.Printf("✓ Seeded %d memberships", len(memberships))

	lists, err := s.seedLists(ctx, boards)
	if err != nil {
		return fmt.Errorf("failed to seed lists: %w", err)
	}
	log.Printf("✓ Seeded %d lists", len(lists))

	labels, err := s.seedLabels(ctx, boards)
	if err != nil {
		return fmt.Errorf("failed to seed labels: %w", err)
	}
	log.Printf("✓ Seeded %d labels", len(labels))

	cards, err := s.seedCards(ctx, lists)
	if err != nil {
		return fmt.Errorf("failed to seed cards: %w", err)
	}
	log.Printf("✓ Seeded %d cards", len(cards))

	cardLabels, err := s.seedCardLabels(ctx, cards, labels)
	if err != nil {
		return fmt.Errorf("failed to seed card labels: %w", err)
	}
	log.Printf("✓ Seeded %d card labels", cardLabels)

	assignments, err := s.seedAssignments(ctx, cards, users)
	if err != nil {
		return fmt.Errorf("failed to seed assignments: %w", err)
	}
	log.Printf("✓ Seeded %d assignments", assignments)

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

	usernames := []string{
		"alice", "bob", "charlie", "diana", "eve",
		"frank", "grace", "heidi", "ivan", "judy",
		"amine",
	}
	users := make([]sqlc.User, 0, len(usernames))

	for _, username := range usernames {
		email := fmt.Sprintf("%s@example.com", username)
		if username == "amine" {
			email = "amineachtak@gmail.com"
		}
		user, err := s.queries.CreateUser(ctx, sqlc.CreateUserParams{
			Username: username,
			Email:    email,
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
		{"Sales Pipeline", users[5].ID},
		{"Office Renovation", users[6].ID},
		{"Q4 Goals", users[0].ID},
		{"Amine's Project", users[10].ID},
		{"Core API Team", users[1].ID},
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
		// Development Roadmap (Alice)
		{0, 0, "admin"},  // Alice (Owner)
		{0, 1, "member"}, // Bob
		{0, 2, "member"}, // Charlie
		{0, 5, "member"}, // Frank

		// Marketing Campaign (Bob)
		{1, 0, "admin"},  // Alice
		{1, 3, "member"}, // Diana
		{1, 6, "member"}, // Grace

		// Product Design (Alice)
		{2, 1, "member"}, // Bob
		{2, 4, "member"}, // Eve
		{2, 7, "member"}, // Heidi

		// Team Building (Charlie)
		{3, 0, "member"}, // Alice
		{3, 1, "admin"},  // Bob
		{3, 8, "member"}, // Ivan

		// Sales Pipeline (Frank)
		{5, 0, "member"}, // Alice
		{5, 9, "member"}, // Judy

		// Office Renovation (Grace)
		{6, 5, "member"}, // Frank
		{6, 7, "member"}, // Heidi

		// Q4 Goals (Alice)
		{7, 1, "admin"}, // Bob
		{7, 2, "admin"}, // Charlie

		// Amine's Project (Amine)
		{8, 10, "admin"}, // Amine (Owner)
		{8, 0, "member"}, // Alice
		{8, 1, "member"}, // Bob

		// Core API Team (Bob)
		{9, 1, "admin"},  // Bob (Owner)
		{9, 0, "admin"},  // Alice
		{9, 2, "member"}, // Charlie
		{9, 4, "member"}, // Eve
		{9, 5, "member"}, // Frank
		{9, 8, "member"}, // Ivan
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
		// Board 0: Dev
		{0, "Backlog", 0},
		{0, "In Progress", 1},
		{0, "Review", 2},
		{0, "Done", 3},

		// Board 1: Marketing
		{1, "Ideas", 0},
		{1, "Planning", 1},
		{1, "Execution", 2},

		// Board 2: Design
		{2, "Research", 0},
		{2, "Design", 1},
		{2, "Feedback", 2},

		// Board 3: Team
		{3, "To Do", 0},
		{3, "Doing", 1},

		// Board 4: Personal
		{4, "Todo", 0},
		{4, "Completed", 1},

		// Board 5: Sales
		{5, "Leads", 0},
		{5, "Contacted", 1},
		{5, "Proposal", 2},
		{5, "Closed", 3},

		// Board 6: Renovation
		{6, "Planning", 0},
		{6, "Purchasing", 1},
		{6, "Construction", 2},

		// Board 7: Q4 Goals
		{7, "Not Started", 0},
		{7, "On Track", 1},
		{7, "At Risk", 2},
		{7, "Completed", 3},

		// Board 8: Amine's Project
		{8, "To Do", 0},
		{8, "In Progress", 1},
		{8, "Done", 2},

		// Board 9: Core API Team
		{9, "Icebox", 0},
		{9, "Sprint Backlog", 1},
		{9, "In Development", 2},
		{9, "Code Review", 3},
		{9, "QA / Testing", 4},
		{9, "Ready for Prod", 5},
		{9, "Deployed", 6},
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
		{0, "Documentation", "#FFFF00"},

		{1, "Urgent", "#FF6B6B"},
		{1, "Marketing", "#4ECDC4"},
		{1, "Social", "#45B7D1"},

		{2, "UI", "#FFE66D"},
		{2, "UX", "#95E1D3"},
		{2, "Mobile", "#FF8B94"},

		{3, "High Priority", "#F38181"},
		{3, "Low Priority", "#FCE38A"},

		{4, "Personal", "#AA96DA"},

		{5, "Hot Lead", "#FF4500"},
		{5, "Cold Lead", "#1E90FF"},

		{6, "Furniture", "#8B4513"},
		{6, "Paint", "#FFD700"},

		{7, "Strategic", "#800080"},
		{7, "Operational", "#008080"},

		// Board 8: Amine's Project
		{8, "Bug", "#ef4444"},
		{8, "Feature", "#22c55e"},
		{8, "Urgent", "#f97316"},

		// Board 9: Core API Team
		{9, "Bug", "#ef4444"},           // Red
		{9, "Feature", "#22c55e"},       // Green
		{9, "Enhancement", "#3b82f6"},   // Blue
		{9, "Documentation", "#a855f7"}, // Purple
		{9, "Critical", "#dc2626"},      // Dark Red
		{9, "High Priority", "#f97316"}, // Orange
		{9, "Low Priority", "#eab308"},  // Yellow
		{9, "Refactor", "#64748b"},      // Slate
		{9, "DevOps", "#06b6d4"},        // Cyan
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
		// Board 0
		{0, "Implement authentication", "We need to implement a robust, secure, and scalable JWT-based authentication system for the platform. This is a critical component that will serve as the foundation for all user interactions.\n\n### Core Requirements:\n1. **User Registration**: Implement a registration flow that accepts email, username, and password. Include email verification to prevent spam accounts.\n2. **Login Mechanism**: Secure login using bcrypt for password hashing. The system should support rate limiting to prevent brute-force attacks.\n3. **JWT Implementation**: Generate short-lived access tokens (15 minutes) and long-lived refresh tokens (7 days). Store refresh tokens securely in an HTTP-only cookie.\n4. **Middleware**: Create middleware to validate JWTs on protected routes. Handle token expiration gracefully by attempting a refresh before forcing a logout.\n5. **Password Reset**: Implement a secure password reset flow using time-limited tokens sent via email.\n\n### Security Considerations:\n- Ensure all sensitive data is encrypted in transit and at rest.\n- Follow OWASP Top 10 guidelines to mitigate common vulnerabilities like SQL injection and XSS.\n- Implement proper logging for security events (failed login attempts, password changes).\n\n### Acceptance Criteria:\n- A user can sign up, verify email, and log in.\n- Access to protected routes is denied without a valid token.\n- Tokens are automatically refreshed without user intervention.\n- Passwords are never stored in plain text.", 0, nil},
		{0, "Setup database migrations", "We need to establish a reliable database migration system to manage schema changes across different environments (development, staging, production). This will ensure consistency and prevent drift.\n\n### Objectives:\n- **Tool Selection**: Use `golang-migrate` or a similar robust tool compatible with PostgreSQL.\n- **Versioning**: All migrations must be versioned using timestamps to avoid conflicts.\n- **Automation**: Integrate migration execution into the CI/CD pipeline. Migrations should run automatically before the application starts in a new deployment.\n- **Rollback Strategy**: Every migration must have a corresponding 'down' script to revert changes if something goes wrong.\n- **Seeding**: Create a separate process for seeding initial data (users, roles, default settings) for local development.\n\n### Deliverables:\n- A `migrations` directory with initial schema files.\n- A `Makefile` or script to run migrations up/down easily.\n- Documentation on how to add new migrations.\n- CI/CD configuration updates.", 1, nil},
		{0, "Refactor API endpoints", "The current API structure has grown organically and is starting to become inconsistent and difficult to maintain. We need to refactor the endpoints to strictly adhere to RESTful principles.\n\n### Scope of Work:\n- **Resource Grouping**: Organize routes logically by resource (e.g., `/api/v1/users`, `/api/v1/boards`, `/api/v1/cards`).\n- **Standardized Responses**: Define a standard JSON response envelope for success and error states. All errors should return a consistent structure with an error code and message.\n- **Validation**: Implement a validation layer using a library like `validator` to check request bodies and query parameters before they reach the business logic.\n- **HTTP Methods**: Ensure correct usage of HTTP verbs (GET for retrieval, POST for creation, PUT/PATCH for updates, DELETE for removal).\n- **Documentation**: Update the Swagger/OpenAPI specification to reflect the new structure. Ensure all endpoints are fully documented with example requests and responses.\n\n### Benefits:\n- Improved developer experience for frontend teams.\n- Easier maintenance and scalability.\n- Better automated testing capabilities.", 2, timePtr(time.Now().AddDate(0, 0, -2))}, // Overdue
		{1, "Fix login bug", "We have received multiple reports from users unable to log in if their password contains certain special characters (specifically `!`, `@`, `#`, `&`). This is a high-priority issue affecting user access.\n\n### Investigation Findings:\n- The issue appears to be related to how the frontend encodes the password payload before sending it to the backend.\n- Alternatively, the backend validation logic might be too restrictive or incorrectly sanitizing the input.\n\n### Steps to Reproduce:\n1. Go to the registration page.\n2. Create a new user with the password `P@ssw0rd!&`.\n3. Attempt to log in with the newly created credentials.\n4. Observe a `400 Bad Request` or `500 Internal Server Error` response.\n\n### Required Fix:\n- Debug the frontend request payload to ensure special characters are properly escaped or encoded.\n- Check the backend validation regex or logic to ensure it allows standard special characters.\n- Add a comprehensive test case in the E2E suite to cover passwords with various special characters and symbols.\n\n**Priority**: Critical - blocks user access.", 0, timePtr(time.Now().AddDate(0, 0, 1))},                                                                     // Due tomorrow
		{2, "Code review for PR #123", "Please conduct a thorough code review for Pull Request #123, which introduces the new authentication service layer. This is a significant change to the core security infrastructure.\n\n### Focus Areas:\n- **Security**: Verify that token generation uses a cryptographically secure random number generator. Check for any potential timing attacks in signature verification.\n- **Performance**: Ensure that the new middleware does not introduce significant latency to API requests. Check database query efficiency for user lookups.\n- **Code Quality**: Look for adherence to our Go style guide. Ensure variable names are descriptive and functions are small and focused.\n- **Testing**: Verify that unit tests cover both happy paths and edge cases (e.g., expired tokens, malformed headers).\n\n### Action Items:\n- Leave inline comments for any code that needs clarification or improvement.\n- Verify that the CI pipeline passes all checks.\n- Pull the branch locally and run the test suite manually.\n- Approve the PR only when all critical issues are resolved.", 0, nil},
		{3, "Deploy v1.0", "We are ready to prepare for the initial production launch of the platform (v1.0). This is a major milestone and requires careful coordination between engineering and operations.\n\n### Deployment Checklist:\n1. **Infrastructure Setup**: Provision the necessary resources on AWS/GCP (EC2 instances, RDS database, ElastiCache).\n2. **Configuration**: Set up production environment variables. Ensure secrets are managed securely using AWS Secrets Manager or HashiCorp Vault.\n3. **Networking**: Configure the load balancer (ALB/nginx) to handle traffic distribution. Set up SSL/TLS certificates using Let's Encrypt.\n4. **Monitoring**: Deploy Prometheus and Grafana for metrics collection. Set up alerts for high CPU, memory usage, and error rates.\n5. **Logging**: Configure centralized logging (ELK Stack or Datadog) to aggregate logs from all services.\n6. **Load Testing**: Run a final load test using k6 or JMeter to verify the system can handle the projected traffic.\n7. **Rollout Plan**: Define a step-by-step rollout plan, including a rollback strategy in case of critical failures.\n\nCoordinate with the marketing team to align the deployment with the public launch announcement.", 0, nil},

		// Board 1
		{4, "Brainstorm campaign ideas", "We need to kick off the planning phase for our Q4 marketing campaign. The goal is to significantly boost our user acquisition numbers before the end of the year.\n\n### Campaign Objectives:\n- **Brand Awareness**: Increase visibility among our core demographic (software developers and technical project managers).\n- **Feature Highlight**: Showcase the new real-time collaboration features and the improved mobile experience.\n- **Conversion**: Drive at least 5,000 new sign-ups for the free tier, with a target conversion rate of 5% to paid plans.\n\n### Brainstorming Prompts:\n- What are the current trending topics in the dev community?\n- Can we partner with any influencers or tech newsletters?\n- Should we run a hackathon or a coding challenge?\n- What kind of content (video, blog, webinar) resonates best with our audience?\n\n**Action**: Schedule a 2-hour workshop with the creative and content teams. Come prepared with at least 3 unique concepts.", 0, nil},
		{5, "Create content calendar", "Develop a detailed content calendar for the next quarter (October, November, December). Consistency is key to building our organic traffic.\n\n### Content Mix:\n- **Technical Tutorials**: Deep dives into how to use our API, integrations with other tools, and best practices for project management.\n- **Case Studies**: Success stories from existing customers. Highlight how they improved productivity using our platform.\n- **Thought Leadership**: Opinion pieces on the future of remote work, agile methodologies, and team collaboration.\n- **Product Updates**: Announcements of new features, bug fixes, and roadmap teasers.\n\n### Requirements:\n- Plan for 2 blog posts per week.\n- Schedule daily social media posts (Twitter, LinkedIn).\n- Plan one monthly newsletter.\n- Identify potential guest authors or collaboration opportunities.\n\nUse the shared calendar template and tag relevant stakeholders for review.", 0, timePtr(time.Now().AddDate(0, 0, 5))},
		{6, "Launch social media ads", "Execute the paid social media strategy for the Q4 campaign. We have a budget of $10,000 for the first month.\n\n### Platforms:\n- **LinkedIn**: Target decision-makers (CTOs, VP of Engineering) with sponsored content about enterprise features.\n- **Twitter/X**: Target developers with technical content and memes to drive engagement.\n- **Facebook/Instagram**: Retargeting campaigns for users who visited our pricing page but didn't sign up.\n\n### Tasks:\n- Finalize ad creatives (images, short videos, carousels).\n- Set up custom audiences and lookalike audiences based on our current user base.\n- Configure conversion tracking pixels to measure sign-ups and trial starts.\n- Set up A/B tests for headlines and call-to-action buttons.\n- Launch the campaigns and monitor spend daily.", 0, nil},
		{6, "Analyze campaign metrics", "Conduct a comprehensive review of the performance of last week's ad campaigns. We need data-driven insights to optimize our spend.\n\n### Key Metrics to Analyze:\n- **Impressions & Reach**: Are we reaching the right audience size?\n- **Click-Through Rate (CTR)**: Are the creatives engaging enough?\n- **Cost Per Click (CPC)** & **Cost Per Acquisition (CPA)**: Are we acquiring users at a sustainable cost?\n- **Conversion Rate**: What percentage of clicks result in a sign-up?\n- **Return on Ad Spend (ROAS)**: Is the revenue generated justifying the ad spend?\n\n### Output:\n- A detailed report comparing performance across different platforms and ad sets.\n- Recommendations for budget reallocation (e.g., move budget from underperforming Facebook ads to high-performing LinkedIn ads).\n- Suggestions for new creative variations to test.", 1, timePtr(time.Now())}, // Due today

		// Board 2
		{7, "User research interviews", "We need to conduct a series of qualitative user interviews to better understand the needs and pain points of our target audience. This research will inform our product roadmap for next year.\n\n### Research Goals:\n- Understand the daily workflow of project managers in remote teams.\n- Identify the biggest friction points in their current tools.\n- Validate our assumptions about the importance of mobile features.\n- Gather feedback on our pricing model.\n\n### Methodology:\n- Recruit 10 participants who fit our user persona (5 current users, 5 non-users).\n- Conduct 45-minute video interviews using a semi-structured script.\n- Record the sessions (with permission) for analysis.\n\n### Deliverables:\n- Interview recordings and transcripts.\n- A synthesis report highlighting key themes, quotes, and insights.\n- A set of user personas based on the findings.", 0, nil},
		{8, "Create wireframes", "Based on the initial user research, start designing low-fidelity wireframes for the new dashboard layout. The goal is to simplify the user interface and make key metrics more accessible.\n\n### Design Principles:\n- **Clarity**: Remove unnecessary clutter. Focus on the data that matters most.\n- **Efficiency**: Minimize the number of clicks required to perform common actions.\n- **Consistency**: Use standard UI patterns to reduce the learning curve.\n\n### Key Screens to Design:\n- **Main Dashboard**: Overview of active projects, recent activity, and personal tasks.\n- **Project View**: Kanban board, list view, and timeline view.\n- **Task Detail**: Modal or side panel for viewing and editing task details.\n\nUse Figma or Balsamiq. Focus on layout and flow, not visual polish. Share the initial drafts with the product team for early feedback.", 0, nil},
		{9, "Gather design feedback", "Organize a design review session to present the high-fidelity mockups to key stakeholders, including Product Managers, Engineering Leads, and the Design Team.\n\n### Session Agenda:\n1. **Walkthrough**: Present the user journey and the rationale behind design decisions.\n2. **Interactive Prototype**: Demonstrate the flow using a clickable prototype.\n3. **Feedback Round**: Open the floor for questions, concerns, and suggestions.\n\n### Objectives:\n- Validate that the design meets all functional requirements.\n- Identify any technical feasibility issues early on.\n- Ensure the visual style aligns with our brand guidelines.\n- Get formal sign-off to proceed to the implementation phase.\n\n**Note**: Document all feedback in a shared document and assign action items for any necessary revisions.", 0, nil},
		{9, "Finalize mobile layout", "The mobile experience is currently suboptimal. We need to ensure the application is fully responsive and provides a seamless experience on smaller screens.\n\n### Mobile Requirements:\n- **Responsive Grid**: The layout should adapt fluidly to different screen sizes (mobile, tablet, desktop).\n- **Touch Targets**: Buttons and interactive elements must be large enough for touch interaction (min 44x44px).\n- **Navigation**: Implement a mobile-friendly navigation menu (e.g., hamburger menu or bottom tab bar).\n- **Performance**: Optimize image loading and minimize JavaScript execution to ensure fast load times on mobile networks.\n- **Testing**: Verify functionality on major devices (iPhone, iPad, Android phones) and browsers (Safari, Chrome).\n\nPay special attention to the Kanban board view on mobile—it needs to be usable without excessive horizontal scrolling.", 1, timePtr(time.Now().AddDate(0, 0, 3))},

		// Board 3
		{10, "Plan team lunch", "It's time to celebrate our recent release! Organize a team lunch to boost morale and give everyone a chance to relax and socialize.\n\n### Planning Steps:\n1. **Date Selection**: Send out a poll to find a date that works for the majority of the team.\n2. **Cuisine Preference**: Survey the team for dietary restrictions and food preferences (e.g., Italian, Mexican, Sushi).\n3. **Venue Search**: Find a restaurant within walking distance of the office that can accommodate 15 people. Check for outdoor seating options.\n4. **Reservation**: Book the table at least one week in advance.\n5. **Communication**: Send a calendar invite with the location and time. Remind everyone the day before.\n\n**Budget**: $30 per person.", 0, timePtr(time.Now().AddDate(0, 0, 3))},
		{10, "Book venue for retreat", "We are planning our annual company retreat! The goal is to find a venue that fosters collaboration, relaxation, and team bonding.\n\n### Venue Requirements:\n- **Capacity**: Must comfortably accommodate 50 people (sleeping and meeting).\n- **Location**: Within a 2-3 hour drive from the main office. Ideally in a scenic location (mountains or lake).\n- **Facilities**: Large meeting room with AV equipment, breakout areas, reliable Wi-Fi.\n- **Activities**: On-site or nearby team-building activities (hiking, kayaking, cooking class).\n- **Catering**: Full board (breakfast, lunch, dinner) with options for various dietary needs.\n\n### Action Items:\n- Research at least 5 potential venues.\n- Contact them for availability and quotes for the selected dates.\n- Create a comparison matrix (cost, amenities, distance).\n- Present the top 3 options to the leadership team.", 1, timePtr(time.Now().AddDate(0, 1, 0))},

		// Board 4
		{12, "Learn Go concurrency", "Dedicate time to deeply understand Go's concurrency model. This is essential for writing efficient and scalable backend services.\n\n### Study Plan:\n- **Goroutines**: Understand how they differ from OS threads and how the Go scheduler manages them.\n- **Channels**: Master the use of buffered vs. unbuffered channels. Learn patterns for signaling and data transfer.\n- **Select Statement**: Learn how to multiplex channel operations and handle timeouts.\n- **Synchronization**: Study the `sync` package (Mutex, RWMutex, WaitGroup) and when to use shared memory vs. message passing.\n- **Context Package**: Understand how to use `context` for cancellation and deadline propagation.\n\n### Practical Exercise:\n- Build a simple concurrent worker pool that processes a queue of jobs.\n- Implement a pipeline that processes data in stages.\n- Write a program that simulates a race condition and fix it using a mutex.", 0, nil},
		{12, "Build side project", "Start a side project to apply new skills and explore new technologies. The goal is to build a personal blog engine using Go and HTMX.\n\n### Project Scope:\n- **Backend**: Go (Standard library or Chi router).\n- **Frontend**: HTMX for dynamic interactions, Tailwind CSS for styling.\n- **Database**: SQLite for simplicity and portability.\n- **Features**:\n  - Markdown rendering for blog posts.\n  - Admin interface for creating and editing posts.\n  - Tagging and categorization system.\n  - RSS feed generation.\n- **Deployment**: Dockerize the application and deploy it to a cheap VPS (e.g., DigitalOcean, Hetzner).\n\nDocument the learning process in the first blog post!", 1, nil},
		{13, "Read 'Clean Code'", "Commit to reading 'Clean Code' by Robert C. Martin. This book is a classic for a reason and contains valuable lessons on writing maintainable software.\n\n### Reading Goals:\n- Read one chapter per week.\n- Take notes on key concepts and principles.\n- Reflect on how these principles apply to our current codebase.\n\n### Key Chapters to Focus On:\n- **Meaningful Names**: How to name variables, functions, and classes to reveal intent.\n- **Functions**: Keeping functions small, doing one thing, and avoiding side effects.\n- **Comments**: Why comments are often failures and how to write self-documenting code.\n- **Error Handling**: Using exceptions vs. return codes, and defining normal flow.\n- **Unit Tests**: The three laws of TDD and keeping tests clean.\n\nShare interesting insights with the team during the weekly dev sync.", 0, nil},

		// Board 5 (Sales)
		{14, "Contact Acme Corp", "Acme Corp is a high-value prospect. They recently signed up for a trial and have shown high engagement signals (50+ active users, multiple projects created).\n\n### Context:\n- **Company Size**: 500-1000 employees.\n- **Industry**: FinTech.\n- **Potential Deal Size**: $50k/year.\n- **Key Contact**: Jane Doe (CTO).\n\n### Outreach Strategy:\n- Research their recent company news to personalize the message.\n- Draft an email acknowledging their trial usage and offering help with setup.\n- Highlight features relevant to their scale (SSO, Audit Logs, Dedicated Support).\n- Propose a brief 15-minute call to discuss their specific needs and how we can support their growth.\n\n**Goal**: Schedule a demo call within the next week.", 0, timePtr(time.Now().AddDate(0, 0, -1))}, // Overdue
		{15, "Follow up with TechStart", "We had a productive initial meeting with TechStart. They are interested but had some concerns about pricing and support.\n\n### Follow-up Actions:\n- **Revised Proposal**: Update the proposal to address their budget constraints. Consider offering a discount for an annual commitment.\n- **SLA Clarification**: Explicitly define our support tiers. Include the 24/7 support option as an add-on.\n- **Training**: Offer two complimentary onboarding sessions for their team to ensure successful adoption.\n\n### Email Draft:\n- Summarize the key points discussed in the meeting.\n- Attach the revised proposal.\n- Reiterate our commitment to their success.\n- Suggest a time for a follow-up call to review the new terms.\n\nSend this out by end of day Tuesday.", 0, timePtr(time.Now().AddDate(0, 0, 2))},
		{16, "Draft contract for MegaCorp", "We are moving to the contract stage with MegaCorp! This is a major enterprise deal, so attention to detail is crucial.\n\n### Contract Components:\n- **Master Services Agreement (MSA)**: Standard terms and conditions.\n- **Order Form**: Specifics of the deal (number of seats, price per seat, billing frequency).\n- **Service Level Agreement (SLA)**: Uptime guarantees (99.9%), maintenance windows, and penalties for downtime.\n- **Data Processing Agreement (DPA)**: GDPR and CCPA compliance clauses.\n\n### Specific Terms to Include:\n- Payment Terms: Net 30.\n- Auto-renewal clause with 60-day notice period.\n- Right to audit clause (standard for enterprise).\n\nCollaborate with the legal team to draft the document. Review it internally before sending it to the client for redlining.", 0, nil},
		{17, "Close deal with StartupX", "Great news! StartupX has verbally agreed to the terms. Now we need to formalize the deal and get the signature.\n\n### Closing Checklist:\n1. **Final Document Prep**: Ensure all details in the contract are correct (dates, names, amounts).\n2. **Signature**: Send the contract via DocuSign to the authorized signatory.\n3. **Countersign**: Once they sign, have our VP of Sales countersign.\n4. **Onboarding**: Trigger the automated onboarding email sequence. Introduce them to their dedicated Customer Success Manager.\n5. **CRM Update**: Change the opportunity stage to 'Closed Won'. Upload the signed contract.\n6. **Billing**: Notify the finance team to generate the first invoice.\n\nDon't forget to ring the sales bell!", 0, nil},

		// Board 6 (Renovation)
		{18, "Measure office space", "We need precise measurements of the new office space to plan the layout effectively. This is the foundation for all furniture and renovation decisions.\n\n### Areas to Measure:\n- **Main Workspace**: Length, width, and ceiling height. Note locations of pillars and windows.\n- **Conference Rooms**: Dimensions of all 3 meeting rooms.\n- **Kitchen/Break Area**: Space for appliances, tables, and seating.\n- **Reception Area**: Entryway dimensions.\n- **Power/Data Outlets**: Map the location of all existing electrical and ethernet ports.\n\n### Output:\n- A detailed floor plan sketch (or CAD drawing if possible).\n- Photos of each room from multiple angles.\n- A list of potential constraints (e.g., low hanging beams, narrow doorways).", 0, nil},
		{19, "Order ergonomic chairs", "Invest in high-quality ergonomic chairs for the engineering team. Comfort and health are top priorities.\n\n### Selection Criteria:\n- **Adjustability**: Seat height, seat depth, lumbar support, armrest height/width/angle, and recline tension.\n- **Material**: Breathable mesh back to prevent overheating. Durable fabric for the seat.\n- **Warranty**: Minimum 10-year warranty on frame and moving parts.\n- **Budget**: $500 - $700 per chair.\n\n### Process:\n- Shortlist 3 top-rated models (e.g., Herman Miller, Steelcase, Autonomous).\n- Order one sample of each for the team to test for a week.\n- Collect feedback and select the winner.\n- Place the bulk order for 20 units.\n\nEnsure delivery is scheduled after the painting is complete.", 0, timePtr(time.Now().AddDate(0, 0, 7))},
		{20, "Paint conference room", "The main conference room needs a refresh. The current color is dull and the walls have some scuff marks.\n\n### Specifications:\n- **Color**: 'Calm Blue' (Hex: #AABBCC) or a similar shade that promotes focus and tranquility.\n- **Paint Type**: High-quality, low-VOC latex paint.\n- **Finish**: Eggshell or Satin (easy to clean but not too shiny).\n- **Scope**: 4 walls. Ceiling does not need painting unless damaged.\n\n### Logistics:\n- Hire professional painters.\n- Schedule the work for the weekend to avoid disrupting meetings.\n- Ensure all furniture is moved or covered with drop cloths.\n- Tape off trim and windows carefully.\n- Verify the room is aired out and ready for use by Monday morning.", 0, nil},

		// Board 7 (Q4 Goals)
		{21, "Increase ARR by 20%", "This is our North Star metric for Q4. We need to grow our Annual Recurring Revenue from $1M to $1.2M.\n\n### Growth Levers:\n- **New Business**: Close 5 enterprise deals and 50 mid-market deals.\n- **Expansion**: Upsell existing customers to higher tiers or add more seats. Target accounts at 90% utilization.\n- **Pricing**: Experiment with packaging features to drive higher average revenue per user (ARPU).\n\n### Tracking:\n- Weekly revenue review meetings.\n- Real-time dashboard showing progress vs. target.\n- Sales incentives aligned with these goals.\n\nThis requires a coordinated effort from Sales, Marketing, and Product.", 0, timePtr(time.Now().AddDate(0, 3, 0))},
		{22, "Hire 2 senior devs", "To support our roadmap and scaling needs, we need to expand the engineering team. We are looking for 2 Senior Backend Engineers with Go and PostgreSQL experience.\n\n### Hiring Pipeline:\n1. **Sourcing**: Update job descriptions. Post on LinkedIn, Stack Overflow, and niche Go communities. Reach out to passive candidates.\n2. **Screening**: Review resumes and portfolios. Conduct initial phone screens to assess culture fit and basic technical alignment.\n3. **Technical Assessment**: Take-home coding challenge or pair programming session. Focus on code quality and problem-solving.\n4. **Onsite/Virtual Loop**: System design interview and behavioral interviews with the team.\n5. **Offer**: Competitive salary, equity, and benefits package.\n\n**Target**: Have offers accepted by end of November.", 0, nil},
		{23, "Reduce churn to < 1%", "Customer retention is just as important as acquisition. We need to bring our monthly churn rate down from 2.5% to under 1%.\n\n### Retention Strategies:\n- **Onboarding**: Revamp the new user onboarding flow to reduce time-to-value. Add interactive walkthroughs.\n- **Customer Success**: Proactively reach out to accounts showing low activity or declining usage.\n- **Product Quality**: Prioritize fixing the top 10 most reported bugs. Improve system stability and performance.\n- **Feedback Loop**: Implement a cancellation survey to understand exactly why users leave.\n- **Win-back**: Create a campaign to re-engage churned users with special offers or feature updates.\n\nMonitor churn metrics weekly and adjust tactics as needed.", 0, nil},

		// Board 8 (Amine's Project)
		{25, "Setup Development Environment", "Install Go, PostgreSQL, and Node.js. Clone the repository and run the initial setup script.", 0, timePtr(time.Now().AddDate(0, 0, -5))}, // Overdue
		{25, "Design Database Schema", "Create the ER diagram for the new feature. Review with the team.", 1, timePtr(time.Now().AddDate(0, 0, 5))},
		{26, "Implement API Endpoints", "Create the REST API endpoints for the user module. Ensure proper validation and error handling.", 0, timePtr(time.Now().AddDate(0, 0, 2))}, // Due soon
		{27, "Requirement Analysis", "Analyze the requirements for the new project. Create a document outlining the scope and deliverables.", 0, nil},
		{27, "Create Project Plan", "Define the timeline and milestones for the project. Assign tasks to team members.", 1, nil},

		// Board 9 (Core API Team)
		// List 27: Icebox
		{27, "Investigate GraphQL", "Research the feasibility of adding a GraphQL interface alongside our REST API. Evaluate libraries like gqlgen.", 0, nil},
		{27, "Support HTTP/3", "Look into enabling HTTP/3 support in our load balancer and backend services for better performance.", 1, nil},
		{27, "Audit Log Service", "Design a dedicated microservice for audit logging to handle high write throughput and long-term retention.", 2, nil},
		{27, "Webhooks System", "Plan a system to allow users to register webhooks for various events (card created, comment added, etc.).", 3, nil},

		// List 28: Sprint Backlog
		{28, "Optimize SQL Queries", "Identify and optimize slow-running SQL queries in the analytics module. Use `EXPLAIN ANALYZE` to diagnose issues.", 0, timePtr(time.Now().AddDate(0, 0, 2))},
		{28, "Update Dependencies", "Upgrade all Go dependencies to their latest minor versions. Check for breaking changes and security vulnerabilities.", 1, timePtr(time.Now().AddDate(0, 0, 3))},
		{28, "Add Rate Limiting", "Implement rate limiting middleware using Redis to prevent abuse of the public API endpoints.", 2, timePtr(time.Now().AddDate(0, 0, 4))},
		{28, "Improve Error Logging", "Enhance structured logging to include request IDs and user context in all error logs.", 3, nil},
		{28, "Write Integration Tests", "Add integration tests for the new payment gateway integration. Ensure all edge cases are covered.", 4, nil},

		// List 29: In Development
		{29, "Refactor User Service", "Refactoring the user service to decouple business logic from the HTTP transport layer. \n\nProgress:\n- [x] Define interface\n- [ ] Move logic\n- [ ] Update tests", 0, timePtr(time.Now().AddDate(0, 0, 1))},
		{29, "Implement 2FA", "Adding Two-Factor Authentication support using TOTP. \n\nTasks:\n- Generate QR code\n- Verify TOTP code\n- Recovery codes", 1, timePtr(time.Now().AddDate(0, 0, 5))},
		{29, "Fix Memory Leak", "Investigating a memory leak in the notification worker. Profiling with pprof shows increasing heap usage over time.", 2, nil},
		{29, "API Documentation", "Updating Swagger/OpenAPI specs for the v2 endpoints. Ensure all request/response schemas are accurate.", 3, nil},

		// List 30: Code Review
		{30, "PR: Add Search", "Pull Request #405: Implementation of full-text search using Postgres TSVECTOR. Needs review from @Alice and @Bob.", 0, nil},
		{30, "PR: Fix Race Condition", "Pull Request #412: Fixes a race condition in the websocket handler. Critical fix.", 1, nil},
		{30, "PR: Docker Optimization", "Pull Request #415: Multi-stage Docker build to reduce image size by 60%.", 2, nil},

		// List 31: QA / Testing
		{31, "Load Test Auth", "Run k6 load tests against the authentication service to verify it can handle 10k RPS.", 0, nil},
		{31, "Verify Backup Restore", "Perform a drill to verify that we can successfully restore the database from a point-in-time backup.", 1, nil},
		{31, "Test Mobile Layout", "Manual testing of the new responsive layout on iOS and Android devices.", 2, nil},

		// List 32: Ready for Prod
		{32, "Release v2.1.0", "Release candidate v2.1.0 is ready. Includes the new dashboard and performance improvements.", 0, nil},
		{32, "Update Config", "Production configuration changes needed for the new caching layer.", 1, nil},

		// List 33: Deployed
		{33, "Hotfix: Login Timeout", "Fixed an issue where sessions were timing out too early. Deployed to prod on Monday.", 0, nil},
		{33, "Migrate to AWS RDS", "Successfully migrated the primary database to AWS RDS. Performance is stable.", 1, nil},
		{33, "Deprecate v1 API", "v1 API endpoints have been deprecated and now return a 410 Gone status.", 2, nil},
		{33, "Implement SSO", "Single Sign-On with Google and GitHub is now live for all users.", 3, nil},
		{33, "Setup CI/CD", "GitHub Actions pipeline is fully operational for all microservices.", 4, nil},
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
		{0, 1}, // Feature
		{1, 3}, // Documentation
		{2, 2}, // Enhancement
		{3, 0}, // Bug

		{6, 5}, // Marketing
		{7, 6}, // Social

		{11, 8}, // UI
		{13, 9}, // Mobile

		{14, 11}, // High Priority

		{19, 13}, // Hot Lead
		{20, 14}, // Cold Lead

		{23, 15}, // Furniture

		{26, 17}, // Strategic

		// Board 9 Labels
		{29, 24}, // GraphQL -> Enhancement
		{30, 24}, // HTTP/3 -> Enhancement
		{31, 23}, // Audit Log -> Feature
		{32, 23}, // Webhooks -> Feature

		{33, 29}, // SQL Opt -> Refactor
		{34, 30}, // Dependencies -> DevOps
		{35, 23}, // Rate Limiting -> Feature
		{36, 29}, // Error Logging -> Refactor
		{37, 30}, // Integration Tests -> DevOps

		{38, 29}, // User Service -> Refactor
		{39, 23}, // 2FA -> Feature
		{40, 22}, // Memory Leak -> Bug
		{40, 26}, // Memory Leak -> Critical
		{41, 25}, // API Docs -> Documentation

		{42, 23}, // Search -> Feature
		{43, 22}, // Race Condition -> Bug
		{43, 26}, // Race Condition -> Critical
		{44, 30}, // Docker -> DevOps

		{45, 30}, // Load Test -> DevOps
		{46, 30}, // Backup Restore -> DevOps
		{47, 22}, // Mobile Test -> Bug

		{48, 30}, // Release -> DevOps
		{49, 30}, // Config -> DevOps

		{50, 22}, // Hotfix -> Bug
		{50, 26}, // Hotfix -> Critical
		{51, 30}, // RDS -> DevOps
		{52, 25}, // Deprecation -> Documentation
		{53, 23}, // SSO -> Feature
		{54, 30}, // CI/CD -> DevOps
	}

	count := 0
	for _, data := range cardLabelData {
		err := s.queries.AddLabelToCard(ctx, sqlc.AddLabelToCardParams{
			CardID:  cards[data.cardIdx].ID,
			LabelID: labels[data.labelIdx].ID,
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
		{0, 0}, {0, 1}, // Alice, Bob on Auth
		{2, 2},           // Charlie on Refactor
		{6, 3},           // Diana on Ads
		{14, 5},          // Frank on Acme
		{19, 6},          // Grace on Chairs
		{21, 0}, {21, 9}, // Alice, Judy on ARR
		{26, 0}, // Alice on Strategy

		// Amine's Assignments
		{24, 10}, // Amine
		{25, 0},  // Alice
		{26, 10}, // Amine
		{27, 1},  // Bob
		{28, 10}, // Amine

		// Core API Team Assignments
		{29, 0}, {29, 2}, // Alice, Charlie on GraphQL
		{30, 4}, // Eve on HTTP/3
		{31, 5}, // Frank on Audit Log
		{32, 8}, // Ivan on Webhooks

		{33, 2}, // Charlie on SQL Optimization
		{34, 4}, // Eve on Dependencies
		{35, 5}, // Frank on Rate Limiting
		{36, 8}, // Ivan on Error Logging
		{37, 0}, // Alice on Integration Tests

		{38, 2}, {38, 4}, // Charlie, Eve on User Service
		{39, 5}, // Frank on 2FA
		{40, 8}, // Ivan on Memory Leak
		{41, 0}, // Alice on API Docs

		{42, 0}, {42, 2}, // Alice, Charlie Review Search
		{43, 4}, {43, 5}, // Eve, Frank Review Race Condition
		{44, 8}, // Ivan Review Docker

		{45, 5}, // Frank on Load Test
		{46, 8}, // Ivan on Backup Restore
		{47, 0}, // Alice on Mobile Test

		{48, 2}, // Charlie on Release
		{49, 4}, // Eve on Config

		{50, 5}, // Frank on Hotfix
		{51, 8}, // Ivan on RDS Migration
		{52, 0}, // Alice on Deprecation
		{53, 2}, // Charlie on SSO
		{54, 4}, // Eve on CI/CD
	}

	count := 0
	for _, data := range assignmentData {
		err := s.queries.AssignUserToCard(ctx, sqlc.AssignUserToCardParams{
			CardID: cards[data.cardIdx].ID,
			UserID: users[data.userIdx].ID,
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
		{14, 0, "I know the CTO personally, let me intro you."},
		{19, 6, "Herman Miller is too expensive, looking at alternatives."},
		{26, 9, "This is ambitious but doable."},

		// Comments for Amine's Project
		{24, 10, "Environment setup complete. Ready to start coding."},
		{26, 10, "API design looks good. Will start implementation tomorrow."},
		{28, 10, "Project plan drafted. Waiting for approval."},

		// Comments for Core API Team
		{29, 2, "I've started looking into gqlgen, looks promising."},
		{29, 0, "Make sure to check how it handles N+1 queries."},
		{30, 4, "HTTP/3 requires TLS 1.3, we need to update our certs."},
		{31, 5, "Should we use Elasticsearch for storing logs?"},
		{31, 8, "Yes, or maybe ClickHouse for better compression."},
		{33, 2, "Found a missing index on the `cards` table. Adding it now."},
		{40, 8, "The leak seems to be in the image processing library."},
		{40, 0, "Can we upgrade the library to fix it?"},
		{43, 4, "I can reproduce this race condition consistently now."},
		{43, 5, "Great, let's pair on the fix."},
		{50, 5, "Deployed the hotfix, monitoring error rates."},
		{50, 1, "Good job team, looks stable."},
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
