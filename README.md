# Finance Tracker Application

A personal finance application built with Nuxt 3 for the frontend and NestJS for the backend.

## Features

- Transaction management
- Transaction import
- Categorization
- Filtering
- Analytics
- Responsive design

## Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Docker and Docker Compose (for containerized deployment)

## Development Setup

### Without Docker

1. Install dependencies:
   ```
   npm run install:all
   ```

2. Start the development servers:
   ```
   npm run dev
   ```

### With Docker

#### Database Only (with pgAdmin)

1. Start PostgreSQL and pgAdmin:
   ```
   npm run docker:db
   ```

2. Access pgAdmin at http://localhost:5050
   - Email: admin@admin.com
   - Password: admin

3. Connect to PostgreSQL:
   - Host: postgres
   - Port: 5432
   - Database: bank_transactions
   - Username: postgres
   - Password: postgres

4. Stop the database containers:
   ```
   npm run docker:db:down
   ```

#### Full Application Stack

1. Build the Docker images:
   ```
   npm run docker:build
   ```

2. Start all services:
   ```
   npm run docker:full
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - pgAdmin: Start separately with `npm run docker:db` if needed

4. Stop all containers:
   ```
   npm run docker:full:down
   ```

## Project Structure

```
finance-tracker/
├── frontend/         # Nuxt 3 frontend
├── backend/          # NestJS backend
├── docker-compose.yml        # Docker Compose configuration for full stack
└── docker-compose.db.yml     # Docker Compose configuration for database only
``` 