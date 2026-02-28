## School Club Management Web Application

Full-stack Next.js app for managing school clubs with roles for **admin**, **club accounts**, and **students**.

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth (credentials, JWT session)
- **Testing**: Jest (unit) + Playwright (E2E)
- **Infra**: Dockerfile + GitHub Actions CI

---

## Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/school_clubs"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="some-long-random-string"
```

Adjust `DATABASE_URL` to match your PostgreSQL instance.

---

## Database setup & migrations

1. **Ensure PostgreSQL is running** on port `5432` with a database named `school_clubs`.
2. Run Prisma commands:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

---

## Seeding data

This project includes a seed script that creates:

- 1 **admin** account: `admin@example.com` / `password123`
- 3 approved clubs with club presidents (`club1@example.com`, `club2@example.com`, `club3@example.com`, password `password123`)
- 10 students
- Sample posts and one notification

Run:

```bash
npx prisma db seed
```

---

## Running locally

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Visit `http://localhost:3000`.

Useful scripts:

- **Unit tests**: `npm test`
- **E2E tests** (requires dev server): `npm run test:e2e`

---

## Deployment

### Docker

Build and run the app image (requires external PostgreSQL):

```bash
docker build -t school-club-management .
docker run -p 3000:3000 --env-file .env school-club-management
```

Make sure your `DATABASE_URL` points to a reachable PostgreSQL instance from inside the container.

### GitHub Actions CI

The workflow at `.github/workflows/ci.yml`:

- Spins up PostgreSQL
- Runs Prisma migrations and seed
- Runs Jest unit tests
- Runs Playwright E2E tests using the Next.js dev server

---

## Key pages

- `/` – Homepage with featured clubs and CTA
- `/clubs` – Club list with search/filter + pagination
- `/clubs/[slug]` – Club details + recent posts + “Request to join” button (students)
- `/dashboard/admin` – Admin panel (approve/reject clubs, view stats, broadcast notifications)
- `/dashboard/club` – Club management panel (edit profile, manage posts, members, join requests)
- `/profile` – User profile, memberships, notifications, and “Request New Club” form

