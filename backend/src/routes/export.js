const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const ExcelJS = require('exceljs');

const router = express.Router();
router.use(authMiddleware);

router.get('/students-qr-pdf', async (req, res) => {
  const { class_id } = req.query;
  const conditions = [];
  const params = [];
  let sql = 'SELECT s.*, c.name AS class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id';

  if (class_id) {
    conditions.push('s.class_id = ?');
    params.push(class_id);
  }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY c.name, s.name';

  try {
    const [students] = await pool.query(sql, params);
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=students-qr.pdf');

    doc.pipe(res);
    doc.fontSize(18).text('Daftar QR Code Siswa', { align: 'center' });
    doc.moveDown();

    let x = 40;
    let y = 100;
    const cardWidth = 260;
    const cardHeight = 170;

    for (let i = 0; i < students.length; i += 1) {
      const student = students[i];
      if (x + cardWidth > 560) {
        x = 40;
        y += cardHeight + 20;
      }
      if (y + cardHeight > 780) {
        doc.addPage();
        x = 40;
        y = 40;
      }

      doc.roundedRect(x, y, cardWidth, cardHeight, 10).stroke();
      doc.fontSize(12).text(`Nama: ${student.name}`, x + 10, y + 10);
      doc.fontSize(11).text(`NIS: ${student.nis}`, x + 10, y + 28);
      doc.fontSize(11).text(`Kelas: ${student.class_name ?? '-'} `, x + 10, y + 46);

      const qrData = await QRCode.toDataURL(student.qr_code || `student-${student.id}`, { width: 120 });
      const image = qrData.split(',')[1];
      doc.image(Buffer.from(image, 'base64'), x + cardWidth - 130, y + 20, { fit: [110, 110] });

      x += cardWidth + 20;
    }

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/attendance-excel', async (req, res) => {
  const { date, class_id, subject_id, teacher_id } = req.query;
  const conditions = [];
  const params = [];
  let sql = `SELECT a.*, s.name AS student_name, c.name AS class_name, sb.name AS subject_name, u.name AS teacher_name, DATE(a.scanned_at) AS attendance_date
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN sessions se ON a.session_id = se.id
    JOIN schedules sch ON se.schedule_id = sch.id
    JOIN classes c ON sch.class_id = c.id
    JOIN subjects sb ON sch.subject_id = sb.id
    JOIN users u ON a.teacher_id = u.id`;

  if (date) {
    conditions.push('DATE(a.scanned_at) = ?');
    params.push(date);
  }
  if (class_id) {
    conditions.push('c.id = ?');
    params.push(class_id);
  }
  if (subject_id) {
    conditions.push('sb.id = ?');
    params.push(subject_id);
  }
  if (teacher_id) {
    conditions.push('u.id = ?');
    params.push(teacher_id);
  }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');

  try {
    const [rows] = await pool.query(sql, params);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance');

    sheet.columns = [
      { header: 'Tanggal', key: 'attendance_date', width: 14 },
      { header: 'Nama Siswa', key: 'student_name', width: 24 },
      { header: 'Kelas', key: 'class_name', width: 14 },
      { header: 'Mapel', key: 'subject_name', width: 18 },
      { header: 'Guru', key: 'teacher_name', width: 20 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Waktu Scan', key: 'scanned_at', width: 22 },
    ];

    rows.forEach((row) => {
      sheet.addRow({
        attendance_date: row.attendance_date,
        student_name: row.student_name,
        class_name: row.class_name,
        subject_name: row.subject_name,
        teacher_name: row.teacher_name,
        status: row.status,
        scanned_at: row.scanned_at,
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/attendance-pdf', async (req, res) => {
  const { date, class_id, subject_id, teacher_id } = req.query;
  const conditions = [];
  const params = [];
  let sql = `SELECT a.*, s.name AS student_name, c.name AS class_name, sb.name AS subject_name, u.name AS teacher_name, DATE(a.scanned_at) AS attendance_date
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN sessions se ON a.session_id = se.id
    JOIN schedules sch ON se.schedule_id = sch.id
    JOIN classes c ON sch.class_id = c.id
    JOIN subjects sb ON sch.subject_id = sb.id
    JOIN users u ON a.teacher_id = u.id`;

  if (date) {
    conditions.push('DATE(a.scanned_at) = ?');
    params.push(date);
  }
  if (class_id) {
    conditions.push('c.id = ?');
    params.push(class_id);
  }
  if (subject_id) {
    conditions.push('sb.id = ?');
    params.push(subject_id);
  }
  if (teacher_id) {
    conditions.push('u.id = ?');
    params.push(teacher_id);
  }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');

  try {
    const [rows] = await pool.query(sql, params);
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.pdf');

    doc.pipe(res);
    doc.fontSize(18).text('Laporan Absensi', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    rows.forEach((row, index) => {
      doc.text(`${index + 1}. ${row.attendance_date} | ${row.student_name} | ${row.class_name} | ${row.subject_name} | ${row.status} | ${row.teacher_name}`, {
        continued: false,
      });
      if (row.note) doc.text(`    Catatan: ${row.note}`);
      doc.moveDown(0.2);
      if (doc.y > 720) doc.addPage();
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
