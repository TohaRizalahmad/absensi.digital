require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function reset() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  const hash = await bcrypt.hash('admin123', 10);
  await connection.query('UPDATE users SET password = ? WHERE email = ?', [hash, 'admin@absensi.local']);
  
  console.log('✅ Password admin berhasil di-reset menjadi: admin123');
  await connection.end();
}

reset().catch(console.error);
