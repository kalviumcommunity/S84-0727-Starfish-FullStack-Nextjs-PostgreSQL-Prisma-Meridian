# API Documentation

## Overview

The application exposes backend functionality through API routes.

## Request Flow

A typical API request follows this process:

1. Client sends a request.
2. Next.js receives the request.
3. Request data is validated.
4. Application logic processes the request.
5. Prisma communicates with PostgreSQL when database access is required.
6. A response is returned to the client.

## HTTP Methods

Common HTTP methods used by REST APIs include:

- GET - Retrieve data
- POST - Create data
- PUT - Update existing data
- PATCH - Partially update data
- DELETE - Remove data

## Error Handling

API consumers should check the HTTP response status before processing the response body.

Typical status categories include:

- 2xx - Successful request
- 4xx - Client-side error
- 5xx - Server-side error