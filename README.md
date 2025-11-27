# Expense Tracker

A full-stack expense tracking application with JWT authentication, built with Spring Boot backend and React frontend.

## Quick Start

```bash
# With Docker (recommended)
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8081
# Database: localhost:5432
```

## Tech Stack

- **Backend**: Spring Boot 3.5.5, PostgreSQL, JWT
- **Frontend**: React 19, Vite, Tailwind CSS
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose

## Features

- User authentication with JWT
- Expense CRUD operations
- Category-based filtering
- Real-time dashboard
- Responsive UI

## CI/CD Pipeline

This project uses GitHub Actions for automated Docker image building and deployment.

### GitHub Actions Workflow

The CI/CD pipeline is triggered on:

- Push to `main`/`master` branch
- Pull requests to `main`/`master` branch
- Manual workflow dispatch

### Features

- **Multi-platform builds**: Supports `linux/amd64` and `linux/arm64`
- **Docker Hub integration**: Automatically pushes images to Docker Hub
- **Smart tagging**: Uses branch names, PR numbers, and commit SHAs
- **Build caching**: Uses GitHub Actions cache for faster builds
- **Deployment summary**: Generates a summary of built images

### Required Secrets

To enable the CI/CD pipeline, add the following repository secret:

- `DOCKER_HUB_TOKEN`: Your Docker Hub access token

### Docker Images

The pipeline builds and pushes these images:

- `agentcat1/expense-tracker-backend`: Spring Boot backend
- `agentcat1/expense-tracker-frontend`: React frontend

### Local Development

```bash
# Build and run locally
docker-compose up --build

# Or pull latest images and run
docker-compose pull
docker-compose up
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense
