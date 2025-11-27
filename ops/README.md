# Kubernetes Deployment for Expense Tracker

## Directory Structure

```
ops/
├── database/
│   └── postgres.yaml          # PostgreSQL deployment and service
├── backend/
│   └── backend.yaml           # Spring Boot backend deployment and service
├── frontend/
│   └── frontend.yaml          # React frontend deployment and service
├── networking/
│   ├── namespace.yaml         # Application namespace
│   ├── secrets.yaml           # Database and JWT secrets
│   └── ingress.yaml           # NGINX Ingress configuration
├── scripts/
│   └── deploy.sh              # Automated deployment script
└── README.md                  # This file
```

## Overview

Complete Kubernetes manifest files for deploying the Expense Tracker application with PostgreSQL database, backend API, and frontend UI.

## Files Description

### 🗄️ Database (`database/`)

- **postgres.yaml**: PostgreSQL 15-alpine deployment with persistent storage, health checks, and ClusterIP service

### 🔧 Backend (`backend/`)

- **backend.yaml**: Spring Boot backend deployment (2 replicas) using `agentcat1/expense-tracker-backend:latest`, with environment variables, health checks, and ClusterIP service

### 🎨 Frontend (`frontend/`)

- **frontend.yaml**: React frontend deployment (2 replicas) using `agentcat1/expense-tracker-frontend:latest`, with LoadBalancer service for external access

### 🌐 Networking (`networking/`)

- **namespace.yaml**: Dedicated namespace `expense-tracker`
- **secrets.yaml**: PostgreSQL credentials and JWT secret (base64 encoded)
- **ingress.yaml**: NGINX Ingress for path-based routing

### 📜 Scripts (`scripts/`)

- **deploy.sh**: Automated deployment script with error handling and status checks

## Deployment Steps

### Prerequisites

```bash
# Install kubectl and configure cluster access
# Ensure NGINX Ingress Controller is installed
```

### Quick Deploy (Recommended)

```bash
cd /home/vishnu/Documents/CICD/ops/scripts
./deploy.sh
```

### Manual Deploy

```bash
# Deploy in order
kubectl apply -f networking/namespace.yaml
kubectl apply -f networking/secrets.yaml
kubectl apply -f database/postgres.yaml
kubectl apply -f backend/backend.yaml
kubectl apply -f frontend/frontend.yaml
kubectl apply -f networking/ingress.yaml

# Or deploy all at once
kubectl apply -f networking/
kubectl apply -f database/
kubectl apply -f backend/
kubectl apply -f frontend/
```

### Verify Deployment

```bash
# Check all resources
kubectl get all -n expense-tracker

# Check pods
kubectl get pods -n expense-tracker

# Check services
kubectl get services -n expense-tracker

# Check ingress
kubectl get ingress -n expense-tracker

# View logs
kubectl logs -n expense-tracker deployment/backend
kubectl logs -n expense-tracker deployment/frontend
kubectl logs -n expense-tracker deployment/postgres
```

### Access Application

```bash
# If using LoadBalancer (frontend service)
kubectl get services -n expense-tracker
# Use the external IP for frontend-service

# If using Ingress
# Add to /etc/hosts:
# <ingress-ip> expense-tracker.local
# Then access: http://expense-tracker.local
```

## Scaling

### Horizontal Scaling

```bash
# Scale backend
kubectl scale deployment backend --replicas=3 -n expense-tracker

# Scale frontend
kubectl scale deployment frontend --replicas=3 -n expense-tracker
```

### Vertical Scaling

Update `resources.requests` and `resources.limits` in deployment files.

## Monitoring & Logging

```bash
# Real-time logs
kubectl logs -f -n expense-tracker deployment/backend

# Resource usage
kubectl top pods -n expense-tracker

# Events
kubectl get events -n expense-tracker --sort-by='.lastTimestamp'
```

## Cleanup

```bash
# Delete entire namespace and all resources
kubectl delete namespace expense-tracker
```

## Notes

- Images are pulled from Docker Hub repository
- Secrets contain base64 encoded values
- PostgreSQL data persists using PVC
- All services have health checks and resource limits
- Frontend uses LoadBalancer for easy external access
- Backend uses ClusterIP (internal access only)
- Ingress provides single entry point with path-based routing
