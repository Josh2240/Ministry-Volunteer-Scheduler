This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account (https://supabase.com)

### Database Setup (Supabase + Prisma)

1. Create a new project on [Supabase](https://supabase.com/dashboard/projects).

2. In your Supabase project, go to **Settings > Database** and copy the **Connection string** (use the "URI" format).

3. Update `.env` with your Supabase database URL:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Install dependencies:

```bash
npm install
```

5. Generate Prisma client and run the seed:

```bash
npx prisma generate
npm run prisma:seed
```

6. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Demo accounts

- System Admin: `admin@church.org` / `admin123`
- User Admin: `member@church.org` / `member123`

## Architecture

- **Frontend**: Next.js 16 App Router (client components)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma 6
- **Auth**: Session-based with HTTP-only cookies
- **API Routes**: `/api/auth/*` for auth, `/api/volunteers` and `/api/users` for data

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Add the `DATABASE_URL` environment variable (your Supabase connection string).
4. Deploy.
