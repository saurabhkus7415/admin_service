# MIS Management Backend (Example)

## Overview
Fastify + Sequelize backend implementing MIS upload + approval workflows, with audit trail.

## Quickstart
1. Copy `.env.example` to `.env` and set values.
2. `npm install`
3. Create the database referenced in `.env` (e.g., `mis_db`)
4. `npm run dev` or `npm start`

## Endpoints
- POST /api/auth/login { username, password } -> { token }
- POST /api/upload/students (form-data file) (admin)
- POST /api/upload/teachers (form-data file) (admin)
- GET  /api/approvals/pending (admin)
- POST /api/approvals/:id/approve (admin)
- POST /api/approvals/:id/reject (admin)
- GET  /api/audit-trail (admin)

This project is a starting point — add migrations, tests, and production hardening as needed.


## Additional scripts

- `scripts/init-database.sql` — SQL to create necessary tables.
- `scripts/seed-admin.js` — run to create/update admin user from .env variables: `node scripts/seed-admin.js`.
- `Dockerfile` and `cloudbuild.yaml` provided for Cloud Run deployment.
