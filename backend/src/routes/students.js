const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, c.name AS class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id ORDER BY s.name`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT s.*, c.name AS class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE s.id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Data siswa tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { nis, name, class_id, qr_code } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO students (nis, name, class_id, qr_code) VALUES (?, ?, ?, ?)',
      [nis, name, class_id, qr_code]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nis, name, class_id, qr_code } = req.body;
  try {
    await pool.query(
      'UPDATE students SET nis = ?, name = ?, class_id = ?, qr_code = ? WHERE id = ?',
      [nis, name, class_id, qr_code, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/qr', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT qr_code FROM students WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Data siswa tidak ditemukan' });
    res.json({ qr_code: rows[0].qr_code });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
