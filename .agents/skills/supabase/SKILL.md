---
name: supabase
description: Use this skill for Supabase, PostgreSQL, JDBC database, schema, RLS, Auth, and backend authorization work in AMS_project. Trigger it when an agent is asked to inspect or change Supabase-backed data access, tables, migrations, SQL, database security, user roles, asset assignments, or the backend database connection for this repo.
---

# Supabase Skill For AMS_project

## Scope

Use this skill only when working in the `AMS_project` repository.

This project uses a Java backend with JDBC to connect to a Supabase-hosted PostgreSQL database. The frontend should not be treated as the authority for authorization decisions.

Primary local files to inspect first:

- `backend/src/main/java/util/DatabaseConnection.java`
- `backend/src/main/java/controller/LoginHandler.java`
- `DB/AMS_table_creation.sql`
- `DB/AlterTable.sql`
- `DB/AMSBackup`

## Current Project Facts

- Supabase project ref: `ygjupwcersfyfunshulu`
- Supabase pooler host: `aws-1-ap-northeast-1.pooler.supabase.com`
- Database name: `postgres`
- Pooler username: `postgres.ygjupwcersfyfunshulu`
- Database password source: `backend/.env` key `SUPABASE_DB_PASSWORD`
- JDBC URL uses `sslmode=require`
- Main role source: `public.users.role`
- Known roles in the local schema: `admin`, `it_manager`, `employee`
- Important table: `public.asset_assignments`

Treat row counts, RLS status, policies, and live schema details as time-sensitive. Re-check the live Supabase project before relying on them for implementation or debugging.

## Authorization Rules

Preserve this rule unless the user explicitly changes it:

Only users with `public.users.role = 'admin'` may add users or assign assets through `public.asset_assignments`.

Implementation expectations:

- Enforce this in the backend, not only in the frontend.
- Never trust client-provided role values for authorization.
- Derive the acting user's role from the database or a backend-verified session/auth context.
- Use parameterized SQL for all user-controlled values.
- Do not expose the Supabase service role key, database password, or other secrets in frontend code.

## Supabase Workflow

When a task involves Supabase:

1. Inspect the local code path first to understand how the app currently reaches the database.
2. Verify live database facts with the available Supabase connector, MCP server, CLI, or direct SQL access before changing schema or data.
3. For schema or security work, check RLS, policies, grants, views, functions, triggers, and exposed schemas.
4. For bugs, separate browser/network/API reachability issues from JDBC/database failures before changing SQL.
5. After any database or backend data-access change, verify with a real query, API request, test, or build command.

## Security Checklist

Before approving or making Supabase-related changes:

- Confirm whether the affected table is in an exposed schema such as `public`.
- Enable and validate RLS where the table is reachable from Supabase APIs.
- Check that `anon` and `authenticated` grants match the intended access model.
- Avoid `security definer` functions in exposed schemas.
- Ensure views that should respect RLS use `security_invoker = true` where supported.
- Do not use user-editable metadata or frontend state for authorization.
- Keep secrets in backend-only environment files or deployment secret stores.

## Agent Notes

This repo-local skill is meant for any agent working in this checkout, including Codex, Gemini, opencode, or other CLI agents. If the agent does not auto-load local skills, explicitly read this file before doing Supabase work.

Do not assume this file is a replacement for the official Supabase documentation. Supabase changes frequently, so verify current CLI commands, MCP behavior, and product behavior against current docs when the task depends on exact Supabase behavior.
