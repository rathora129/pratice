# Stark Packmate — Enterprise Business Operating System

Phase 1 (discovery and architecture) deliverables plus **runnable Phase 2 and Phase 3 vertical slices** for the platform described in the PRD: public website, CMS, product master, identity/RBAC, CRM and customer master. Later phases cover quotation/costing, orders, manufacturing, inventory, procurement, quality, dispatch, finance, customer portal, MIS, BI and a read-only AI management assistant.

**Current status:** Phase 1 documentation complete. The repository contains a working Next.js + Prisma + SQLite preview with the public site, product master, homepage CMS, database-backed multi-user sign-in, server-enforced RBAC, the CRM pipeline, customer master and an audit trail. Phases 4–8 are specified but not built.

---

## Run it locally

Requirements: Node.js 20+ (tested on 24) and a PostgreSQL connection configured as `DATABASE_URL`.

```bash
npm install          # install dependencies
npm run setup        # initialize the local database and seed demo data
npm run dev          # start at http://localhost:3000
```

Admin workspace: <http://localhost:3000/admin>. Sign in with one of the seeded demo accounts below; they share the password `Packmate@2026` (override with `DEMO_PASSWORD` before seeding).

| Email | Role | Access |
|---|---|---|
| `owner@starkpackmate.com` | Business Owner | Full access, including users and audit |
| `website@starkpackmate.com` | Website Manager | Products, publishing, website content, audit |
| `salesmanager@starkpackmate.com` | Sales Manager | CRM with assignment, customers, audit |
| `sales@starkpackmate.com` | Sales Executive | Products (read), assigned CRM work, customers |
| `accounts@starkpackmate.com` | Accounts Manager | Leads and customers (read/export), audit |
| `production@starkpackmate.com` | Production Manager | Product specs (read), audit |
| `admin@starkpackmate.com` | Super Admin | Full platform access |

Re-run `npm run db:seed` after changing `DEMO_PASSWORD`; existing accounts keep their original hash.

Other commands:

| Command | Purpose |
|---|---|
| `npm run typecheck` | TypeScript strict check |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run db:studio` | Browse the database configured by `DATABASE_URL` |
| `npm run db:migrate:deploy` | Apply committed migrations to the configured database |
| `npm run db:seed` | Seed reference/demo data (development only) |

Set these variables in `.env` for local development:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
DEMO_PASSWORD="Packmate@2026"
ADMIN_SESSION_SECRET="dev-only-change-this-secret-before-production"
```

Change the demo password and session secret before exposing the app. Passwords are stored as scrypt hashes; sessions are HMAC-signed, httpOnly cookies with an 8-hour lifetime.

### PostgreSQL deployments and migrations

The Prisma schema uses PostgreSQL. Prisma CLI and Client are both locked to 6.19.3; this version reads `DATABASE_URL` from the process environment or `.env` and does not require `prisma.config.ts`. The production build generates the Prisma Client before running Next.js.

The initial PostgreSQL migration is in `prisma/migrations`. After confirming the target database state and backing it up, apply pending migrations with:

```bash
npm run db:migrate:deploy
```

Run this explicitly against the existing production connection only after checking its tables and migration history. The initial migration creates the schema from the Prisma models and is intended for an empty database; do not run it blindly if the target already contains application tables or records. If it is partially populated, inspect and compare its schema first, then prepare a reviewed additive migration or baseline plan. Do not use `db push`, `migrate reset`, or the local seed command against production.

The tracked `prisma/dev.db` is a separate SQLite database and contains existing data. It is not used by the PostgreSQL Prisma schema. Keep it intact; if its data is needed in PostgreSQL, export and transfer it with IDs and relations preserved only after checking the target for duplicates and taking a backup. No transfer or production database changes are run automatically by the build.

### What the preview covers

- **Public site** — home, catalogue with category filters and search, product pages with variant specs, quote/sample/contact forms, about, industries, quality.
- **Product master** — create/edit products and variants, publish gating (a product cannot be published without an active variant), archive, SEO fields, featured selection. Published changes revalidate the public paths immediately.
- **Identity & RBAC** — 15 roles, 9 actions and 7 modules, with every page, server action and export checked against the matrix on the server. Read-only roles see a read-only product/customer record; menu hiding is cosmetic only.
- **CRM** — website submissions create leads with a reference number; stage and owner updates (assignment restricted to managers and owners), activity timeline (note/call/email/meeting/WhatsApp), lost-reason capture, and conversion to the customer master with duplicate-company linking.
- **Customer master** — billing/shipping/GST/payment-terms/credit-limit fields, account owner, duplicate company+phone guard on create, CSV export.
- **Website content** — hero, proof points, about block and contact details saved to the database and reflected on the public site.
- **Audit trail** — sign-in/out, product and variant changes, content publishing, lead updates, customer create/update/link, user role/status changes and CSV exports are recorded with actor, role, entity and summary.

### Known limits of this slice

- Authentication is database-backed and permissions are enforced server-side, but **MFA, SSO, rate limiting, password reset and session revocation are not built**. Do not expose this build to the public internet.
- The audit log is append-only from the application; database-level immutability and retention policies are not implemented.
- Quotation/costing, orders, manufacturing, inventory, procurement, QC, dispatch, finance, MIS, BI and the AI assistant are **not implemented** — only specified in `docs/`.
- Role permissions in this build cover the modules that exist. Production, inventory, procurement, quality and finance permissions are drafted in the Phase 1 RBAC document and will arrive with those modules.
- SQLite is a local-development stand-in for PostgreSQL.
- Business-owned inputs (D1–D8 workshop answers, taxonomy sign-off, costing rates, legal/GST details) are still open; nothing in the code guesses them.
- No production rates, MOQs or prices are hardcoded; unspecified values render as "On request" or "Confirmed at costing".

---

## Deliverables

| # | Document | Contents |
|---|---|---|
| 01 | [Discovery & gap analysis](docs/01-discovery-and-gap-analysis.md) | Verified public-estate findings, 14-point gap register, hypotheses, workshop plan |
| 02 | [Sitemap](docs/02-sitemap.md) | Public, admin and portal route maps; conversion paths; legacy redirects |
| 03 | [Process maps](docs/03-process-maps.md) | Lead-to-cash, costing, orders, production, procurement, QC, dispatch, finance, CMS, MIS |
| 04 | [ERD & data dictionary](docs/04-erd.md) | Normalized domain model, invariants, retention policy |
| 05 | [RBAC matrix](docs/05-rbac-matrix.md) | 15 roles, 9 actions, scopes, segregation of duties, approval thresholds |
| 06 | [MIS metric dictionary](docs/06-mis-metric-dictionary.md) | ~75 metric definitions, money-measure separation, reconciliation checks |
| 07 | [Implementation backlog](docs/07-implementation-backlog.md) | Phases 1–8, epics, stories, tests, traceability to 17 acceptance criteria |
| 08 | [Architecture](docs/08-architecture.md) | ADRs, module boundaries, repo blueprint, security and NFR targets |

---

## Verified starting point

Public evidence collected on 16 November 2026 from `starkpackmate.com` and `starkpackmate.co.in`:

- Digital-first packaging positioning (labels, pouches, shrink sleeves) with a self-claimed 10+ years and 1200+ projects.
- WordPress marketing site with no product catalogue, quote flow or sample flow.
- IndiaMART storefront carrying ~30+ listings with duplicates, mixed ₹/Kg and ₹/Piece units, missing dimensions and MOQ, and legacy PPE/mask packaging.
- Conflicting public addresses (Mayapuri vs Kirti Nagar) and phone numbers (direct vs IndiaMART virtual).
- Multiple analytics stacks including deprecated Universal Analytics and two GTM containers.
- No public evidence of CRM, costing, ERP, inventory, QC, finance integration or MIS.

Internal facts (machines, capacity, rates, margins, conversion, accounting practice) are explicitly marked as hypotheses until the D1–D8 workshops are completed.

---

## Build constraints

1. A product created once must serve website, quotation, orders, production, inventory and MIS.
2. No production rate, threshold or routing may be hardcoded.
3. Published CMS content must be verifiably live, with rollback.
4. QC pass is a hard precondition for dispatch.
5. Booking, dispatch value, invoiced revenue, collection, gross profit and net profit are distinct measures and must never be mixed.
6. Every sensitive action is audited; permissions are enforced server-side.
7. MIS is derived from transactions and blocks distribution when reconciliation fails.
8. The AI assistant is read-only, scoped and must cite data.

---

## Phase 1 exit items (business-owned)

- [ ] Run workshops D1–D8 and confirm hypotheses.
- [ ] Approve canonical product taxonomy and required attribute schema.
- [ ] Supply costing inputs, rate cards, wastage norms and margin policy.
- [ ] Confirm legal entity, GSTINs, invoice series and dispatch document requirements.
- [ ] Confirm manufacturing vs trading status per category.
- [ ] Assign named users to the 15 roles.
- [ ] Freeze the Phase 2 backlog.

---

## Phase 2 vertical slice

Delivered in this repo to prove the architecture end-to-end (in-process Next.js instead of the NestJS/PostgreSQL target):

1. Product master in the database — 9 categories, 10 products, 15 variants, full CRUD in admin.
2. Public category and product pages rendered from the database — catalogue, filters, search, variant-specific specs.
3. CMS content published from admin and revalidated on the public site — hero, proof points, about and contact blocks.
4. Quote/sample/contact forms creating leads with source attribution and `LEAD-YYYYMMDD-XXXX` references.
5. Product edits reflected on the public site, verified in a browser, including draft products returning 404.

Still to build for full Phase 2: media library, revisions, scheduling, import/export, approval workflow, compare and bulk SEO.

---

## Phase 3 vertical slice

Delivered in this repo:

1. **Database-backed identity** — users table, scrypt password hashes, HMAC-signed httpOnly session cookies, eight-hour sessions, inactive accounts rejected on every request.
2. **Server-enforced RBAC** — 15 roles × 9 actions × the modules that exist. Pages call `requirePermission`; every server action re-checks `can()` before writing; CSV exports return 401/403 without the right role.
3. **Role-aware workspace** — navigation, dashboard cards, quick actions and edit affordances are filtered per role; direct URLs to forbidden modules redirect to the dashboard with a denied banner.
4. **CRM pipeline** — lead list with search and stage filters, lead detail with stage/owner controls, lost-reason requirement, activity timeline, and conversion into the customer master. Managers and owners can reassign; executives cannot.
5. **Customer master** — create/edit/list/detail with billing, shipping, GSTIN, payment terms and credit limit, duplicate guard and owner assignment.
6. **Users & roles** — add team members, change roles, activate/deactivate accounts, and view the live role-permission matrix. You cannot change your own role or status.
7. **Audit trail** — append-only log with actor, role, action, entity, metadata and timestamp; filterable in the admin workspace.
8. **Verified in a browser** — owner sign-in, lead activity, stage/owner change, conversion, customer update, audit entries, CSV export, Website Manager menu boundary and denied redirect.

Still to build for full Phase 3: MFA, SSO, password reset, rate limiting, session listing/revocation, email delivery, portal logins, and CRM-side quotation hand-off (Phase 4).

---

## Stack (per PRD)

Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Table, React Hook Form, Zod; NestJS REST/OpenAPI; PostgreSQL with Prisma; Redis and background workers; S3-compatible object storage; Docker and CI/CD.

Architecture: modular monolith with enforced domain boundaries. See [ADR log](docs/08-architecture.md).
