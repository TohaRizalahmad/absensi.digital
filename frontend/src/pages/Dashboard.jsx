import { useEffect, useState } from 'react';
import { request } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, classes: 0, subjects: 0, schedules: 0 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [students, classes, subjects, schedules] = await Promise.all([
          request('/students'),
          request('/classes'),
          request('/subjects'),
          request('/schedules'),
        ]);
        setStats({
          students: students.length,
          classes: classes.length,
          subjects: subjects.length,
          schedules: schedules.length,
        });
      } catch (error) {
        setMessage(error.message);
      }
    };
    loadCounts();
  }, []);

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard Absensi</h1>
        <p className="mt-2 text-sm text-slate-500">Ringkasan sistem dan aktivitas absensi kelas.</p>
      </div>

      {message && <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">{message}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Murid', value: stats.students },
          { label: 'Kelas', value: stats.classes },
          { label: 'Mapel', value: stats.subjects },
          { label: 'Jadwal', value: stats.schedules },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Panduan singkat</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li>1. Tambah data kelas, mapel, dan jadwal.</li>
          <li>2. Tambah murid dan generate QR permanen di backend.</li>
          <li>3. Mulai sesi absensi di menu Scan.</li>
          <li>4. Gunakan kamera HP untuk scan QR murid.</li>
          <li>5. Lihat rekap, export PDF/Excel, dan kelola data.</li>
        </ul>
      </div>
    </main>
  );
}
