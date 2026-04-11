import { useEffect, useState } from 'react';
import { request } from '../services/api';

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [filters, setFilters] = useState({ date: '', class_id: '', subject_id: '', teacher_id: '' });
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState('');

  const loadMeta = async () => {
    const [classData, subjectData] = await Promise.all([request('/classes'), request('/subjects')]);
    setClasses(classData);
    setSubjects(subjectData);
  };

  const loadAttendance = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && params.append(key, value));
    const data = await request(`/attendance?${params.toString()}`);
    setAttendance(data);
  };

  useEffect(() => {
    loadMeta().catch((error) => setMessage(error.message));
    loadAttendance().catch((error) => setMessage(error.message));
  }, []);

  const handleFilter = async (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const handleSearch = async () => {
    try {
      await loadAttendance();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const exportExcel = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && params.append(key, value));
    window.open(`http://localhost:4000/api/export/attendance-excel?${params.toString()}`, '_blank');
  };

  const exportPdf = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && params.append(key, value));
    window.open(`http://localhost:4000/api/export/attendance-pdf?${params.toString()}`, '_blank');
  };

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Rekap Absensi</h1>
        <p className="mt-2 text-sm text-slate-500">Lihat dan export hasil absensi per tanggal, kelas, atau mapel.</p>
      </div>

      {message && <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">{message}</div>}

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-4">
          <label className="block text-sm font-medium text-slate-700">
            Tanggal
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilter}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Kelas
            <select
              name="class_id"
              value={filters.class_id}
              onChange={handleFilter}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            >
              <option value="">Semua</option>
              {classes.map((kelas) => (
                <option key={kelas.id} value={kelas.id}>{kelas.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Mapel
            <select
              name="subject_id"
              value={filters.subject_id}
              onChange={handleFilter}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            >
              <option value="">Semua</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-3">
            <button onClick={handleSearch} className="rounded-2xl bg-slate-900 px-4 py-3 text-white hover:bg-slate-700">
              Cari
            </button>
            <button onClick={exportExcel} className="rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 hover:bg-slate-100">
              Excel
            </button>
            <button onClick={exportPdf} className="rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 hover:bg-slate-100">
              PDF
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
          <thead>
            <tr>
              <th className="px-3 py-3 font-medium">Tanggal</th>
              <th className="px-3 py-3 font-medium">Siswa</th>
              <th className="px-3 py-3 font-medium">Kelas</th>
              <th className="px-3 py-3 font-medium">Mapel</th>
              <th className="px-3 py-3 font-medium">Guru</th>
              <th className="px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {attendance.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-3">{item.attendance_date}</td>
                <td className="px-3 py-3">{item.student_name}</td>
                <td className="px-3 py-3">{item.class_name}</td>
                <td className="px-3 py-3">{item.subject_name}</td>
                <td className="px-3 py-3">{item.teacher_name}</td>
                <td className="px-3 py-3">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
