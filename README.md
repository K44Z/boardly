# Boardly

A kanban board for small teams, built as a software engineering class project. Boards hold lists, lists hold cards. Cards get labels, assignees, due dates and comments. It also has board analytics, voice-note transcription, local AI prompts, and calls from the board.

## Stack

- **API:** Go, Fiber, PostgreSQL (pgx, sqlc, goose migrations)
- **Queue:** RabbitMQ. Assigning a card publishes a message, and `cmd/consumer` emails the assignee through Brevo.
- **AI:** Ollama for prompts, Whisper for speech-to-text (`internal/ai`)
- **Calls:** Agora
- **Web:** Next.js, Tailwind, shadcn/ui, framer-motion (`web/`)

## Run it

Backend (needs PostgreSQL and, optionally, RabbitMQ):

```sh
cp .env.example .env   # then fill it in
go run .               # API on :8080
go run ./cmd/consumer  # email worker (optional)
make test              # integration tests
```

Frontend:

```sh
cd web
npm install
npm run dev            # http://localhost:3000
```

## Environment

| Variable | Used for | Default |
| --- | --- | --- |
| `GOOSE_DBSTRING` | Postgres connection string | required |
| `JWT_SECRET` | signing login tokens | required |
| `PORT` | API port | `8080` |
| `RABBITMQ_URL` | assignment emails | `amqp://guest:guest@localhost:5672/` |
| `CORS_ORIGIN` | allowed web origin | `http://localhost:3000` |
| `OLLAMA_URL` | AI prompts | `http://localhost:11434` |
| `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE` | calls | none |
| `Brevo` | email API key, for the consumer | none |

## Layout

```
internal/<feature>/   routes → handlers → services → repository
database/             migrations, sqlc queries, seeders
cmd/consumer/         RabbitMQ email worker
web/                  Next.js app (landing, auth, boards)
```
