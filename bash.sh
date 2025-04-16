#!/bin/bash

# Navigate to backend and start the server
echo "Starting backend..."
node server.js &

# Navigate to frontend and start Next.js
echo "Starting frontend..."
cd frontend && npm run dev &

# Wait for both processes to keep running
wait
