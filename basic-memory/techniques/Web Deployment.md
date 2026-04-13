---
title: Deployment Guide
type: note
permalink: deployment-guide
---

# Web Deployment

Self-hosted deployment using Docker Compose with PostgreSQL + PostgREST backend.

## Architecture

Four Docker services orchestrated via `docker-compose.yml`:
* **postgres**: PostgreSQL 16 database with automatic schema initialization
* **postgrest**: REST API layer for database access
* **app**: Svelte frontend application
* **nginx**: Reverse proxy with rate limiting

## Environment Configuration

1. Copy `.env.example` to `.env`
2. Configure required variables:

```bash
VITE_POSTGREST_URL=http://localhost/api  # or production URL
POSTGRES_PASSWORD=your_secure_password_here
PGRST_JWT_SECRET=  # optional, empty for anonymous-only
```

3. **Critical**: Update password in `docker/postgres/init.sql` to match `POSTGRES_PASSWORD`

## Deployment

### Local Development

```bash
# Install frontend dependencies
npm install

# Start backend services only
docker compose up -d postgres postgrest nginx

# Run frontend in dev mode
npm run dev
```

Frontend: `http://localhost:5173`  
API: `http://localhost/api`

### Production

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f
```

Application: `http://localhost`  
API: `http://localhost/api`

## Database Management

### Access PostgreSQL

```bash
docker compose exec postgres psql -U postgres -d zeilenschreiben
```

### Schema Initialization

Schema auto-initializes on first startup via:
- `docker/postgres/init.sql`: Creates tables, indexes, RLS policies
- `docker/postgres/init.sh`: Creates PostgREST roles and permissions

### Backup and Restore

```bash
# Create backup
docker compose exec postgres pg_dump -U postgres zeilenschreiben > backup.sql

# Restore from backup
cat backup.sql | docker compose exec -T postgres psql -U postgres -d zeilenschreiben
```

## Security

### Rate Limiting (nginx)

- API endpoints: 60 requests/minute per IP (burst: 10)
- Application: 10 requests/second per IP (burst: 20)
- Exceeding limits returns HTTP 429

### Row Level Security

All tables use RLS with anonymous access policies:
- `anon_user` role can SELECT and INSERT
- No UPDATE or DELETE permissions
- Enforced at database level

### Passwords

- Never commit `.env` files
- Use strong passwords for `POSTGRES_PASSWORD`
- Rotate passwords by updating `.env` and `init.sql`, then recreating containers

## Monitoring

- Health check: `http://localhost/health`
- PostgreSQL port: 5432 (localhost only)
- PostgREST logs: `docker compose logs -f postgrest`
- nginx logs: `docker compose logs -f nginx`