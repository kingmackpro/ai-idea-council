# AI Idea Council

A local-first web application where a user submits an idea and watches a council of AI characters analyze, debate, challenge, and judge it.

## Features

- Connect to any OpenAI-compatible API endpoint (OpenAI, OpenRouter, Ollama, LM Studio, etc.)
- Visual council room with four agents: Believer, Skeptic, Investor, Judge
- Live debate with animated agent states and speech bubbles
- Structured final verdict with scores and recommendations
- Session persistence (save/load sessions locally)
- Challenge Verdict mode to stress-test the judge's decision
- Modify Idea and Rerun actions
- Responsive design
- SSE event streaming for real-time events
- Local-first — no account required

## Getting Started

### Prerequisites

- Node.js (v14+)
- An OpenAI-compatible API endpoint (you provide the base URL and optional API key)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kingmackpro/ai-idea-council.git
   cd ai-idea-council
   ```

2. Install dependencies for both client and server:
   ```bash
   # Install server dependencies
   cd server
   npm install
   cd ..

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. Create a `.env` file in the `server` directory (optional — UI can set these):
   ```
   PORT=5000
   BASE_URL=https://api.openai.com/v1
   API_KEY=sk-...
   MODEL=gpt-4o
   ```

### Development

Start the backend server (terminal 1):
```bash
cd server
npm start
```

Start the frontend dev server (terminal 2):
```bash
cd client
npm run dev
```

Open http://localhost:5173 in your browser.

### Usage

1. Enter your AI endpoint's Base URL.
2. Optionally enter an API key (leave blank for local endpoints that don't require auth).
3. Click "Save Connection".
4. Click "FETCH MODELS" to populate the model list, or enter a model manually.
5. Click "[ TEST CONNECTION ]" to verify the endpoint works.
6. Enter your idea in the textarea.
7. Click "[ ⚡ START COUNCIL ]" to begin the debate.
8. Watch the agents analyze, debate, and reach a verdict.
9. Use the buttons to Rerun, Challenge Verdict, Modify Idea, or Save Session.

## Project Structure

- `server/` — Express backend that proxies requests to your AI endpoint and provides SSE event streaming.
- `client/` — React + Vite frontend with the connection screen and council room UI.
- `TODO.md` — Development task list.

## License

MIT