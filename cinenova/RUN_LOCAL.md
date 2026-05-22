# Run CineNova on your machine

You only need **Docker Desktop** installed. That's it. No Node, no Postgres, no env wrangling.

## One command

```bash
git clone https://github.com/Toyandra12/toya.git
cd toya
git checkout feat/cinenova-platform
cd cinenova
docker compose up
```

Wait ~2 minutes the first time (it's installing dependencies and running migrations inside the container). When you see `Ready in ...ms`, open:

**http://localhost:3000**

Admin login (also seeded):

- Email: `admin@cinenova.local`
- Password: `ChangeMe123!`

Admin dashboard: <http://localhost:3000/admin>

## Stopping and starting

- Stop: `Ctrl+C` in the terminal running compose, then `docker compose down`
- Start again: `docker compose up`
- Wipe everything (DB included) and start fresh: `docker compose down -v && docker compose up`

## What's running

| Service | Port |
|---|---|
| Next.js dev server | http://localhost:3000 |
| Postgres 16 | localhost:5433 (`cinenova` / `cinenova` / db `cinenova`) |

The Postgres port is `5433` (not 5432) so it won't clash with any Postgres you already have.

## Without Docker

If you'd rather run everything natively (Node 20+ and Postgres 14+ already installed):

```bash
cp .env.example .env
# edit .env: DATABASE_URL + JWT_SECRET (>=16 chars)
createdb cinenova
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

## Common issues

**"Port 3000 already in use"** → stop whatever is using it (`lsof -i :3000` on mac/linux, `netstat -ano | findstr :3000` on Windows) or change the host port in `docker-compose.yml` (e.g. `"3001:3000"`).

**"Cannot connect to Docker daemon"** → Docker Desktop isn't running.

**Slow first start** → normal; `npm install` runs inside the container and `node_modules` is cached in a Docker volume so subsequent starts are fast.

**Want to reset DB only** → `docker compose down -v` then `docker compose up`.
