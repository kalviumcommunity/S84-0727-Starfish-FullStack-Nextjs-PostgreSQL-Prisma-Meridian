# Database Guide

## Database

The project uses PostgreSQL for persistent data storage.

## Prisma

Prisma acts as the ORM between the application and PostgreSQL.

It provides:

- Database schema management
- Type-safe database queries
- Database migrations
- Developer-friendly database access

## Database Workflow

The general database workflow is:

Application
→ Prisma
→ PostgreSQL

## Environment Variables

Database connection details should be stored in environment variables rather than hardcoded in source code.

## Migrations

When the database schema changes, Prisma migrations can be used to apply the changes to the database.

Always review database changes before applying migrations to shared environments.