# Install root deps first (concurrently), then server + client
npm install
npm run install

# Run both servers with one command
npm run dev

# Or start them manually in two terminals:
#   cd server && npm run dev
#   cd client && npm run dev

# Open http://localhost:5173
