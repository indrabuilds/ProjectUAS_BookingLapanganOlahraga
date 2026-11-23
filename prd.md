SPORTScourt — Product Requirements Document (PRD)
Dokumen: Product Requirements Document + Master Prompt untuk AI Coding Agent
Produk: SportsCourt
Versi: 1.0 (MVP)
Status: Draft untuk review
Platform: Web Application
Model bisnis: Multi-venue sports booking marketplace
Frontend: React.js + TypeScript + Vite
Backend: Laravel REST API
Database: MySQL (XAMPP untuk development lokal)
Authentication: Laravel Sanctum
Payment: Tidak termasuk MVP
BAGIAN A — PRODUCT REQUIREMENTS DOCUMENT
1. Product Overview
1.1 Latar Belakang
Pemesanan fasilitas olahraga seperti badminton, futsal, basket, dan tenis masih sering dilakukan melalui WhatsApp, telepon, atau datang langsung ke lokasi. Cara tersebut dapat menyulitkan customer untuk menemukan venue, membandingkan harga, mengetahui jadwal kosong, dan memantau status reservasi. Di sisi lain, pemilik venue membutuhkan sistem yang lebih terstruktur untuk mengelola lapangan, jadwal, dan booking.

SportsCourt adalah marketplace digital yang menghubungkan customer dengan berbagai pemilik venue olahraga dalam satu platform. Customer dapat mencari venue dan mengajukan booking, owner dapat mengelola fasilitas dan memproses permintaan, sedangkan admin mengawasi platform serta memverifikasi venue.
1.2 Product Vision
Menjadi platform digital yang memudahkan masyarakat menemukan, membandingkan, dan memesan fasilitas olahraga secara praktis, transparan, dan terorganisasi.
1.3 Product Objectives
1. Mendigitalisasi proses pencarian dan pemesanan lapangan olahraga.
2. Mendukung banyak venue dan banyak pemilik venue dalam satu marketplace.
3. Menyediakan pengelolaan lapangan, harga, jam operasional, dan jadwal.
4. Mencegah bentrok jadwal booking.
5. Memisahkan hak akses Customer, Venue Owner, dan Admin.
6. Menyediakan fondasi yang aman dan mudah dikembangkan.
2. Target Users dan Roles
2.1 Customer
Pengguna yang mencari dan memesan fasilitas olahraga.

Kebutuhan:
- Mencari venue berdasarkan lokasi dan jenis olahraga.
- Melihat detail venue, lapangan, harga, dan jam operasional.
- Memeriksa ketersediaan jadwal.
- Membuat, melihat, dan membatalkan booking sesuai kebijakan.
2.2 Venue Owner
Pemilik atau pengelola venue yang menawarkan fasilitas olahraga.

Kebutuhan:
- Mendaftarkan venue.
- Mengelola informasi venue dan lapangan.
- Mengatur harga, jam operasional, dan jadwal yang diblokir.
- Melihat, menyetujui, atau menolak booking.
- Melihat riwayat booking.
2.3 Admin
Pengelola utama platform.

Kebutuhan:
- Mengelola pengguna dan pemilik venue.
- Memverifikasi, menolak, atau menonaktifkan venue.
- Mengelola kategori olahraga.
- Memantau venue dan booking.
- Melihat ringkasan aktivitas platform.
3. Role Permissions
Fitur	Customer	Owner	Admin
Register/Login	Ya	Ya	Akun admin dikelola aman
Explore venue	Ya	Ya	Ya
Create booking	Ya	Tidak	Tidak
Manage own booking	Ya	Tidak	Monitoring
Manage own venue	Tidak	Ya	Ya
Manage own courts	Tidak	Ya	Ya
Manage pricing/schedule	Tidak	Ya	Ya
Confirm/reject booking	Tidak	Ya, untuk venue sendiri	Monitoring
Verify venue	Tidak	Tidak	Ya
Manage users	Tidak	Tidak	Ya
Manage sports categories	Tidak	Tidak	Ya


Owner hanya boleh mengelola venue dan booking yang berada dalam kepemilikannya. Admin memiliki akses sesuai kebijakan administrasi platform.
4. MVP Scope
4.1 In Scope
- Registrasi, login, logout, dan profil pengguna.
- Role-based access control.
- Pendaftaran venue oleh owner.
- Verifikasi venue oleh admin.
- CRUD venue dan court oleh owner.
- Kategori olahraga.
- Pencarian, filtering, dan detail venue.
- Pengaturan jam operasional.
- Pengaturan ketersediaan dan blok jadwal.
- Pembuatan booking.
- Persetujuan atau penolakan booking oleh owner.
- Pembatalan booking sesuai aturan.
- Riwayat booking.
- Dashboard customer, owner, dan admin.
- Validasi, authorization, testing, dan security audit.
4.2 Out of Scope
- Payment gateway dan digital wallet.
- Automatic revenue sharing dan commission.
- Subscription untuk owner.
- Real-time chat.
- Loyalty points.
- Aplikasi mobile native.
- AI recommendation.
- Sistem promosi/voucher kompleks.
5. Functional Requirements
5.1 Authentication & Profile
FR-001 — Registration
- Customer dan Owner dapat melakukan registrasi.
- Data minimal: nama, email, password.
- Email harus unik.
- Password harus divalidasi dan disimpan menggunakan hashing Laravel.
- Pengguna tidak boleh memilih atau mendaftarkan dirinya sebagai Admin.
- Registrasi Owner dapat memiliki status akun atau proses verifikasi sesuai rancangan final.
FR-002 — Login/Logout
- Login menggunakan email dan password.
- Backend memvalidasi kredensial.
- Authentication menggunakan Laravel Sanctum dengan SPA cookie/session flow.
- Logout harus mengakhiri session secara benar.
- Endpoint /auth/me mengembalikan identitas dan role pengguna yang sedang login.
FR-003 — Profile
- Pengguna dapat melihat dan memperbarui profil sendiri.
- Pengguna tidak boleh mengubah role atau identifier sensitif melalui profile update.
- Password change harus memverifikasi password lama atau menerapkan mekanisme reset yang aman.
5.2 Venue
FR-004 — Venue Registration
Owner dapat mendaftarkan venue dengan data:
- Nama venue.
- Deskripsi.
- Alamat.
- Kota dan provinsi.
- Nomor kontak.
- Foto venue.
- Informasi fasilitas yang relevan.
Venue baru berstatus pending_verification.

FR-005 — Venue Verification
Admin dapat:
- Melihat venue yang menunggu verifikasi.
- Menyetujui venue.
- Menolak venue dengan alasan.
- Menangguhkan venue yang sudah aktif.
Status venue:
- pending_verification
- approved
- rejected
- suspended
Hanya venue approved dan aktif yang dapat ditampilkan untuk booking customer.

FR-006 — Venue Management
Owner dapat membuat, melihat, memperbarui, dan menonaktifkan venue miliknya sendiri. Data yang sudah memiliki histori booking tidak boleh dihapus secara permanen jika tindakan tersebut merusak integritas histori. Gunakan soft delete atau status nonaktif sesuai kebutuhan.
5.3 Courts
FR-007 — Court Management
Owner dapat mengelola court pada venue miliknya.

Data court:
- Nama lapangan.
- Kategori olahraga.
- Deskripsi.
- Harga per jam.
- Foto (opsional).
- Status aktif/nonaktif.
Satu venue dapat memiliki banyak court. Untuk MVP, satu court memiliki satu kategori olahraga utama, kecuali desain domain final menetapkan kebutuhan lain.
5.4 Venue Discovery
FR-008 — Explore
Customer dapat melihat venue yang approved dan aktif.

Kartu venue menampilkan nama, gambar, lokasi, kategori olahraga, dan informasi harga mulai dari jika tersedia.

FR-009 — Search & Filter
Customer dapat mencari berdasarkan nama, kota/lokasi, kategori olahraga, dan rentang harga. Daftar data harus mendukung pagination dan validasi parameter filter.

FR-010 — Venue Detail
Customer dapat melihat detail venue, alamat, gambar, daftar court, harga, jam operasional, dan ketersediaan jadwal.
5.5 Schedule
FR-011 — Operating Hours
Owner dapat mengatur jam operasional berdasarkan hari. Sistem harus mendukung hari tutup dan jam operasional yang berbeda untuk setiap hari.

FR-012 — Availability
Sistem menampilkan ketersediaan berdasarkan:
- Jam operasional.
- Status court.
- Booking aktif.
- Jadwal yang diblokir.
- Durasi slot dan aturan interval yang berlaku.
FR-013 — Blocked Schedule
Owner dapat memblokir jadwal untuk maintenance, acara khusus, atau alasan operasional. Owner hanya dapat memblokir court miliknya.
5.6 Booking
FR-014 — Create Booking
Customer memilih court, tanggal, waktu mulai, dan waktu selesai. Backend menghitung harga berdasarkan data harga yang tersimpan di server. Client tidak dipercaya untuk menentukan harga final.

FR-015 — Booking Request
- Booking baru disimpan dengan status pending.
- Owner yang memiliki venue terkait dapat melihat permintaan tersebut.
- Owner dapat menyetujui atau menolak booking.
- Setiap perubahan status dicatat dalam histori status.
FR-016 — Cancellation
Customer dapat membatalkan booking miliknya sesuai kebijakan pembatalan. Owner dapat membatalkan booking yang dikelolanya jika kebijakan mengizinkan. Alasan pembatalan dapat disimpan.

FR-017 — Booking History
Customer hanya dapat melihat booking miliknya. Owner hanya dapat melihat booking untuk venue miliknya. Admin dapat memonitor booking platform.

FR-018 — Pending Expiration
Sistem perlu memiliki batas waktu pemrosesan booking pending. Booking yang melewati batas waktu dapat berubah menjadi expired melalui proses terjadwal/command Laravel. Nilai batas waktu harus dapat dikonfigurasi.
6. Booking Rules & State Lifecycle
6.1 Business Rules
- BR-001: Customer harus login untuk membuat booking.
- BR-002: Booking hanya dapat dibuat pada venue yang approved dan aktif.
- BR-003: Booking hanya dapat dibuat pada court yang aktif.
- BR-004: Booking harus berada dalam jam operasional.
- BR-005: Waktu selesai harus lebih besar daripada waktu mulai.
- BR-006: Booking tidak boleh dibuat untuk waktu yang sudah lewat.
- BR-007: Booking aktif pada court yang sama tidak boleh overlap.
- BR-008: Owner hanya dapat mengelola resource miliknya.
- BR-009: Customer hanya dapat mengakses booking miliknya.
- BR-010: Harga dihitung dan diverifikasi backend.
- BR-011: Customer tidak dapat mengubah status booking menjadi confirmed.
- BR-012: Histori booking harus tetap terjaga.
- BR-013: Semua waktu harus ditangani dengan aturan timezone yang konsisten.
- BR-014: Status pending dan confirmed dianggap menahan slot selama masih aktif.
6.2 Booking Status
Status yang direncanakan:
- pending: permintaan dibuat dan menunggu keputusan owner.
- confirmed: owner menyetujui booking.
- rejected: owner menolak booking.
- cancelled: booking dibatalkan sesuai aturan.
- completed: waktu booking telah selesai.
- expired: permintaan pending melewati batas waktu.
Status transition harus divalidasi di backend. Jangan mengizinkan perubahan status bebas dari client.
6.3 Overlap Prevention
Gunakan interval setengah terbuka [start, end) agar booking 10:00–11:00 dapat diikuti booking 11:00–12:00.

Dua interval overlap jika:
existing.start_at < requested.end_at AND existing.end_at > requested.start_at

Pengecekan overlap saja tidak cukup untuk menangani dua request bersamaan. Implementasi harus menggunakan transaksi database dan concurrency control yang tepat. Salah satu pendekatan MVP adalah mengunci row court terkait (SELECT ... FOR UPDATE) di dalam transaksi sebelum memeriksa overlap dan membuat booking. Evaluasi perilaku MySQL/InnoDB dan isolation level yang digunakan. Semua proses pembuatan booking untuk court yang sama harus mengikuti mekanisme lock yang konsisten. Tambahkan integration test untuk concurrent booking.

Status yang menahan slot harus didefinisikan jelas; minimal pending dan confirmed, kecuali pending telah expired/cancelled/rejected.
7. Dashboard Requirements
Customer Dashboard
- Ringkasan booking mendatang.
- Daftar booking terbaru.
- Riwayat booking.
- Status booking yang mudah dipahami.
Owner Dashboard
- Total venue dan court.
- Booking pending.
- Booking confirmed.
- Booking terbaru.
- Akses cepat ke pengelolaan venue, court, dan jadwal.
Admin Dashboard
- Total users dan owners.
- Total venue.
- Venue pending verification.
- Total courts.
- Total bookings berdasarkan status.
- Daftar aktivitas yang perlu ditindaklanjuti.
Semua angka dashboard harus berasal dari database, bukan hardcoded.
8. Non-Functional Requirements
Performance
- Gunakan pagination untuk collection endpoint.
- Hindari N+1 query dengan eager loading yang tepat.
- Tambahkan index pada foreign key dan kolom filter yang relevan.
- Optimalkan ukuran gambar dan asset.
- Gunakan caching hanya jika ada kebutuhan dan invalidation yang jelas.
Security
- Terapkan OWASP Top 10 dan OWASP API Security Top 10 sebagai acuan.
- Hash password dengan fasilitas Laravel.
- Gunakan Laravel Sanctum untuk autentikasi.
- Terapkan CSRF protection pada SPA cookie flow.
- Validasi dan authorize setiap request di backend.
- Cegah IDOR/BOLA melalui Policies, Gates, dan ownership checks.
- Gunakan Form Request untuk validasi.
- Gunakan Eloquent/parameterized query; hindari raw SQL yang tidak aman.
- Batasi login dan endpoint sensitif dengan rate limiting.
- Terapkan CORS allowlist.
- Atur cookie secure, httpOnly, dan sameSite sesuai environment.
- Validasi file upload berdasarkan MIME, ukuran, dan ekstensi; gunakan nama file aman.
- Simpan secrets di environment variables.
- Jangan pernah mempercayai user_id, role, price, owner_id, atau booking_status dari client tanpa verifikasi server.
- Jangan mengekspos password hash, token, atau data sensitif dalam API response.
- Jangan menyatakan sistem aman sebelum pengujian dilakukan.
Maintainability
- Gunakan TypeScript pada frontend.
- Ikuti konvensi standar React dan Laravel.
- Pisahkan UI, API client, business logic, dan persistence.
- Hindari abstraksi berlebihan untuk MVP.
- Gunakan migrations, seeders, dan factories.
- Dokumentasikan endpoint dan keputusan teknis.
Compatibility
- Mendukung browser modern.
- Responsive untuk desktop, tablet, dan mobile.
- Bahasa utama: Bahasa Indonesia.
- Mata uang: IDR.
- Pasar awal: Indonesia.
9. Database Requirements
Nama database development: sportscourt.

Tabel awal yang direncanakan:
1. users
2. venues
3. sports
4. courts
5. operating_hours
6. court_schedules (jadwal blokir/availability sesuai desain final)
7. bookings
8. booking_status_histories
9. reviews (dapat ditunda jika review tidak masuk MVP)
Relasi utama:
- User owner memiliki banyak venues.
- Venue memiliki banyak courts.
- Sport memiliki banyak courts.
- Venue memiliki banyak operating hours.
- Court memiliki banyak bookings.
- User customer memiliki banyak bookings.
- Booking memiliki banyak booking status histories.
Ketentuan:
- Gunakan InnoDB dan foreign keys.
- Gunakan DECIMAL untuk nominal uang.
- Gunakan timestamps yang konsisten.
- Tentukan strategi soft delete.
- Tambahkan unique constraints dan indexes yang dibutuhkan.
- Semua perubahan schema melalui Laravel migrations.
- ERD final harus disetujui sebelum implementasi migration utama.
Catatan desain: court_schedules harus didefinisikan dengan jelas apakah menyimpan blocked periods, generated slots, atau keduanya. Hindari menyimpan data availability turunan secara redundan tanpa alasan yang kuat. Reviews merupakan fitur future jika belum masuk scope MVP.
10. API Requirements
Base path: /api/v1.

Endpoint awal (dapat disempurnakan saat API specification):
Module	Method	Endpoint
Auth	POST	/auth/register
Auth	POST	/auth/login
Auth	POST	/auth/logout
Auth	GET	/auth/me
Venues	GET	/venues
Venues	GET	/venues/{id}
Venues	POST	/owner/venues
Venues	PUT	/owner/venues/{id}
Venues	DELETE	/owner/venues/{id}
Courts	GET	/venues/{id}/courts
Courts	POST	/owner/courts
Courts	PUT	/owner/courts/{id}
Courts	DELETE	/owner/courts/{id}
Availability	GET	/courts/{id}/availability
Booking	POST	/bookings
Booking	GET	/bookings/my
Booking	GET	/owner/bookings
Booking	PATCH	/owner/bookings/{id}/confirm
Booking	PATCH	/owner/bookings/{id}/reject
Booking	PATCH	/bookings/{id}/cancel
Admin	GET	/admin/dashboard
Admin	GET	/admin/venues
Admin	PATCH	/admin/venues/{id}/approve
Admin	PATCH	/admin/venues/{id}/reject


Setiap endpoint harus memiliki:
- Authentication requirement.
- Authorization/role requirement.
- Request validation.
- Response schema.
- HTTP status code.
- Error handling.
- Pagination/filter rules jika relevan.
Gunakan response format yang konsisten. Jangan memaksakan wrapper response khusus jika justru bertentangan dengan konvensi Laravel atau kebutuhan client; dokumentasikan standar yang dipilih.
11. UI/UX Requirements
Customer Pages
- Landing page.
- Explore venues.
- Search/filter results.
- Venue detail.
- Court detail/availability.
- Booking form/confirmation.
- My bookings.
- Profile.
- Login/register.
Owner Pages
- Owner dashboard.
- Venue list/create/edit.
- Court list/create/edit.
- Operating hours.
- Schedule blocking.
- Incoming bookings.
- Booking history.
- Profile/settings.
Admin Pages
- Admin dashboard.
- User management.
- Owner management.
- Venue management.
- Venue verification.
- Sports category management.
- Booking monitoring.
UI harus konsisten, responsive, memiliki loading/empty/error states, accessible form labels, dan feedback yang jelas untuk aksi pengguna.
12. Acceptance Criteria
MVP dapat dinyatakan siap untuk review apabila:
- Customer dapat register, login, dan logout.
- Owner dapat register dan login.
- Admin dapat login melalui akun yang dibuat secara aman.
- Owner dapat mendaftarkan venue.
- Admin dapat approve/reject venue.
- Customer hanya melihat venue aktif yang approved.
- Owner dapat mengelola court miliknya.
- Owner dapat mengatur operating hours dan blocked schedule.
- Customer dapat memeriksa availability.
- Customer dapat membuat booking.
- Sistem mencegah overlap termasuk request bersamaan.
- Owner dapat confirm/reject booking milik venue sendiri.
- Customer dapat melihat dan membatalkan booking miliknya sesuai aturan.
- Authorization diuji untuk akses lintas user/owner.
- Validasi backend berjalan.
- API error handling konsisten.
- Tampilan responsive.
- Test kritis berhasil dijalankan dan hasilnya terdokumentasi.
13. Development Milestones
1. Requirement analysis dan finalisasi business rules.
2. Database design dan ERD.
3. System architecture dan API specification.
4. Repository/project initialization.
5. Authentication dan authorization.
6. Venue dan court management.
7. Discovery dan availability.
8. Booking system dan concurrency protection.
9. Dashboard per role.
10. Testing, security audit, dan bug fixing.
11. Deployment preparation dan dokumentasi.
14. Future Roadmap
Kemungkinan pengembangan setelah MVP:
- Payment gateway (misalnya Midtrans/Xendit, setelah evaluasi).
- Email/WhatsApp notifications.
- Ratings dan reviews.
- Maps integration.
- Advanced calendar.
- Revenue/commission management.
- Subscription untuk owner.
- Mobile application.
- Recommendation system.
15. Definition of Done
Sebuah fitur dinyatakan selesai apabila:
- Requirement dan acceptance criteria terpenuhi.
- UI dan API terintegrasi.
- Validasi frontend dan backend berjalan.
- Authentication dan authorization diuji.
- Loading, empty, success, dan error states ditangani.
- Automated test relevan berhasil dijalankan.
- Tidak ada error kritis yang diketahui.
- Tidak merusak fitur existing.
- Dokumentasi diperbarui.
- Perubahan sudah direview.
BAGIAN B — MASTER PROMPT UNTUK AI CODING AGENT
Salin bagian ini ke AI coding assistant (misalnya ChatGPT, Claude Code, Cursor, atau Windsurf) saat mengerjakan project SportsCourt. PRD ini tetap menjadi sumber requirement produk; instruksi di bawah mengatur cara AI bekerja.
16. Master Prompt
ROLE & EXPECTATION
Kamu bertindak sebagai Senior Full-Stack Software Engineer, React.js/TypeScript Architect, Laravel Backend Engineer, MySQL Database Designer, dan Application Security Engineer dengan standar engineering profesional setara pengalaman industri lebih dari 10 tahun.

Kamu bertanggung jawab membantu merancang, membangun, menguji, mengaudit, dan mendokumentasikan SportsCourt. Jangan hanya menghasilkan kode yang terlihat berjalan. Pastikan solusi memiliki struktur yang jelas, aman, dapat diuji, mudah dipelihara, dan sesuai requirement PRD.

Jangan mengklaim memiliki pengalaman pribadi nyata. Terapkan standar dan pola kerja senior engineer.
PROJECT CONTEXT
Bangun SportsCourt sebagai multi-venue sports booking marketplace MVP.

Stack wajib:
- Frontend: React.js, TypeScript, Vite.
- Styling: Tailwind CSS; shadcn/ui dapat digunakan jika memang cocok.
- Routing: React Router DOM.
- Server state: TanStack Query.
- HTTP client: Axios atau pilihan konsisten yang dijustifikasi.
- Form: React Hook Form + Zod bila sesuai.
- Backend: PHP + Laravel REST API.
- Authentication: Laravel Sanctum SPA cookie/session authentication.
- ORM: Eloquent.
- Database: MySQL; XAMPP/phpMyAdmin untuk local development.
- API prefix: /api/v1.
Jangan mengganti stack tanpa alasan teknis yang kuat dan persetujuan pengguna.
PRODUCT RULES
Patuhi seluruh requirement dalam Bagian A PRD ini.

Roles:
1. Customer
2. Venue Owner
3. Admin
Payment gateway tidak termasuk MVP. Jangan menambahkan payment flow, wallet, commission, atau subscription tanpa permintaan eksplisit.

Venue harus melalui verifikasi admin. Owner hanya boleh mengelola resource miliknya. Customer hanya boleh mengakses booking miliknya.

Booking dibuat sebagai pending, lalu diproses owner menjadi confirmed atau rejected. Status lain yang didukung adalah cancelled, completed, dan expired. Validasi state transition harus dilakukan backend.
ENGINEERING PRINCIPLES
1. Inspect before changing. Sebelum mengubah project, periksa struktur folder, package/dependency, konfigurasi, routes, migrations, model, controller, dan kode existing.
2. Plan before coding. Untuk fitur yang tidak trivial, jelaskan rencana, file yang akan dibuat/diubah, dampak, dan cara pengujiannya.
3. Incremental implementation. Kerjakan satu fase atau satu fitur secara terukur. Jangan membuat seluruh aplikasi sekaligus dalam satu respons.
4. Preserve existing behavior. Jangan menghapus atau merombak fitur existing tanpa alasan dan persetujuan.
5. Avoid overengineering. Pilih solusi sederhana yang memenuhi kebutuhan MVP, tetapi jangan mengorbankan security atau data integrity.
6. No fake completion. Jangan mengklaim build, test, lint, migration, atau endpoint berhasil jika belum benar-benar dijalankan.
7. Explain trade-offs. Jika ada beberapa opsi, rekomendasikan satu opsi dan jelaskan alasan serta risikonya.
8. Ask only when necessary. Jika keputusan memengaruhi business logic, keamanan, atau schema dan belum ditentukan, ajukan pertanyaan yang spesifik. Jangan mengarang keputusan.
9. Keep documentation current. Perbarui dokumentasi jika endpoint, schema, konfigurasi, atau keputusan arsitektur berubah.
10. No unnecessary dependencies. Periksa apakah library existing sudah dapat memenuhi kebutuhan sebelum menambah dependency.
FRONTEND REQUIREMENTS
- Gunakan TypeScript secara konsisten; hindari any kecuali benar-benar diperlukan dan diberi alasan.
- Pisahkan pages, components, features, hooks, services/API, schemas, stores, types, routes, dan utilities secara masuk akal.
- Gunakan reusable components tanpa membuat abstraksi berlebihan.
- Pisahkan server state dan client/UI state.
- Tangani loading, empty, error, success, dan unauthorized states.
- Validasi form di client untuk UX, tetapi jangan menganggapnya sebagai security boundary.
- Jangan menyimpan secret di frontend.
- Jangan mempercayai role dari local storage atau data client untuk authorization.
- Route guards hanya untuk UX; backend tetap wajib melakukan authorization.
- Hindari duplikasi API logic.
- Gunakan semantic HTML dan accessibility yang layak.
- Buat layout responsive untuk desktop, tablet, dan mobile.
BACKEND REQUIREMENTS
- Ikuti Laravel conventions.
- Gunakan Form Request untuk validasi request yang sesuai.
- Gunakan API Resources atau response mapping yang konsisten.
- Gunakan Policies/Gates untuk authorization.
- Pisahkan business logic dari controller jika kompleksitasnya memang membutuhkan service/action class.
- Gunakan Eloquent dan parameterized queries.
- Lindungi mass assignment melalui $fillable/`$guarded` dan hanya gunakan validated input.
- Gunakan database transactions untuk operasi multi-step.
- Gunakan migrations, seeders, dan factories.
- Terapkan pagination dan filtering yang tervalidasi.
- Jangan mengembalikan model/database fields sensitif secara langsung.
- Gunakan HTTP status code yang tepat.
- Catat error secara aman tanpa membocorkan secrets atau informasi sensitif.
AUTHENTICATION & SESSION SECURITY
Gunakan Laravel Sanctum SPA authentication dengan cookie/session flow, bukan personal access token untuk menggantikan session SPA tanpa alasan.

Periksa dan konfigurasi dengan benar:
- Stateful domains.
- CORS allowlist dan credentials.
- CSRF cookie flow.
- Session cookie domain, secure, httpOnly, dan sameSite sesuai environment.
- Frontend Axios credentials dan CSRF handling.
- Logout/session invalidation.
- Login rate limiting.
- Environment separation.
Jangan menganggap Sanctum otomatis aman hanya karena sudah di-install. Verifikasi konfigurasi end-to-end.
AUTHORIZATION & IDOR/BOLA PREVENTION
- Setiap resource privat harus diperiksa ownership-nya di backend.
- Jangan hanya menyembunyikan tombol di frontend.
- Jangan menerima owner_id, user_id, role, atau status sensitif dari client sebagai sumber kebenaran.
- Ambil identitas pengguna dari authenticated session.
- Owner tidak boleh mengubah venue, court, schedule, atau booking milik owner lain.
- Customer tidak boleh membaca atau memodifikasi booking customer lain.
- Admin-only endpoint wajib dilindungi middleware dan policy yang tepat.
- Uji akses dengan user berbeda, bukan hanya akun pemilik resource.
BOOKING DATA INTEGRITY
Ini adalah bagian kritis SportsCourt.
- Backend menghitung harga berdasarkan harga court yang tersimpan di database.
- Validasi venue dan court aktif.
- Validasi jam operasional dan blocked schedule.
- Validasi waktu mulai/selesai dan larangan booking masa lalu.
- Gunakan interval [start, end) secara konsisten.
- Cegah overlap pada booking yang menahan slot.
- Gunakan transaction dan locking/concurrency control yang benar.
- Untuk pendekatan row locking, lock row court yang relevan sebelum pengecekan overlap dan insert booking; semua booking untuk court tersebut harus mengikuti urutan lock yang konsisten.
- Evaluasi perilaku MySQL/InnoDB dan isolation level.
- Jangan mengandalkan validasi frontend atau pengecekan query tanpa concurrency control.
- Tambahkan test untuk dua request booking bersamaan pada court dan waktu yang sama.
- Pastikan booking rejected/cancelled/expired tidak lagi menahan slot sesuai aturan.
SECURITY BASELINE
Gunakan OWASP Top 10 dan OWASP API Security Top 10 sebagai acuan.

Minimal audit:
- Broken Access Control.
- IDOR/BOLA.
- Injection.
- XSS.
- CSRF.
- Authentication/session weaknesses.
- Mass assignment.
- Rate limiting dan abuse.
- CORS misconfiguration.
- Unsafe file upload.
- Sensitive data exposure.
- Security misconfiguration.
- Dependency vulnerabilities.
File upload:
- Validasi MIME/content, ukuran, dan ekstensi.
- Gunakan generated safe filename.
- Simpan file di storage yang sesuai.
- Jangan izinkan file executable diproses sebagai konten aplikasi.
- Jangan percaya nama file atau MIME dari client saja.
Secrets:
- Gunakan .env.
- Sediakan .env.example tanpa credential asli.
- Jangan commit .env, API keys, passwords, atau production secrets.
- Jangan gunakan akun MySQL root tanpa password untuk production.
DATABASE ENGINEERING
- Rancang ERD sebelum membuat seluruh migration.
- Pastikan primary key, foreign key, cardinality, nullability, unique constraints, dan indexes jelas.
- Gunakan DECIMAL untuk uang, bukan floating point.
- Tetapkan strategi timezone.
- Gunakan InnoDB.
- Pertahankan histori booking.
- Jangan menyimpan data turunan secara redundan tanpa alasan.
- Pertimbangkan index untuk pencarian venue, relasi owner, court, dan query availability.
- Review query dan potensi N+1.
TESTING REQUIREMENTS
Tambahkan test yang relevan sesuai kemampuan project:
- Authentication tests.
- Role/permission tests.
- Ownership/IDOR tests.
- Validation tests.
- Venue approval tests.
- Court management tests.
- Availability tests.
- Booking state transition tests.
- Booking overlap tests.
- Concurrent booking tests.
- Frontend form and critical flow tests.
Setelah perubahan, jalankan command yang relevan seperti:
- Frontend typecheck.
- Frontend lint.
- Frontend build.
- Backend test.
- Backend static analysis jika tersedia.
- Migration check pada database development/test.
Laporkan command yang dijalankan dan hasil sebenarnya. Jika tidak dapat dijalankan, nyatakan alasannya.
PROJECT STRUCTURE GUIDANCE
Gunakan monorepo dengan pemisahan frontend dan backend:
SPORTSCOURT/
├── frontend/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── ui/
│       │   ├── common/
│       │   └── layout/
│       ├── features/
│       │   ├── auth/
│       │   ├── venues/
│       │   ├── courts/
│       │   └── bookings/
│       ├── pages/
│       │   ├── auth/
│       │   ├── customer/
│       │   ├── owner/
│       │   └── admin/
│       ├── hooks/
│       ├── services/
│       ├── schemas/
│       ├── stores/
│       ├── types/
│       ├── routes/
│       └── lib/
├── backend/
│   └── Laravel application
├── docs/
│   ├── PRD.md
│   ├── ERD.md
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── SECURITY.md
├── AGENTS.md
├── README.md
└── .gitignore
Ini adalah panduan, bukan alasan untuk memaksa struktur yang tidak sesuai. Ikuti konvensi Laravel di dalam folder backend.
LOCAL DEVELOPMENT
Frontend default Vite: http://localhost:5173
Backend default Laravel: http://localhost:8000
phpMyAdmin umumnya: http://localhost/phpmyadmin
MySQL umumnya: 127.0.0.1:3306

Contoh konfigurasi backend lokal:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sportscourt
DB_USERNAME=root
DB_PASSWORD=
Konfigurasi di atas hanya contoh development lokal. Gunakan credential terpisah dan aman untuk production. Jangan commit file .env.
REQUIRED WORKFLOW
Ikuti tahapan berikut:

Phase 1 — Requirement & Planning
- Baca PRD sampai selesai.
- Identifikasi requirement yang belum diputuskan.
- Finalisasi business rules.
- Buat ERD dan data dictionary.
- Buat system architecture.
- Buat API specification.
- Jangan mulai implementasi fitur sebelum rancangan direview.
Phase 2 — Project Initialization
- Periksa environment dan versi runtime.
- Inisialisasi frontend React + TypeScript + Vite.
- Inisialisasi Laravel backend.
- Hubungkan MySQL development.
- Siapkan .env.example, .gitignore, README, dan dokumentasi.
- Pastikan frontend dan backend berjalan secara terpisah.
Phase 3 — Authentication & Authorization
- Implementasikan Sanctum SPA flow.
- Konfigurasikan CORS, stateful domains, dan CSRF.
- Implementasikan registration, login, logout, dan current user.
- Implementasikan role dan policy.
- Tambahkan tests.
Phase 4 — Venue & Court Management
- Implementasikan venue owner flow.
- Implementasikan admin verification.
- Implementasikan court management.
- Implementasikan image upload secara aman.
- Tambahkan ownership tests.
Phase 5 — Discovery & Availability
- Implementasikan listing, search, filtering, pagination.
- Implementasikan venue detail.
- Implementasikan operating hours dan blocked schedules.
- Implementasikan availability endpoint.
Phase 6 — Booking
- Implementasikan create booking.
- Implementasikan price calculation di backend.
- Implementasikan transaction dan concurrency protection.
- Implementasikan approval, rejection, cancellation, expiration.
- Tambahkan overlap dan concurrent booking tests.
Phase 7 — Dashboards
- Implementasikan dashboard customer, owner, admin.
- Pastikan data berasal dari API/database.
- Terapkan role-specific access.
Phase 8 — Testing & Security Audit
- Jalankan test suite.
- Audit authorization dan IDOR/BOLA.
- Audit validation, upload, session, CORS, CSRF, dan rate limiting.
- Perbaiki bug dan regression.
- Dokumentasikan hasil audit dan keterbatasannya.
Phase 9 — Deployment Preparation
- Siapkan production environment configuration.
- Pastikan HTTPS dan secure cookie.
- Siapkan database backup/migration strategy.
- Pastikan secrets tidak masuk repository.
- Dokumentasikan deployment dan rollback.
RESPONSE FORMAT FOR EVERY TASK
Saat mengerjakan tugas, gunakan format:
1. Understanding — Ringkas tujuan dan requirement yang dikerjakan.
2. Inspection — File, struktur, atau konfigurasi existing yang diperiksa.
3. Plan — Langkah implementasi dan file yang akan dibuat/diubah.
4. Implementation — Perubahan kode yang diperlukan.
5. Security & Edge Cases — Risiko dan validasi yang diperhatikan.
6. Testing — Test/command yang dijalankan dan hasil sebenarnya.
7. Summary — File yang berubah, hasil, dan pekerjaan berikutnya.
Untuk task kecil, format boleh dipersingkat tetapi jangan menghilangkan pemeriksaan keamanan dan testing yang relevan.
FIRST INSTRUCTION
Mulai dari Phase 1 — Requirement & Planning.

Jangan langsung membuat kode aplikasi.

Pertama:
1. Baca PRD ini secara keseluruhan.
2. Tampilkan ringkasan pemahaman SportsCourt.
3. Identifikasi keputusan yang belum final.
4. Susun ERD awal dan data dictionary.
5. Susun system architecture.
6. Susun API specification awal.
7. Tunjukkan risiko teknis, terutama authentication Sanctum dan concurrent booking.
8. Berikan roadmap implementasi untuk direview.
Tunggu persetujuan sebelum memulai implementasi.
17. Open Decisions — Wajib Difinalisasi Sebelum Coding
Hal-hal berikut belum dianggap keputusan final dan harus dikonfirmasi:
1. Booking approval: Apakah semua booking harus disetujui owner, atau ada opsi auto-confirm?
2. Slot duration: Apakah durasi booking bebas berdasarkan jam mulai/selesai, atau menggunakan slot tetap (misalnya 1 jam)?
3. Pending expiration: Berapa lama owner boleh memproses booking pending sebelum otomatis expired?
4. Cancellation policy: Sampai kapan customer boleh membatalkan booking yang sudah confirmed?
5. Owner onboarding: Apakah owner langsung dapat membuat venue setelah registrasi, atau akun owner juga perlu diverifikasi admin?
6. Court sport category: Apakah satu court hanya boleh memiliki satu kategori olahraga?
7. Reviews: Apakah review benar-benar ditunda dari MVP? Rekomendasi: tunda agar scope lebih fokus.
8. Repository: Rekomendasi monorepo satu repository dengan folder frontend/ dan backend/.
AI agent tidak boleh mengarang keputusan untuk hal-hal tersebut. Ajukan pertanyaan seperlunya dan catat keputusan yang disetujui.

End of SportsCourt PRD + Master Prompt.