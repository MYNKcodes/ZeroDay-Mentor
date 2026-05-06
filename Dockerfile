# Stage 1: Build the frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the backend and serve the app
FROM node:22-alpine
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --production
COPY backend/ ./

# Copy compiled frontend from Stage 1
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Expose port (Cloud Run sets PORT env var)
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
