# SportsCourt

Aplikasi web untuk mencari lapangan olahraga dan mengajukan booking. Satu situs bisa memuat banyak venue. Pemilik venue menyetujui atau menolak pengajuan. Admin memeriksa venue baru.

Dokumen lain: `docs/DEPLOY.md` untuk server sungguhan, `docs/SECURITY.md` untuk hasil audit, `docs/ROADMAP.md` untuk tahap pengerjaan.

## Yang perlu terpasang

- PHP 8.3 atau lebih baru, plus Composer. Laravel menolak PHP yang lebih lama saat `composer install`.
- Node.js 20 atau lebih baru, plus npm.
- XAMPP dengan MariaDB yang menyala. Apache XAMPP tidak wajib, karena situs lokal memakai dua perintah di bawah.

Cek cepat di terminal:

```text
php -v
composer -V
node -v
npm -v
```

## Dari folder kosong sampai situs terbuka

### 1. Ambil kodenya

Clone repositori ini, lalu masuk ke foldernya.

### 2. Nyalakan database

Buka XAMPP Control Panel dan start MySQL. Biarkan MySQL menyala selama kalian mencoba situs.

Buka phpMyAdmin (`http://localhost/phpmyadmin`). Buat dua database, keduanya collation `utf8mb4_unicode_ci`:

- `sportscourt` untuk dipakai sehari-hari
- `sportscourt_test` untuk tes otomatis

Kalau lebih nyaman lewat tab SQL:

```sql
CREATE DATABASE IF NOT EXISTS sportscourt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS sportscourt_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Siapkan backend

Di terminal, dari folder proyek:

```text
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan storage:link
```

Di macOS atau Linux, ganti `copy` dengan `cp .env.example .env`.

File `.env` yang baru memakai `localhost` untuk cookie login. Jangan menggantinya menjadi `127.0.0.1`. Campuran dua alamat itu membuat login gagal dengan error 419 atau 401.

Password database di contoh ini kosong karena XAMPP lokal sering memang begitu. Jangan memakai pengaturan itu di server sungguhan.

### 4. Isi database

Pilih salah satu cara.

**Cara A, impor file tugas (paling cepat).** Di phpMyAdmin, klik database `sportscourt`, buka tab Import, pilih `backend/database/export/sportscourt.sql`, lalu jalankan. File ini sudah berisi tabel dan data demo. Password di dalam file sudah diacak, bukan teks yang diketik.

**Cara B, buat dari awal.**

```text
cd backend
php artisan migrate
php artisan db:seed
php artisan storage:link
```

Kedua cara menghasilkan data yang sama. Jangan menjalankan `php artisan migrate:fresh` setelah ada booking yang ingin disimpan. Perintah itu menghapus semua tabel.

File SQL dibuat di MariaDB 10.11.14 dengan `php artisan migrate:fresh --seed` pada database kosong, lalu `mysqldump`. Langkah lengkap dan cara impor ada di `docs/DEPLOY.md`.

Jalankan API dari folder `backend` dan biarkan terminalnya terbuka.

```sh
php artisan serve --host=localhost --port=8000
```

### 5. Siapkan halaman

Terminal kedua, dari folder proyek:

```text
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Di macOS atau Linux, ganti `copy` dengan `cp .env.example .env.local`.

### 6. Buka situs

Buka `http://localhost:5173`. API ada di `http://localhost:8000`. Keduanya harus tetap `localhost`, bukan `127.0.0.1`.

Biarkan kedua terminal tetap berjalan. Kalau terminal backend ditutup, halaman tidak bisa menyimpan data.

Agar booking yang melewati batas waktu berubah status sendiri, buka terminal ketiga:

```text
cd backend
php artisan schedule:work
```

Tanpa itu, status tidak berubah otomatis. Lapangan yang batas waktunya sudah lewat tetap tidak bisa dipesan dua kali.

## Akun demo

Password keempat akun ini sama: `Rahasia12`.

| Email | Dipakai untuk |
| --- | --- |
| andi@demo.test | Pelanggan, sudah punya booking |
| bima@demo.test | Pelanggan kedua |
| sari@demo.test | Pemilik GOR Demo Sehat dan GOR Demo Baru |
| raka@demo.test | Pemilik venue yang ditolak dan yang ditangguhkan |

Tidak ada admin di data demo. Admin tidak bisa mendaftar dari halaman. Buat dari terminal backend:

```text
cd backend
php artisan app:create-admin
```

Perintah ini meminta nama, email, dan konfirmasi password. Password admin minimal 12 karakter dan mengandung huruf besar, huruf kecil, angka, serta simbol. Password dimasukkan lewat prompt tersembunyi.

## Cek bahwa semuanya sehat

```text
cd backend
php artisan test

cd frontend
npm run typecheck
npm run lint
npm run build
```

`php artisan test` memakai database `sportscourt_test`, bukan data demo.

## Server sungguhan

Jangan menyalin `.env` lokal ke server. Contoh yang memakai HTTPS, `APP_DEBUG=false`, cookie aman, dan domain Sanctum ada di:

- `backend/.env.production.example`
- `frontend/.env.production.example`
- `docs/DEPLOY.md` (langkah naik server, cadangan database, dan cara kembali jika rilis rusak)

## Yang tidak boleh masuk Git

Jangan commit `.env`, `.env.local`, atau `.env.production`. File itu berisi kunci aplikasi dan password database. Yang boleh di-commit hanya file contoh yang berakhiran `.example`.
