# Desain SportsCourt

Jelajah menampilkan pencarian berfilter dan kartu venue. Halaman detail menampilkan lapangan, jam operasional, dan status slot. Dashboard menggunakan ringkasan angka dan badge untuk membantu pengguna melihat status booking.

## Warna

- Krem `#faf4eb` untuk latar halaman dan `#fffdf9` untuk kartu.
- Hijau tua `#26543d` untuk aksi utama, tautan aktif, dan angka ringkasan.
- Hijau, kuning, dan merah muda untuk membedakan status yang tersedia, menunggu, dan bermasalah. Teks status tetap tersedia di setiap badge.

## Tipografi dan komponen

Fraunces dipakai untuk judul dan DM Sans untuk teks serta kontrol. Font disimpan bersama lisensinya di `frontend/src/assets/fonts`. Warna dan radius ditetapkan di `frontend/src/index.css`. Tombol, badge, dan field ada di `frontend/src/components/ui`.

Foto yang diunggah pemilik ditampilkan di kartu dan detail venue. Kartu futsal tanpa foto dapat menampilkan gambar berlabel Ilustrasi.
