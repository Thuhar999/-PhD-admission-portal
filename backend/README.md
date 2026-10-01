# Ph.D. Admission API

NestJS + PostgreSQL backend for the Sahyadri Ph.D. admission portal. It replaces the frontend's browser-only draft model with authenticated, persistent applications.

## What is persisted

| Area | Stored data |
| --- | --- |
| Accounts | Email, bcrypt password hash, role (`APPLICANT`, `REVIEWER`, `ADMIN`) |
| Application | Programme, server-generated application number, draft/review workflow state, timestamps, current form step |
| Form data | Scholar, supervisor and co-supervisor details, qualifications, fee payments, declaration |
| Files | Photo, signature, and document metadata in PostgreSQL; the actual files in the configured private upload directory |
| Audit trail | Every creation, submission, and staff status decision with actor, note, and timestamp |

Documents are deliberately **not** saved as base64 strings in the database. The file bytes live in `UPLOAD_DIR`, and every download endpoint checks the JWT owner/staff permission before streaming the file.

## Run locally

1. Create a PostgreSQL database named `phd_portal` (or start the included Docker service).
2. Copy the environment template and replace the values:

   ```bash
   cd backend
   cp .env.example .env
   ```

3. Install and initialise the database:

   ```bash
   npm install
   npm run prisma:generate
   npm run prisma:deploy
   npm run seed
   ```

4. Start the API:

   ```bash
   npm run start:dev
   ```

The API is available at `http://localhost:3000/api`; interactive Swagger documentation is at `http://localhost:3000/api/docs`.

The repository already contains the initial migration. During schema development, use `npm run prisma:migrate -- --name <change-name>` to create subsequent migrations; use `npm run prisma:deploy` in staging and production.

To start PostgreSQL only with Docker:

```bash
docker compose up -d postgres
```

Use the matching `DATABASE_URL` from `.env.example`.

## Main API flow

1. `POST /api/auth/register` or `POST /api/auth/login` returns an `accessToken`.
2. Send it on every later request as `Authorization: Bearer <accessToken>`.
3. `POST /api/applications` with `{ "selectedProgramme": "CSE" }` creates a draft and the four configured document slots.
4. `PATCH /api/applications/:id` saves form sections and the current step.
5. Upload multipart files with the `file` field:
   - `POST /api/applications/:id/photo`
   - `POST /api/applications/:id/signature` (also send `type=DRAWN` or `type=UPLOADED`)
   - `POST /api/applications/:id/documents/:documentId/file`
6. `POST /api/applications/:id/submit` validates mandatory details/files, locks the draft, and allocates the official application number.
7. A reviewer or admin can list applications with `GET /api/applications/review` and update review state using `PATCH /api/applications/:id/status`.

The connected Vite frontend uses `VITE_API_URL` (default: `http://localhost:3000/api`). Copy the root `.env.example` to `.env.local` if the API is hosted elsewhere.

## Frontend mapping

The `PATCH` payload intentionally uses the existing React field names. For example, `fatherGuardianSpouseName`, `coSupervisor.hasCoSupervisor`, `qualifications`, `feePayments`, and `declaration` are accepted as they are currently modelled in [`src/types/application.ts`](../src/types/application.ts).

The response also follows that shape where appropriate, with these changes:

- `photographUrl`, `signature.url`, and `documents[].downloadUrl` are protected API URLs, not base64 data URLs. Fetch them with the bearer token and create an object URL for `<img>`/download use.
- `status` is lowercase for the current UI (`draft`, `submitted`, etc.), while `workflowStatus` exposes the uppercase database enum for staff screens.
- The backend uses database UUIDs for qualifications, payments, and documents; the frontend should retain those identifiers when it saves again.

## Staff accounts

`npm run seed` creates/updates an `ADMIN` account using `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`. Change both values before using anything outside local development. Granting a reviewer role is intentionally a database/admin operation; public registration can only create applicant accounts.

## Production notes

- Set a strong `JWT_SECRET`, use managed PostgreSQL, and store `UPLOAD_DIR` in durable private object storage or a mounted volume.
- Put the API behind HTTPS and set `FRONTEND_ORIGIN` to the actual frontend domain.
- Add email verification/password reset and malware scanning before handling real applicant documents.
- Keep the `ApplicationStatusLog` immutable; it is the basis for reviewer accountability and candidate support.
