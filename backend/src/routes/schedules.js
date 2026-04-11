const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sch.*, c.name AS class_name, sb.name AS subject_name, u.name AS teacher_name
       FROM schedules sch
       JOIN classes c ON sch.class_id = c.id
       JOIN subjects sb ON sch.subject_id = sb.id
       JOIN users u ON sch.teacher_id = u.id
       ORDER BY FIELD(sch.day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), sch.start_time`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { class_id, subject_id, teacher_id, day, start_time, end_time } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO schedules (class_id, subject_id, teacher_id, day, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
      [class_id, subject_id, teacher_id, day, start_time, end_time]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { class_id, subject_id, teacher_id, day, start_time, end_time } = req.body;
  try {
    await pool.query(
      'UPDATE schedules SET class_id = ?, subject_id = ?, teacher_id = ?, day = ?, start_time = ?, end_time = ? WHERE id = ?',
      [class_id, subject_id, teacher_id, day, start_time, end_time, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM schedules WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
