#!/bin/bash
set -e

# This script creates PostgreSQL roles for PostgREST
# It uses the POSTGRES_PASSWORD environment variable for the authenticator role
# This keeps sensitive passwords out of version control

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create dedicated role for PostgREST using environment variable
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD '$POSTGRES_PASSWORD';
    CREATE ROLE anon_user;
    GRANT anon_user TO authenticator;

    -- Grant permissions to anon_user role
    GRANT USAGE ON SCHEMA public TO anon_user;
    GRANT SELECT, INSERT ON typing_sessions TO anon_user;
    GRANT SELECT, INSERT ON student_results TO anon_user;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon_user;
EOSQL
