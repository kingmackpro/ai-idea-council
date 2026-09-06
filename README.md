# AI Idea Council

![CI](https://github.com/kingmackpro/ai-idea-council/actions/workflows/ci.yml/badge.svg)

## Overview
A local, visual multi‑agent debate arena powered by any OpenAI‑compatible API. Users configure a base URL and API key, select a model, and submit an idea. Four agents (Believer, Skeptic, Investor, Judge) discuss the idea in real‑time via Server‑Sent Events, culminating in a verdict.

## Features
- **Plug‑and‑play**: Works with any OpenAI‑compatible endpoint.
- **Live streaming** of agent states and messages.
- **Persisted sessions** stored locally.
- **Docker support** for both client and server.
- **Full CI/CD** with linting, formatting, and tests.
- **Pre‑commit hooks** (husky + lint‑staged) for code quality.
- **Configurable** via `.env` (see `.env.example`).

## Getting Started
```bash
# Clone the repo (already done)
# Install dependencies
npm run install

# Run both client and server concurrently
npm run dev:all   # or npm run dev (uses concurrently)
```

## Scripts
| Script | Description |
|--------|-------------|
| `install` | Installs root, client and server dependencies |
| `dev:all` | Starts client and server concurrently |
| `lint` | Lints client and server code |
| `format` | Formats all files with Prettier |
| `test` | Runs client and server tests |
| `build` | Builds client (Vite) and server (if applicable) |
| `preview` | Serves the built client locally |

## Docker
```bash
# Build and run containers
docker-compose up --build
```

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License
MIT