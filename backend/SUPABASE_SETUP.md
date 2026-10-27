# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**, fill in name and database password
3. Wait for the project to be ready (~2 minutes)

## 2. Get Your Credentials

In the Supabase Dashboard, go to **Project Settings → API**:

| Variable | Where to find it |
|----------|-----------------|
| `SUPABASE_URL` | "Project URL" field |
| `SUPABASE_SERVICE_ROLE_KEY` | "service_role" key (keep secret!) |

For `DATABASE_URL`, go to **Project Settings → Database → Connection string → URI** and select the **Transaction pooler** (port 6543).

## 3. Create the Storage Bucket

1. In the Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Name it: `phd-portal`
4. Set it to **Private** (access only via service role key)
5. Click **Create bucket**

## 4. Configure your `.env`

```bash
cp .env.example .env
# Fill in your credentials
```

## 5. Run Database Migrations

```bash
cd backend
npx prisma migrate deploy
# Optional: seed admin user
npm run seed
```

## 6. Start the backend

```bash
npm run start:dev
```
