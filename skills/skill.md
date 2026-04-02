---
name: Panduan Fitness Tracker Minimalis (Calorie & Workout)
description: Aturan wajib untuk pengembangan web aplikasi pelacak kebugaran menggunakan React, Express.js, dan Supabase dengan gaya desain Minimalis (Single Page Dashboard).
---

# Panduan Pembuatan Web Fitness & Calorie Tracker

Kapan pun pengguna (USER) meminta untuk membuat fitur, komponen UI, atau API backend untuk proyek Fitness Tracker ini, Anda sebagai Asisten AI **WAJIB** mengikuti langkah-langkah dan standar berikut tanpa terkecuali:

## 1. Struktur Folder Fullstack
Proyek ini memisahkan secara tegas antara Frontend dan Backend:
- **Frontend (`/client`):** Setiap komponen React baru harus memiliki foldernya sendiri dengan format *PascalCase* (contoh: `DashboardLayout`, `WorkoutForm`, `CalorieChart`).
  Di dalam folder komponen tersebut, selalu buat 2 file:
  - `index.jsx` (Logika fungsional React, State Management, dan JSX)
  - `styles.css` (Styling murni berbasis Vanilla CSS)
- **Backend (`/server`):** Wajib menggunakan Express.js dengan pemisahan folder `Routes`, `Controllers`, dan `Middlewares`.

## 2. Aturan UI/UX (Frontend React - Gaya Minimalis)
- **Konsep Inti Single Page:** Semua informasi (Kalori & Gym Harian/Mingguan/Bulanan) harus terangkum secara bersih di **satu halaman utama (Dashboard)**. Jangan membuat navigasi halaman yang me-reload browser. Gunakan tab atau scroll section yang halus.
- **DILARANG** menggunakan desain yang terlalu ramai (seperti *Glassmorphism* sebelumnya) atau *inline-style*.
- **Wajib Gaya Minimalis (Clean & Functional):**
  - **Warna:** Gunakan palet monokromatik (Hitam, Putih, Abu-abu) dengan satu warna aksen halus (misal: biru pastel atau hijau mint untuk tombol utama).
  - **Whitespace (Ruang Kosong):** Gunakan *padding* dan *margin* yang luas agar elemen bernapas (misal: `padding: 24px;`).
  - **Tipografi:** Gunakan font Sans-Serif modern (seperti Inter atau Roboto) dengan hierarki ketebalan yang jelas.
  - **Batas (Border):** Gunakan border sangat tipis (`border: 1px solid #E5E7EB;`) atau tanpa border dengan bayangan sangat lembut (`box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);`).
  - **Pojok (Border-radius):** Sedikit membulat (`border-radius: 8px;`), tidak berlebihan.

## 3. Aturan Backend (Express.js) & Alur Data
- **RESTful API & JSON:** Semua *endpoint* Express **WAJIB** mengembalikan format respons JSON seragam: `{ success: true, data: ..., message: ... }`.
- **Relasi Database (Supabase):** Pastikan Foreign Key terhubung dengan benar antara tabel `Users`, `Calories`, dan `Workouts`.
- **Manajemen Role:**
  - **Admin:** Memiliki *endpoint* khusus untuk me-ngesahkan (ACC) akun baru dan menghapus (*soft delete/hard delete*) pengguna tidak aktif.
  - **User:** Hanya bisa melihat dan memanipulasi data yang terikat pada `user_id` milik mereka sendiri.

## 4. Struktur Form & Input Utama
Setiap form harus memvalidasi data sebelum dikirim ke backend:
- **Form Kalori:**
  - Nama Makanan (Teks)
  - Jumlah Kalori (Angka)
  - Foto Makanan (File Upload - simpan di Supabase Storage)
  - Waktu Makan (Time picker/Timestamp)
- **Form Workout (Kondisional berdasarkan Tipe):**
  - Jika **Cardio**: Input Langkah (Angka), Kalori Terbakar (Angka), Waktu/Durasi (Menit), Jarak (Km).
  - Jika **Hypertrophy (Gym)**: Input Nama Gerakan (Teks/Dropdown), Set (Angka), Reps (Angka), Beban (Kg).