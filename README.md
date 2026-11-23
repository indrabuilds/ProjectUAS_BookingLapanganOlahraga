# SportsCourt

Marketplace pemesanan lapangan olahraga multi-venue berbasis web (MVP v1.0).

## Struktur Monorepo

```text
ProjectUAS/
├── frontend/   # React 19 + TypeScript + Vite 8 + Tailwind CSS v4
├── backend/    # Laravel 13 REST API (/api/v1) + MariaDB (InnoDB)
├── docs/       # DECISIONS, ERD, ARCHITECTURE, API, ROADMAP
├── prd.md      # Product Requirements Document & Master Prompt
└── AGENTS.md   # Aturan engineering & verifikasi workspace
```

## Runtime Lokal Terverifikasi

- **PHP:** 8.5.0 (Herd Lite) — ekstensi aktif termasuk `pdo_mysql`, `fileinfo`, `mbstring`, `openssl`, `bcmath`
- **Backend:** Laravel Framework 13.43.0
- **Composer:** 2.8.12
- **Node.js / npm:** v22.20.0 / 11.6.2
- **Frontend:** React 19.3.1, TypeScript ~7.0.2, Vite 8.3.6, Tailwind CSS 4.3.5
- **Database:** XAMPP MariaDB 10.4.32 (engine `InnoDB`, charset `utf8mb4_unicode_ci`)

## Setup & Menjalankan Lokal

### 1. Database (XAMPP MariaDB)
Pastikan service MariaDB/MySQL XAMPP berjalan di `127.0.0.1:3306`, lalu buat database `sportscourt` dan `sportscourt_test`:
```sql
CREATE DATABASE IF NOT EXISTS sportscourt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS sportscourt_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend (`backend/`)
```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=localhost --port=8000
```
API tersedia di `http://localhost:8000/api/v1` (cek kesehatan: `GET /api/v1/health`).

### 3. Frontend (`frontend/`)
```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```
Aplikasi tersedia di `http://localhost:5173` (wajib memakai `localhost`, jangan dicampur dengan `127.0.0.1`).

## Testing & Verifikasi

```powershell
# Backend (menggunakan database sportscourt_test pada MariaDB InnoDB)
cd backend
php artisan test

# Frontend
cd frontend
npm run typecheck
npm run lint
npm run build
```

## Catatan Keamanan

- **Jangan pernah commit file `.env` atau `.env.local`** ke repository.
- Konfigurasi `root` tanpa password pada `.env.example` **hanya untuk development lokal XAMPP**. Untuk production, wajib gunakan user database terpisah dengan password kuat, `APP_DEBUG=false`, HTTPS, dan secure session cookie.
