require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const classRoutes = require('./routes/classes');
const subjectRoutes = require('./routes/subjects');
const scheduleRoutes = require('./routes/schedules');
const sessionRoutes = require('./routes/sessions');
const attendanceRoutes = require('./routes/attendance');
const exportRoutes = require('./routes/export');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/export', exportRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Absensi Digital API aktif' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend berjalan di http://localhost:${PORT}`);
});
