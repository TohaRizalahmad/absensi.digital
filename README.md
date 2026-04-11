# Absensi Digital

Sistem absensi digital berbasis web untuk mobile (guru) dan desktop (admin/dashboard).

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MySQL
- QR Scanner: browser camera via `html5-qrcode`

## Fitur utama
- Login guru/admin
- Manajemen data murid, kelas, mapel, jadwal
- Generate QR Code unik per murid
- Guru memulai sesi absensi
- Scan QR real-time di HP
- Validasi absensi satu kali per sesi
- Status: hadir, terlambat, izin, alpha
- Dashboard statistik
- Rekap absensi dengan filter
- Export PDF / Excel
- Edit / hapus data absensi

## Struktur proyek
- backend/
  - src/
    - index.js
    - db.js
    - routes/
      - auth.js
      - students.js
      - classes.js
      - subjects.js
      - schedules.js
      - sessions.js
      - attendance.js
      - export.js
    - middleware/
      - authMiddleware.js
  - sql/
    - schema.sql
- frontend/
  - src/
    - App.jsx
    - main.jsx
    - components/
      - QRScanner.jsx
    - index.css
  - public/
    - manifest.webmanifest

## Setup singkat
1. Siapkan MySQL dan buat database `absensi_db`
2. Jalankan `backend/sql/schema.sql`
3. Install backend:
   - `cd backend`
   - `npm install`
4. Install frontend:
   - `cd frontend`
   - `npm install`
5. Jalankan backend `npm run dev`
6. Jalankan frontend `npm run dev`
## Endpoint penting
- `POST /api/auth/login`
- `GET /api/students`, `POST /api/students`, `GET /api/students/:id`, `PUT /api/students/:id`, `DELETE /api/students/:id`, `GET /api/students/:id/qr`
- `GET /api/classes`, `POST /api/classes`, `PUT /api/classes/:id`, `DELETE /api/classes/:id`
- `GET /api/subjects`, `POST /api/subjects`, `PUT /api/subjects/:id`, `DELETE /api/subjects/:id`
- `GET /api/schedules`, `POST /api/schedules`, `PUT /api/schedules/:id`, `DELETE /api/schedules/:id`
- `POST /api/sessions`, `GET /api/sessions/active`, `PUT /api/sessions/:id/close`
- `POST /api/attendance/scan`
- `GET /api/attendance` dengan filter `date`, `class_id`, `subject_id`, `teacher_id`
- `PUT /api/attendance/:id` untuk edit status/note
- `DELETE /api/attendance/:id` untuk hapus data absensi
- `GET /api/export/students-qr-pdf`, `GET /api/export/attendance-excel`, `GET /api/export/attendance-pdf`
