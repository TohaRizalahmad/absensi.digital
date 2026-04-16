const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/school-login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.SCHOOL_USER && password === process.env.SCHOOL_PASS) {
    const token = jwt.sign({ type: 'school' }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '12h' });
    return res.json({ token, message: 'School authenticated' });
  }
  res.status(401).json({ error: 'Kredensial sekolah salah' });
});

router.get('/teachers', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name FROM users WHERE role = 'teacher' ORDER BY name");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login-teacher', async (req, res) => {
  const { id } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ? AND role = "teacher"', [id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'Guru tidak ditemukan' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'secret-key', {
      expiresIn: '12h',
    });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Email atau password salah' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Email atau password salah' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'secret-key', {
      expiresIn: '8h',
    });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'teacher' } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashed, role]);
    res.json({ id: result.insertId, name, email, role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
