# Zeilenschreiben

A web application for practicing touch typing with a focus on error-free line completion. Students type lines exactly as shown, and their accuracy is tracked by the percentage of error-free lines.

## Features

- **Teacher Mode**: Create typing sessions with custom text and optional time limits
- **Student Mode**: Join sessions via code or practice independently
- **Real-time Feedback**: Visual indicators for correct/incorrect typing
- **Results Tracking**: View student performance and accuracy statistics

## Tech Stack

- **Frontend**: Svelte + TypeScript + Vite
- **Backend**: PostgreSQL 16 + PostgREST
- **Deployment**: Docker Compose with nginx reverse proxy
- **Styling**: TailwindCSS

## Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your configuration:
   ```env
   VITE_POSTGREST_URL=http://localhost/api
   POSTGRES_PASSWORD=your_secure_password_here
   PGRST_JWT_SECRET=
   ```

3. **Important**: Update the database password in `docker/postgres/init.sql`:
   - Replace `your_password_here` with the same password from `POSTGRES_PASSWORD`

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Start the backend services:
   ```bash
   docker compose up -d postgres postgrest nginx
   ```

### Production Deployment

1. Build and start all services:
   ```bash
   docker compose up -d
   ```

2. The application will be available at `http://localhost`

3. API endpoints are available at `http://localhost/api`

## Architecture

### Services

- **postgres**: PostgreSQL 16 database with automatic schema initialization
- **postgrest**: REST API layer for database access
- **app**: Svelte frontend application
- **nginx**: Reverse proxy with rate limiting

### Rate Limiting

- API endpoints: 60 requests/minute per IP (burst: 10)
- Application: 10 requests/second per IP (burst: 20)
- Exceeding limits returns HTTP 429 (Too Many Requests)

### Database Schema

- `typing_sessions`: Stores teacher-created sessions with codes
- `student_results`: Stores student typing results and performance metrics

## Development

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
```

### Database Management

Access PostgreSQL directly:
```bash
docker compose exec postgres psql -U postgres -d zeilenschreiben
```

View PostgREST logs:
```bash
docker compose logs -f postgrest
```

## Monitoring

- Health check: `http://localhost/health`
- PostgreSQL: Port 5432 (localhost only)
- nginx access logs: `docker compose logs nginx`

## Backup

Create database backup:
```bash
docker compose exec postgres pg_dump -U postgres zeilenschreiben > backup.sql
```

Restore from backup:
```bash
cat backup.sql | docker compose exec -T postgres psql -U postgres -d zeilenschreiben
```
