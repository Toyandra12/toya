# CineNova

Production-shaped Next.js platform for game top-ups, SMM marketplace, subscriptions and digital goods. Dark-mode-only. JWT auth. Postgres + Prisma. Built per the v3 master prompt.

> Lives at `cinenova/` inside the existing `toya` repo. The Laravel `toya` app is untouched.

## What works out of the box

- **Auth** — register, login, logout, JWT in HTTP-only cookie, edge middleware enforcing role on `/admin`.
- **Storefront** — home, `/games` listing, `/games/[id]` with UID validation flow, `/smm` listing, `/smm/[id]` order form, `/orders`, `/account`.
- **Admin dashboard** — `/admin` overview with revenue/profit area chart and monthly P/L line chart; `/admin/orders`, `/admin/customers`, `/admin/smm/providers`, `/admin/smm/services`, `/admin/smm/logs`.
- **SMM engine** — provider CRUD, service import (default 35% margin), order forwarding (using the standard SMM panel API contract: `services`, `add`, `status`, `balance`, `refill`), status sync, retry, full API logging.
- **UID validation** — Free Fire, PUBG, Mobile Legends (UID + Zone ID), Valorant. Per-game regex; vendor nickname lookup is a stub you can wire to a real API.
- **Profit/loss tracking** — every paid order writes a `RevenueLog` (cost + sell + profit). Refunds invert the log automatically.
- **Customer management** — search, block/unblock, wallet adjustment, per-user spend.
- **Activity log** — every admin action persisted to `ActivityLog`.

## What is intentionally stubbed

| Feature | Status | Where to extend |
| --- | --- | --- |
| Payment gateways (eSewa / Khalti / Stripe / QR upload) | Wallet-only flow today | `Payment` model + `PaymentMethod` enum already exist; add `/api/payments/...` routes |
| Vendor UID nickname lookup | Returns `null` | `lib/uid-validator.ts → validateUid()` |
| Subscription / digital products | Models in place, no UI | Add `/admin/products` CRUD, `/(site)/subscriptions` |
| Email notifications | Not wired | Add `lib/mailer.ts` (Resend/SES) and call from order routes |
| Cron-driven SMM status sync | One-shot endpoint exists | Schedule `POST /api/admin/smm/sync-order` per-order, or add a sweeper |
| Cloudinary upload | Env vars only | Add `/api/uploads` for product images / QR proof |

## Run locally

```bash
cd cinenova
cp .env.example .env
# edit .env: set DATABASE_URL and a strong JWT_SECRET (>= 16 chars)

npm install
npx prisma migrate dev --name init
npx prisma db seed

npm run dev
```

Default seeded admin (override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`):

```
admin@cinenova.local / ChangeMe123!
```

## Repository layout

```
cinenova/
├── prisma/
│   ├── schema.prisma          # full data model
│   └── seed.ts                # superadmin + categories + sample products
├── src/
│   ├── app/
│   │   ├── (site)/            # public storefront (home, /games, /smm, /account, /orders)
│   │   ├── admin/             # admin dashboard (overview, orders, customers, smm/*)
│   │   └── api/
│   │       ├── auth/          # login, register, logout, me
│   │       ├── products/      # public product list
│   │       ├── orders/        # current user's orders
│   │       ├── game/          # validate-uid, create-order
│   │       ├── smm/           # public order placement
│   │       └── admin/
│   │           ├── revenue/   # totals + 30d series
│   │           ├── profit-loss/
│   │           ├── customers/[id]/
│   │           ├── orders/[id]/
│   │           ├── block-user/, wallet-adjust/
│   │           └── smm/
│   │               ├── providers/, providers/[id]/, providers/[id]/test/
│   │               ├── services/, services/[id]/
│   │               ├── import-services/, sync-order/, retry-order/, logs/
│   ├── components/            # admin shell, charts, storefront forms
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts            # jose JWT + cookie helpers
│   │   ├── rbac.ts            # requireUser / requireAdmin
│   │   ├── uid-validator.ts   # per-game regex
│   │   ├── smm-client.ts      # standard SMM panel API contract
│   │   ├── smm-engine.ts      # import/forward/sync/retry orchestration
│   │   └── utils.ts           # cn, money, fmtNumber, genOrderNo
│   └── middleware.ts          # edge auth + role gate
├── tailwind.config.ts         # dark-mode-only design tokens
└── package.json
```

## Standard SMM panel API contract

`smm-client.ts` speaks the de-facto SMM panel contract used by Peakerr, JustAnotherPanel, SMMKings, and many clones. POST `application/x-www-form-urlencoded` to your provider's endpoint:

| action | parameters | use |
| --- | --- | --- |
| `services` | — | import full service catalog |
| `add` | `service`, `link`, `quantity` | place an order |
| `status` | `order` | sync vendor order status |
| `balance` | — | test connection / read balance |
| `refill` | `order` | refill (where supported) |

If your provider uses a different shape, swap implementations in `lib/smm-client.ts`; the engine in `lib/smm-engine.ts` is contract-agnostic via the client.

## Next steps recommended

1. Wire eSewa + Khalti payment routes (`POST /api/payments/init`, `/verify`).
2. Add a cron (or a `pg_cron` job, or a Vercel scheduled function) to periodically call `POST /api/admin/smm/sync-order` for in-progress orders.
3. Plug in real UID lookup APIs (e.g. game-specific username resolvers) inside `validateUid`.
4. Add product image uploads via Cloudinary signed-URL flow.
5. Add Subscription & Digital catalog UI (`/admin/products`, `/subscriptions`).
6. Email notifications on order events.

## License

Internal project.
