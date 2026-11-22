# AGENTS.md — SportsCourt Workspace Rules

Dokumen ini menjadi panduan wajib saat bekerja di repository `ProjectUAS` (SportsCourt).

## Referensi Utama
- [prd.md](./docs/prd.md) — Product Requirements & Master Prompt
- [docs/DECISIONS.md](./docs/DECISIONS.md) — Keputusan produk dan teknis (D-01–D-08, P-01–P-15)
- [docs/ERD.md](./docs/ERD.md) — Desain skema database & state machine
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Arsitektur backend/frontend, Sanctum SPA, locking concurrency
- [docs/API.md](./docs/API.md) — Spesifikasi endpoint `/api/v1`
- [docs/ROADMAP.md](./docs/ROADMAP.md) — Tahapan implementasi per phase

## Aturan Stack & Arsitektur
- **Monorepo:** `frontend/` (React + TypeScript + Vite + Tailwind CSS v4 + TanStack Query + React Router + Axios) dan `backend/` (Laravel 13 REST API `/api/v1` + MariaDB InnoDB).
- **Host konsisten:** gunakan `localhost:5173` (frontend) dan `localhost:8000` (backend) — jangan mencampur `localhost` dan `127.0.0.1` karena mempengaruhi Sanctum SPA cookie.
- **Database testing:** PHPUnit berjalan terhadap MariaDB `sportscourt_test` (bukan SQLite in-memory) agar behavior `SELECT ... FOR UPDATE` dan constraint InnoDB teruji nyata.
- **Extension note (PHP 8.5 Herd Lite):** `gd` dan `intl` tidak aktif secara default; gunakan fungsi native PHP (`getimagesize` / Laravel `dimensions`) dan hindari package yang mewajibkan `ext-gd` tanpa verifikasi.

## Security & Data Integrity Baseline
- Autentikasi menggunakan **Laravel Sanctum SPA cookie/session flow** (bukan token di `localStorage`).
- **Backend adalah security boundary:** validasi lewat Form Request, otorisasi lewat Policy/middleware `role:*`, dan ownership check (cegah IDOR/BOLA).
- Identitas actor (`user_id`, `owner_id`, `role`), `price_per_hour`, `total_price`, dan `status` tidak pernah dipercaya dari payload client.
- Pembuatan booking & blokir jadwal wajib mengunci baris `courts` (`SELECT ... FOR UPDATE`) di awal DB transaction dan menggunakan interval `[start_at, end_at)` dalam UTC.
- Jangan menulis kode di luar scope phase yang sedang dikerjakan dan jangan menambahkan dependency yang tidak perlu.

## Verifikasi Wajib Sebelum Selesai Task
Jalankan dan laporkan hasil sebenarnya:
- Frontend: `npm run typecheck`, `npm run lint`, `npm run build`
- Backend: `php artisan test` (dan `php artisan route:list` / `migrate` bila relevan)
