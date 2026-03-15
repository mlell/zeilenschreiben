# Dockerfile - Multi-stage build for Zeilenschreiben
# Stage 1: Build the Svelte application
# Stage 2: Serve with nginx for production

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# Build arguments (injected at build time)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_BASE_PATH=/

# Build the application with environment variables
RUN npm run build

# Production stage - lightweight nginx server
FROM nginxinc/nginx-unprivileged AS production

# Copy built assets to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing: redirect all requests to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
