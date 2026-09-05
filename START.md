# Clone
```bash
git clone https://github.com/kingmackpro/ai-idea-council.git
cd ai-idea-council
```

# Install
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install

# Create .env (optional — UI can set these)
cd ../server
cp .env.example .env
```

# Start
```bash
# Backend
cd server
npm start

# Frontend (in another terminal)
cd client
npm run dev
```

# Or use docker
```bash
docker-compose up --build
```

# Open
Open http://localhost:5173