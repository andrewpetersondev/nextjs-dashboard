#!/bin/sh

# Enable pnpm with corepack
sudo corepack enable pnpm

# Clean the pnpm store
pnpm store prune

# update package manager
pnpm self-update

# Install dependencies
pnpm install

# Create PostgreSQL schema
# psql postgresql://postgres:postgres@localhost:5432/postgres -c 'CREATE SCHEMA IF NOT EXISTS public'

# Check if the public schema exists and create it if it doesn't
psql postgresql://postgres:postgres@localhost:5432/postgres -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'public') THEN CREATE SCHEMA public; END IF; END \$\$;"

# Run migrations
pnpm run schema-update

# Seed the database
pnpm run drizzle:seed