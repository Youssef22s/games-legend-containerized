# Games Legend

A full-stack e-commerce application for buying, selling, and managing games.

This repository contains the **Dockerized version** of the original Games Legend application, with the frontend, backend, and MySQL database running as separate containers using Docker Compose.

## Tech Stack

* **Frontend:** HTML, CSS, JavaScript, Bootstrap
* **Backend:** Python, Flask, REST API
* **Database:** MySQL 8.0
* **Web Server / Reverse Proxy:** Nginx
* **Containerization:** Docker, Docker Compose
* **Authentication:** JWT, bcrypt
* **Payments:** Stripe

## Architecture

```text
                    Browser
                       │
                       ▼
              ┌─────────────────┐
              │    Frontend     │
              │      Nginx      │
              │      :80        │
              └────────┬────────┘
                       │
                    /api/*
                       │
                       ▼
              ┌─────────────────┐
              │     Backend     │
              │     Flask       │
              │      :5000      │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │      MySQL      │
              │      :3306      │
              └─────────────────┘
```

The three services communicate through the Docker Compose network.

Nginx serves the frontend and proxies `/api/*` requests to the Flask backend.

The backend connects to MySQL using the Docker Compose service name:

```text
db
```

instead of `localhost`.

## Docker Compose Services

| Service    | Technology | Port | Purpose                                  |
| ---------- | ---------- | ---: | ---------------------------------------- |
| `frontend` | Nginx      |   80 | Serves frontend and proxies API requests |
| `backend`  | Flask      | 5000 | Provides the REST API                    |
| `db`       | MySQL 8.0  | 3306 | Stores application data                  |

The application is available at:

```text
http://localhost:8080
```

## Project Structure

```text
games-legend/
│
├── backend/
│   ├── app/
│   ├── create_admin.py
│   ├── requirements.txt
│   ├── run.py
│   └── Dockerfile
│
├── database/
│   └── games_legend.sql
│
├── frontend/
│   ├── assets/
│   ├── *.html
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

* Docker
* Docker Compose
* Git

### Clone the Repository

```bash
git clone https://github.com/Youssef22s/dockerized-games-legend.git
cd dockerized-games-legend
```

### Configure Environment Variables

Create the environment file:

```bash
cp .env.example .env
```

Update `.env` with your local configuration.

> Never commit `.env` or real credentials to Git.

### Build and Run

```bash
docker compose up -d --build
```

Check the services:

```bash
docker compose ps
```

Open the application:

```text
http://localhost:8080
```

## Useful Commands

### View logs

```bash
docker compose logs -f
```

### View logs for a specific service

```bash
docker compose logs -f backend
```

```bash
docker compose logs -f frontend
```

```bash
docker compose logs -f db
```

### Stop the application

```bash
docker compose down
```

### Rebuild after code changes

```bash
docker compose up -d --build
```

## Database

The MySQL database is initialized using:

```text
database/games_legend.sql
```

Database configuration is managed through environment variables.

Example:

```env
DB_HOST=db
DB_PORT=3306
DB_NAME=games_legend
DB_USER=games_user
DB_PASSWORD=your_password
```

## Docker Images

The application images are available on Docker Hub:

* `youssef4403/games-legend-backend`
* `youssef4403/games-legend-frontend`

They can also be built locally with:

```bash
docker compose build
```

## Nginx Reverse Proxy

Nginx acts as both the frontend web server and reverse proxy.

```text
/          → Frontend
/api/*     → Flask Backend
```

This allows the frontend to communicate with the API using:

```javascript
const API_BASE_URL = "/api";
```

without exposing or hardcoding the backend container address in the frontend.

## Environment Variables

The application uses environment variables for:

* Database configuration
* JWT secret
* Stripe secret key
* Frontend URL

A template is provided in:

```text
.env.example
```

## License

Educational and portfolio project.

