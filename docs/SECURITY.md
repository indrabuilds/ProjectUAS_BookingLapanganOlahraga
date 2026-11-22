# SportsCourt: catatan audit keamanan

Status: Phase 8. Audit ini memeriksa kode yang sudah ada. Tidak ada fitur baru.

Perintah yang dijalankan pada 21 Nov 2026:

- `php artisan test` pada MariaDB `sportscourt_test`: 71 lulus, 469 assertion.
- `composer audit` di `backend/`: tidak ada advisory.
- `npm audit` di `frontend/`: 0 kerentanan (167 dependency).
- Login tanpa cookie CSRF ke `http://localhost:8000/api/v1/auth/login`: HTTP 419.
- Login yang sama setelah `/sanctum/csrf-cookie` dan header `X-XSRF-TOKEN`: HTTP 200. Respons user tidak berisi password.
- Cookie `sportscourt-session`: `httponly`, `samesite=lax`, `domain=localhost`. Cookie ini tidak `secure` karena situs lokal memakai http.
- Pemeriksaan otomatis pada halaman frontend pada saat audit tidak melaporkan temuan.

## Temuan yang diperbaiki

### F1. Validasi membocorkan data orang lain

Form request Laravel berjalan sebelum controller. Pemilik venue lain yang mengirim nama lapangan yang sudah ada, atau body yang tidak valid, mendapat 422. Dari situ dia tahu venue atau booking itu ada. Seharusnya jawaban itu 404.

Perbaikan: `HidesForeignResources` menolak lebih dulu kalau user bukan pemilik venue, lapangan, atau booking. Berlaku untuk ubah venue, tambah atau ubah lapangan, upload gambar, jam buka, blokir, dan batal atau tolak booking.

Tes: `tests/Feature/Security/ForeignResourceTest.php`. Pemilik lain mendapat 404. Pemilik yang sah tetap mendapat 422 kalau namanya bentrok.

### F2. Tanggal salah pada lapangan tersembunyi

`GET /courts/{id}/availability?date=bukan-tanggal` pada venue yang belum disetujui mengembalikan 422. Itu memberitahu bahwa id lapangan ada.

Perbaikan: `Court::isOpenToPublic()` dicek di form request sebelum aturan tanggal. Lapangan yang belum layak dipesan tetap 404.

Tes yang sama menutup kasus ini.

## Yang dicek dan tidak bermasalah

### Akses dan IDOR

Middleware `role` dan `active` memagari endpoint. Venue dan lapangan orang lain mengembalikan 404, bukan 403, supaya keberadaan datanya tidak dikonfirmasi. Booking orang lain juga 404 lewat policy `view`. Dashboard customer, owner, dan admin saling menolak dengan 403. Admin tidak bisa menangguhkan dirinya atau admin lain (`USER_SUSPEND_FORBIDDEN`).

Email pelanggan tidak ikut di resource booking untuk pemilik. Yang ikut hanya nama dan telepon.

### Injection

Query memakai Eloquent. Pencarian `q` mengunci `%` dan `_` sebelum `LIKE`, jadi wildcard tidak dipakai sebagai pola bebas. Tidak ada SQL yang disusun dari string mentah milik user.

### XSS

Deskripsi venue, catatan booking, dan alasan status ditampilkan sebagai teks React. Tidak ada `dangerouslySetInnerHTML`. Browser tidak menjalankan HTML yang diketik user.

### CSRF

SPA memakai cookie session Sanctum. Axios mengirim `X-XSRF-TOKEN` dan mengulang sekali kalau dapat 419. Permintaan login tanpa token ditolak 419 di server yang sedang berjalan. PHPUnit mematikan CSRF, jadi tes otomatis tidak membuktikan 419. Bukti 419 diambil dari permintaan curl di atas.

### Session

Login memakai `session()->regenerate()`. Logout memanggil `invalidate()` dan `regenerateToken()`. Akun yang passwordnya benar tetapi statusnya ditangguhkan langsung dikeluarkan. Middleware `active` menolak session lama setelah admin menangguhkan user.

Cookie session `httponly` dan `samesite=lax`. `XSRF-TOKEN` sengaja tidak `httponly`, karena JavaScript harus membacanya untuk header CSRF. Itu pola Sanctum.

`SESSION_SECURE_COOKIE=false` di contoh lokal. Cookie `secure` tidak terkirim lewat http, jadi localhost akan rusak kalau dipaksa true. Contoh untuk server HTTPS ada di `backend/.env.production.example` dan `docs/DEPLOY.md`.

Saat `APP_DEBUG=true`, jawaban 419 menyertakan jejak file. Itu berguna di komputer lokal dan berbahaya di server sungguhan. `.env.example` sekarang mencatat bahwa production harus `APP_DEBUG=false`.

### CORS

`config/cors.php` hanya mengizinkan `FRONTEND_URL` (default `http://localhost:5173`) dan `supports_credentials` true. Origin bintang tidak dipakai.

### Upload

Gambar venue dan lapangan: wajib file, aturan `image`, hanya jpg, jpeg, png, webp, maksimal 2 MB, maksimal 4000 x 4000 piksel. SVG ditolak. Nama file dibuat acak oleh `store()`, bukan nama dari komputer user. File disimpan di disk `public`. Tes upload yang gagal (SVG, terlalu besar, terlalu lebar, foto ke-6) sudah ada dari Phase 4.

### Mass assignment

`users.role` dan `users.status` ditetapkan secara eksplisit oleh server. Keduanya tetap di luar daftar atribut yang boleh diisi massal. Register hanya membaca `account_type` yang sudah divalidasi (`customer` atau `owner`). Profil hanya mengisi `name` dan `phone`. Venue mengisi `owner_id` dan `status` di controller, bukan dari body. Harga dan status booking diisi `BookingService`.

### Rate limit

| Nama | Batas |
|------|--------|
| `api` | 60 per menit per user atau IP |
| `login` | 5 per menit per email dan IP |
| `register` | 5 per menit per IP |
| `password` | 5 per menit per user |
| `uploads` | 20 per menit per user atau IP |
| `booking-create` | 10 per menit per user atau IP |

Pesan login yang gagal sama untuk email yang tidak ada dan password yang salah, supaya email tidak bisa ditebak. Status ditangguhkan baru disebut setelah password benar.

### Dependency

`composer audit`: tidak ada advisory. `npm audit`: 0 kerentanan.

## Yang sengaja dibiarkan

- Password demo `Rahasia12` di `DemoDataSeeder` hanya untuk data lokal. Bukan rahasia production.
- `DB_PASSWORD` kosong dan user `root` di `.env.example` hanya contoh XAMPP lokal. Production harus memakai akun database sendiri. Itu Phase 9.
- Konfirmasi booking tidak mengunci ulang baris court. Slot pending sudah menahan jadwal, dan konfirmasi ditolak kalau `expires_at` sudah lewat. Dua booking bersamaan tetap diuji di Phase 6: tepat satu yang berhasil.

## Batasan audit

Audit ini membaca kode, tes otomatis, `composer audit`, `npm audit`, dan satu permintaan CSRF langsung ke server lokal. Tidak ada uji penetrasi dari luar, tidak ada pemindaian production, dan belum ada konfigurasi HTTPS.
