# 🌙 Laporan Hafalan Ar

Aplikasi **Laporan Hafalan Ar** adalah sistem berbasis web yang dibuat menggunakan **Next.js 14 (App Router)**.  
Aplikasi ini digunakan untuk **mencatat, memantau, dan melaporkan progres hafalan Al-Qur’an santri**, dengan fitur login berbasis *passcode* dan dashboard sesuai peran (guru, siswa, orang tua, admin).

---

## 🚀 Fitur Utama

- 🔐 **Login menggunakan Passcode**
  - Setiap pengguna memiliki kode unik untuk akses.
  - Validasi menggunakan JWT yang aman (HttpOnly cookie).

- 🧭 **Dashboard Berdasarkan Role**
  - **Admin** – kelola data user & hafalan.
  - **Guru** – catat dan nilai hafalan santri.
  - **Orang Tua** – pantau progres anak.
  - **Siswa** – lihat hasil hafalan pribadi.

- 🕐 **Sesi Otomatis Kadaluarsa**
  - Cookie dan token otomatis expired setelah 10 menit tidak aktif (auto logout).

- 🕌 **Jadwal Hafalan**
  - Santri dapat melihat jadwal hafalan mingguan yang sudah diatur.

- 📱 **Notifikasi Mobile (Opsional)**
  - Dapat terhubung ke WhatsApp atau Telegram untuk mengirim pengingat jadwal hafalan.

---

## 🧩 Teknologi yang Digunakan

| Kebutuhan | Teknologi |
|------------|------------|
| Frontend Framework | [Next.js 15 (App Router)](https://nextjs.org) |
| UI & Animasi | [Ant Design](https://ant.design) + [Framer Motion](https://www.framer.com/motion/) |
| Database | [Prisma ORM](https://www.prisma.io) + PostgreSQL |
| Autentikasi | [JOSE (JWT)](https://github.com/panva/jose) – bekerja di Edge Runtime |
| Styling | CSS + Tailwind (opsional) |
| Deployment | [Vercel](https://vercel.com) atau server Node.js |

---

## 🧠 Struktur Role Aplikasi

| Role | Akses |
|------|--------|
| **Super Admin / Admin** | Kelola semua pengguna, jadwal, dan data hafalan |
| **Guru** | Input hasil hafalan siswa |
| **Siswa** | Lihat hasil hafalan dan target berikutnya |
| **Orang Tua** | Memantau progres hafalan anak |

---

## 🛠️ Cara Menjalankan Aplikasi

1. **Clone repository**
   ```bash
   git clone https://github.com/username/laporan_hafalan_ar.git
   cd laporan_hafalan_ar
