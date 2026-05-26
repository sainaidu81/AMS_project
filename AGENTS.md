# AI Agent Instructions for AMS_project

## Overview
This repository is a small monorepo with two main applications:
- `backend/`: Java HTTP server built with `com.sun.net.httpserver.HttpServer` and Maven
- `frontend/`: React + Vite frontend with a modern JavaScript stack

The backend and frontend are separate apps, so changes should usually be restricted to one side unless working on integration, API contracts, or shared assumptions.

## Useful commands

### Backend
- Build: `mvn -f backend/pom.xml package`
- Compile only: `mvn -f backend/pom.xml compile`
- Run: compile then execute `java -cp backend/target/classes Main`
- Dependencies are managed in `backend/pom.xml`

### Frontend
- Install: run `npm install` inside `frontend/`
- Development server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Architecture
- `backend/Main.java` starts an HTTP server on port `8081`
- Backend routes:
  - `/login`
  - `/employees`
  - `/users`
  - `/assets`
  - `/asset_assignments`
  - `/assets_assignements`
- Backend data access is in `backend/src/main/java/util`
- Frontend entrypoint is `frontend/src/main.jsx`
- Frontend pages live in `frontend/src/pages`
- API calls are centralized in `frontend/src/services/api.js`

## Special notes
- The backend is not a Spring app; it uses the JDK HTTP server directly.
- The project uses PostgreSQL JDBC in the backend, and a database schema is available under `DB/schema.sql`.
- There is no existing `.github/copilot-instructions.md` or `AGENTS.md` in the repo.

## When editing code
- Keep backend fixes simple and focused on HTTP handlers and JDBC logic.
- For frontend changes, prefer updating `src/pages`, `src/components`, or `src/services/api.js` without introducing unnecessary complexity.
- Avoid adding new frameworks unless the user explicitly requests an architecture change.

## Suggested follow-up
If more advanced automation is needed, consider adding a dedicated `.github/copilot-instructions.md` or a custom skill for:
- frontend code patterns and React/Vite conventions
- backend route/handler expectations and database connection behavior
- monorepo workflows that involve both `backend/` and `frontend/`
