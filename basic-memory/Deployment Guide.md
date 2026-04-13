---
title: Deployment Guide
type: note
permalink: basic-memory/deployment-guide
---

# Deployment Guide

This guide covers deploying the Zeilenschreiben application with Supabase backend.

## Architecture

The application consists of two main components:
* **Supabase Backend**: Hosted on supabase.com, provides database, authentication, and API
* **App Container**: Docker container running the Svelte frontend, deployed separately

## Supabase Backend Setup

### Initial Setup

1. **`npx supabase login`** - Authenticates your CLI with your Supabase account to enable remote operations

2. **`npx supabase link --project-ref <project-id>`** - Connects your local repository to your hosted Supabase project for syncing migrations and schema

3. **`npx supabase db push`** - Applies all pending migrations from `supabase/migrations/` to your remote database in chronological order

### Environment Variables

For production deployment, configure these environment variables in your app container:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Get these values from your Supabase project dashboard under Settings > API.

## App Container Deployment

The application is containerized using the [`Dockerfile`](../Dockerfile) and can be deployed to any container hosting platform.

### Build and Deploy

```bash
# Build the container
docker build -t zeilenschreiben \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=sb_publishable_... \
  .

# Run locally for testing
docker run -p 3000:80 zeilenschreiben

# Or use docker-compose
docker-compose up -d
```

### Deployment Platforms

The container can be deployed to:
* **Docker Swarm** or **Kubernetes** for self-hosted solutions
* **Cloud platforms** like AWS ECS, Google Cloud Run, Azure Container Instances
* **PaaS providers** like Railway, Render, or Fly.io

## Local Development vs Production

### Local Development
* Run `npx supabase start` to spin up local Supabase stack in Docker
* Use `http://localhost:54321` as API URL
* Use publishable key from `npx supabase status` output
* Migrations auto-apply on start

### Production
* Use hosted Supabase project URL
* Use production publishable key from dashboard
* Push migrations explicitly with `npx supabase db push`
* Monitor through Supabase Dashboard

## Migration Workflow

1. **Develop locally**: Create and test migrations with `npx supabase migration new <name>`
2. **Test locally**: Run `npx supabase db reset` to apply all migrations fresh
3. **Commit to git**: Version control your migration files
4. **Push to production**: Run `npx supabase db push` to apply to remote database
5. **Verify**: Check Supabase Dashboard or run `npx supabase db remote status`

## Security Considerations

* Never commit `.env` files with production credentials
* Use publishable keys for client-side code (respects Row Level Security)
* Use secret keys only in secure backend environments
* Enable Row Level Security policies on all tables
* Regularly rotate API keys if compromised