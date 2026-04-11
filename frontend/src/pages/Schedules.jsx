import { useEffect, useState } from 'react';
import { request } from '../services/api';

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ class_id: '', subject_id: '', teacher_id: '', day: 'Monday', start_time: '', end_time: '' });
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const [scheduleData, classData, subjectData] = await Promise.all([request('/schedules'), request('/classes'), request('/subjects')]);
    setSchedules(scheduleData);
    setClasses(classData);
    setSubjects(subjectData);
    setTeachers([{ id: 1, name: 'Guru Utama' }]);
  };

  useEffect(() => {
    loadData().catch((error) => setMessage(error.message));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await request('/schedules', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ class_id: '', subject_id: '', teacher_id: '', day: 'Monday', start_time: '', end_time: '' });
      await loadData();
      setMessage('Jadwal disimpan.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await request(`/schedules/${id}`, { method: 'DELETE' });
      await loadData();
      setMessage('Jadwal dihapus.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Manajemen Jadwal</h1>
        <p className="mt-2 text-sm text-slate-500">Atur jadwal pelajaran per kelas dan mapel.</p>
      </div>

      {message && <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">{message}</div>}

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Tambah Jadwal</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              Kelas
              <select
                value={form.class_id}
                onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
              >
                <option value="">Pilih kelas</option>
                {classes.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>{kelas.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Mapel
              <select
                value={form.subject_id}
                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
              >
                <option value="">Pilih mapel</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Guru
              <select
                value={form.teacher_id}
                onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
              >
                <option value="">Pilih guru</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Hari
              <select
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Mulai
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Selesai
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                />
              </label>
            </div>
            <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-700">
              Simpan Jadwal
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Daftar Jadwal</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
              <thead>
                <tr>
                  <th className="px-3 py-3 font-medium">Hari</th>
                  <th className="px-3 py-3 font-medium">Kelas</th>
                  <th className="px-3 py-3 font-medium">Mapel</th>
                  <th className="px-3 py-3 font-medium">Jam</th>
                  <th className="px-3 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="px-3 py-3">{schedule.day}</td>
                    <td className="px-3 py-3">{schedule.class_name}</td>
                    <td className="px-3 py-3">{schedule.subject_name}</td>
                    <td className="px-3 py-3">{schedule.start_time} - {schedule.end_time}</td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="rounded-2xl bg-rose-500 px-3 py-2 text-white hover:bg-rose-600"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
