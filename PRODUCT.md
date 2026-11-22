# Product

## Platform

web

## Users

Pelanggan mencari lapangan yang sudah disetujui dan mengajukan jam. Pemilik venue mengelola lapangan dan menyetujui atau menolak booking. Admin memverifikasi venue, mengelola pengguna dan olahraga, dan memantau booking tanpa mengubah statusnya.

Rujukan kebutuhan produk ada di [PRD](docs/prd.md) dan [catatan keputusan](docs/DECISIONS.md).

## Product Purpose

SportsCourt adalah marketplace pemesanan lapangan olahraga untuk banyak venue. Keberhasilan berarti pelanggan bisa melihat slot kosong dan mengajukan booking, pemilik bisa memutuskan pengajuan, dan admin bisa memverifikasi venue.

## Positioning

Harga, status, dan kepemilikan dihitung di server. Dua orang tidak bisa mengambil slot yang sama. Venue yang belum disetujui tidak tampil di pencarian.

## Operating Context

Dipakai di browser, bahasa Indonesia, mata uang rupiah, zona waktu venue di Indonesia. Pengembangan lokal memakai localhost:5173 dan localhost:8000.

## Capabilities and Constraints

Halaman yang sudah ada: beranda, cari venue, detail venue dan slot, formulir booking, booking saya, dashboard pelanggan, pemilik, dan admin, plus pengelolaan venue, pengguna, dan olahraga.

Frontend memakai Tailwind CSS v4 dan komponen React di folder `frontend/src/components`. API mengatur peran, jam yang bisa dipesan, dan perubahan status booking.

## Brand Commitments

Nama produk tetap SportsCourt. Suara tetap bahasa Indonesia yang lugas. Tidak ada klaim harga atau fasilitas yang tidak datang dari data API.

## Evidence on Hand

Pemilik bisa mengunggah foto venue. Kartu futsal tanpa foto dapat menampilkan gambar yang diberi label Ilustrasi. Database demo tersedia untuk pengembangan lokal.

## Product Principles

- Angka dan status datang dari API, bukan dari teks yang diketik di halaman.
- Tamu, pelanggan, pemilik, dan admin tetap melihat hanya apa yang peran mereka boleh lihat.
- Setiap aksi utama punya nama yang jelas, dan keadaan kosong, memuat, serta gagal tetap ada.
- Kontras, fokus keyboard, dan label form tidak dikorbankan untuk tampilan.

## Accessibility & Inclusion

Kontras teks memadai, fokus keyboard terlihat, dan kontrol form punya label. Tata letak harus bisa dipakai di layar ponsel dan desktop.
