# Desain Sistem Absensi Digital

## 1. Alur Sistem Lengkap

1. Admin/guru mendaftar dan login ke aplikasi.
2. Admin mengelola data murid, kelas, mata pelajaran, dan jadwal.
3. Setiap murid mendapatkan QR Code tetap, disimpan sebagai `qr_code` di database.
4. Guru membuka halaman "Mulai Sesi" di HP.
5. Guru memilih kelas dan mata pelajaran, lalu memulai sesi absensi baru.
6. Saat sesi berjalan, guru melakukan scan QR murid menggunakan kamera HP.
7. Aplikasi memvalidasi:
   - QR cocok dengan murid terdaftar
   - sesi aktif
   - murid belum absen di sesi ini
8. Sistem menyimpan data kehadiran dengan status default `hadir` atau `terlambat`.
9. Guru dapat mengubah status absen menjadi `izin` atau `alpha` jika diperlukan.
10. Admin dapat melihat rekap absensi, export PDF/Excel, dan mencetak ulang QR.

## 2. Struktur Database

Tabel utama:
- `users` (guru/admin)
- `students` (murid)
- `classes` (kelas)
- `subjects` (mata pelajaran)
- `schedules` (jadwal pelajaran)
- `sessions` (sesi absensi)
- `attendance` (rekap kehadiran)
- `qr_codes` (opsional, bisa satu kolom di `students`)

### Relasi utama
- `students.class_id -> classes.id`
- `schedules.class_id -> classes.id`
- `schedules.subject_id -> subjects.id`
- `sessions.schedule_id -> schedules.id`
- `attendance.session_id -> sessions.id`
- `attendance.student_id -> students.id`
- `attendance.teacher_id -> users.id`

## 3. API Endpoint Utama

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register` (opsional)

### Data Master
- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`
- `GET /api/classes`
- `GET /api/subjects`
- `GET /api/schedules`

### QR Code
- `GET /api/students/:id/qr`
- `GET /api/students/export-pdf`

### Sesi Absensi
- `POST /api/sessions` (mulai sesi)
- `GET /api/sessions/active`
- `PUT /api/sessions/:id/close`

### Absensi
- `POST /api/attendance/scan`
- `GET /api/attendance?date=&class_id=&subject_id=&teacher_id=`
- `PUT /api/attendance/:id`
- `DELETE /api/attendance/:id`

## 4. Contoh Implementasi Fitur Scan QR Menggunakan Kamera

Frontend React menggunakan library `html5-qrcode`:

```jsx
import { Html5QrcodeScanner } from "html5-qrcode";

export function QRScanner({ onScanSuccess }) {
  useEffect(() => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    html5QrcodeScanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
      },
      (error) => {
        console.warn("QR scan error", error);
      }
    );

    return () => {
      html5QrcodeScanner.clear().catch((error) => console.error(error));
    };
  }, [onScanSuccess]);

  return <div id="qr-reader" className="w-full h-full" />;
}
```

Ketika berhasil scan, kirim data QR ke backend:

```js
fetch("/api/attendance/scan", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ qrCode: decodedText, sessionId }),
});
```

Backend akan memvalidasi:
- QR kode valid
- sesi masih aktif
- murid belum absen di sesi ini
- kemudian menyimpan status absensi.

## 5. Catatan Implementasi

- Gunakan JWT untuk autentikasi token di mobile dan desktop.
- Gunakan Tailwind untuk layout responsif.
- Endpoint export PDF/Excel bisa dibuat dengan `pdfkit`, `jspdf`, `exceljs`.
- Untuk cetak QR, generate QR permanen kemudian export PDF.
- Gunakan PWA agar aplikasi mobile dapat diinstall dan diakses cepat.
