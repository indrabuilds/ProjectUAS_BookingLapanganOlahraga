# SportsCourt: siapkan server dan cadangan data

File ini untuk saat situs pindah dari komputer lokal ke server yang punya domain dan HTTPS. Untuk tugas di XAMPP, ikuti README di folder utama. Jangan memakai file contoh production di laptop yang masih memakai http://localhost.

## Yang harus berbeda di server

Salin `backend/.env.production.example` menjadi `backend/.env` di server, lalu isi nilai yang kosong.

- `APP_DEBUG=false`, supaya pengunjung tidak melihat jejak kode saat ada error.
- `APP_KEY` diisi dengan `php artisan key:generate`. Jangan menyalin key dari laptop orang lain.
- `APP_URL` adalah alamat API dengan https, misalnya `https://api.example.com`.
- `FRONTEND_URL` adalah alamat halaman dengan https, misalnya `https://app.example.com`. CORS hanya mengizinkan alamat ini. Tidak ada tanda bintang.
- `SANCTUM_STATEFUL_DOMAINS` adalah host halaman saja, tanpa `https://`. Contoh: `app.example.com`.
- `SESSION_DOMAIN` memakai titik di depan domain induk, misalnya `.example.com`, supaya cookie dari halaman sampai ke API.
- `SESSION_SECURE_COOKIE=true`. Cookie ini hanya terkirim lewat HTTPS.
- `DB_USERNAME` dan `DB_PASSWORD` adalah akun database khusus, bukan root tanpa password.

Frontend production memakai `frontend/.env.production.example` sebagai contoh `VITE_API_URL`. Nilai itu tertanam saat `npm run build`, jadi bangun ulang frontend setelah alamat API berubah.

## Langkah naik ke server

1. Pasang PHP 8.3 atau lebih baru, Composer, Node.js, dan MariaDB.
2. Buat database kosong `sportscourt` dengan charset `utf8mb4_unicode_ci`.
3. Salin kode. Jangan menyalin folder `vendor`, `node_modules`, atau file `.env` dari laptop.
4. Di `backend/`: `composer install --no-dev`, salin env production, `php artisan key:generate`, `php artisan migrate --force`, `php artisan storage:link`.
5. Kalau server ini butuh data demo, impor `backend/database/export/sportscourt.sql` ke database kosong itu, lalu jangan menjalankan `migrate:fresh`.
6. Di `frontend/`: `npm install`, atur `VITE_API_URL`, lalu `npm run build`. Sajikan isi folder `frontend/dist` sebagai situs statis.
7. Tambahkan cron setiap menit: `php /path/ke/backend/artisan schedule:run`. Tanpa ini, booking pending tidak otomatis menjadi kedaluwarsa dan booking selesai tidak otomatis tertutup. Slot yang sudah lewat `expires_at` tetap tidak bisa ditumpuki, karena pengecekan booking melihat jam itu langsung.
8. Buat admin di server dengan `php artisan app:create-admin`. Masukkan password melalui prompt tersembunyi. Password admin minimal 12 karakter dan mengandung huruf besar, huruf kecil, angka, serta simbol.

## Cadangan

Sebelum mengubah kode atau skema, simpan database:

```text
mysqldump -u sportscourt -p --single-transaction --default-character-set=utf8mb4 sportscourt > backup-tanggal.sql
```

Simpan file itu di luar folder kode. File cadangan berisi hash password, bukan password yang diketik.

## Kalau rilis baru bermasalah

1. Kembalikan kode ke commit yang sebelumnya berjalan.
2. Impor file cadangan yang diambil sebelum rilis ke database `sportscourt` yang sudah dikosongkan, lewat phpMyAdmin atau klien mysql.
3. Jangan menjalankan `php artisan migrate:fresh` pada database yang punya booking sungguhan. Perintah itu menghapus semua tabel.
4. `php artisan migrate` hanya menambah tabel yang belum ada. Kalau sebuah migrasi baru sudah terlanjur jalan dan harus dibatalkan, pakai `php artisan migrate:rollback` untuk satu langkah itu, lalu impor cadangan jika datanya ikut rusak.

## File SQL untuk pengumpulan tugas

`backend/database/export/sportscourt.sql` dibuat dari database kosong dengan `php artisan migrate:fresh --seed`, lalu di-dump dari MariaDB 10.11.14. Isinya skema lengkap dan data demo. Password di dalam file sudah dalam bentuk hash. Tidak ada `APP_KEY` dan tidak ada password database.

Cara impor di phpMyAdmin:

1. Buat database `sportscourt` dengan collation `utf8mb4_unicode_ci` kalau belum ada.
2. Klik database itu di panel kiri.
3. Buka tab Import, pilih `sportscourt.sql`, lalu jalankan.
4. Impor ulang akan menghapus tabel di database yang sedang dipilih. Jangan lakukan ini pada database yang sudah berisi booking sungguhan.
