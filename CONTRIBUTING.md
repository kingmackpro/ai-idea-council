# AI Idea Council

A local-first web application where a user submits an idea and watches a council of AI characters analyze, debate, challenge, and judge it.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Express.js (Node.js)
- **AI Provider**: Any OpenAI-compatible endpoint (OpenAI, OpenRouter, Ollama, LM Studio, etc.)
- **Streaming**: Server-Sent Events (SSE)
- **Storage**: LocalStorage (sessions), environment variables (config)

## Features

- Connect to any OpenAI-compatible API endpoint
- Visual council room with 4 agents (Believer, Skeptic, Investor, Judge)
- Live debate with animated agent states
- Structured verdict with scores
- Session persistence
- Challenge Verdict mode
- Responsive design

## Installation & Run

```bash
# Clone
git clone https://github.com/kingmackpro/ai-idea-council.git
cd ai-idea-council

# Install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Run
cd server && npm start &
cd client && npm run dev

# Open http://localhost:5173
```

## Docker

```bash
docker-compose up --build
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/config` | Get current config |
| POST | `/api/config` | Save config (baseUrl, apiKey, model) |
| GET | `/api/models` | List available models |
| POST | `/api/chat/completions` | Chat completions proxy |
| GET | `/api/events` | SSE event stream |
| POST | `/api/orchestrate` | Run council debate |
| GET | `/api/sessions` | List saved sessions |

## Project Structure

- `server/` — Backend (Express + proxy)
- `client/` — Frontend (React + Vite)
- `TODO.md` — Task list

## License

MIT