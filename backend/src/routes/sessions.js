const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.post('/', async (req, res) => {
  const { schedule_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO sessions (schedule_id, teacher_id, status) VALUES (?, ?, ?)',
      [schedule_id, req.user.id, 'active']
    );
    res.json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/active', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT s.*, sc.class_id, sc.subject_id FROM sessions s JOIN schedules sc ON s.schedule_id = sc.id WHERE s.teacher_id = ? AND s.status = ?',
      [req.user.id, 'active']
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/close', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE sessions SET status = ?, ended_at = NOW() WHERE id = ?', ['closed', id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
