# Project Architecture

## Overview

The application follows a full-stack architecture using Next.js on the application layer, Prisma as the ORM, and PostgreSQL as the database.

## Main Layers

### Frontend

The frontend is responsible for:

- Rendering the user interface
- Handling user interactions
- Managing client-side state
- Communicating with backend APIs

### Backend

The backend is responsible for:

- Processing API requests
- Validating incoming data
- Executing application logic
- Communicating with the database

### Database

PostgreSQL stores persistent application data.

Prisma provides the database access layer and manages communication between the application and PostgreSQL.

## General Request Flow

User
→ Next.js Application
→ API / Server Logic
→ Prisma
→ PostgreSQL

The response then follows the reverse path back to the user interface.