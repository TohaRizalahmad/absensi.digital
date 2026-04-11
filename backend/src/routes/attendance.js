const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.post('/scan', async (req, res) => {
  const { qrCode, sessionId } = req.body;
  try {
    const [students] = await pool.query('SELECT * FROM students WHERE qr_code = ?', [qrCode]);
    const student = students[0];
    if (!student) return res.status(404).json({ error: 'QR Code tidak terdaftar' });

    const [sessionRows] = await pool.query('SELECT * FROM sessions WHERE id = ? AND status = ?', [sessionId, 'active']);
    if (!sessionRows.length) return res.status(400).json({ error: 'Sesi tidak aktif atau tidak ditemukan' });

    const [existing] = await pool.query(
      'SELECT * FROM attendance WHERE session_id = ? AND student_id = ?', [sessionId, student.id]
    );
    if (existing.length) return res.status(409).json({ error: 'Siswa sudah absen di sesi ini' });

    const [result] = await pool.query(
      'INSERT INTO attendance (session_id, student_id, teacher_id, status) VALUES (?, ?, ?, ?)',
      [sessionId, student.id, req.user.id, 'hadir']
    );

    res.json({ id: result.insertId, student: { id: student.id, name: student.name }, status: 'hadir' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  const { date, class_id, subject_id, teacher_id } = req.query;
  const conditions = [];
  const params = [];

  let sql = `SELECT a.*, s.name AS student_name, c.name AS class_name, sb.name AS subject_name, u.name AS teacher_name
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
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  try {
    await pool.query('UPDATE attendance SET status = ?, note = ? WHERE id = ?', [status, note, id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
