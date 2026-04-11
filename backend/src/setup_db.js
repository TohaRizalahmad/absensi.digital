require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setup() {
  console.log('--- Inisialisasi Database ---');
  console.log('Mencoba menghubungkan ke MySQL...');
  
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
  };

  try {
    const connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Terhubung ke MySQL.');

    const schemaPath = path.join(__dirname, '../sql/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual queries
    // Simple split by semicolon if no complex triggers/procedures
    const queries = schema.split(/;\s*$/m).filter(q => q.trim() !== '');

    console.log('Menjalankan skema database...');
    for (let query of queries) {
      if (query.trim()) {
        await connection.query(query);
      }
    }

    console.log('✅ Database `absensi_db` dan tabel berhasil dibuat.');
    await connection.end();
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ Gagal: Akses ditolak. Sepertinya password MySQL salah atau user root memerlukan password.');
      console.error('Silakan perbarui DB_PASS di file backend/.env');
    } else {
      console.error('❌ Gagal menginisialisasi database:', error.message);
    }
    process.exit(1);
  }
}

setup();
