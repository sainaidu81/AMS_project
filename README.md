# AMS Project

Asset Management System with a Java backend, React frontend, and Supabase-hosted PostgreSQL database.

## Project Structure

- `backend/` - Java backend using `com.sun.net.httpserver.HttpServer`, Maven, JDBC, and PostgreSQL.
- `frontend/` - React + Vite frontend for the AMS web interface.
- `DB/` - Database schema and ERD files.
- `.agents/skills/supabase/` - Repo-local Supabase guidance for agents working on database, auth, and backend authorization tasks.

## Backend

The backend starts an HTTP server on port `8081` and exposes routes for login, employees, users, assets, and asset assignments.

Required local configuration:

- Create `backend/.env` from `backend/.env.example`.
- Set `SUPABASE_DB_PASSWORD`.
- Set `AMS_TOKEN_SECRET` if you do not want token signing to fall back to the database password.

Common commands:

```sh
mvn -f backend/pom.xml compile
mvn -f backend/pom.xml package
cd backend && mvn compile exec:java -Dexec.mainClass=Main
```

## Frontend

The frontend is a Vite app that calls the backend at `http://localhost:8081`.

Common commands:

```sh
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

## Database

The backend connects to Supabase PostgreSQL through JDBC. The schema reference is in `DB/schema.sql`.

Authorization should be enforced by the backend. Do not rely on frontend role checks as the source of truth.
