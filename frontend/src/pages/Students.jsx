import { useEffect, useState } from 'react';
import { request } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ nis: '', name: '', class_id: '', qr_code: '' });
  const [message, setMessage] = useState('');
  const [showQR, setShowQR] = useState(null); // State to show QR in modal

  const loadData = async () => {
    const [studentData, classData] = await Promise.all([request('/students'), request('/classes')]);
    setStudents(studentData);
    setClasses(classData);
  };

  useEffect(() => {
    loadData().catch((err) => setMessage(err.message));
  }, []);

  // Update QR automatically if NIS is filled and QR is still empty
  useEffect(() => {
    if (form.nis && !form.qr_code) {
      setForm((prev) => ({ ...prev, qr_code: prev.nis }));
    }
  }, [form.nis]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await request('/students', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ nis: '', name: '', class_id: '', qr_code: '' });
      await loadData();
      setMessage('Data murid berhasil ditambahkan.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data murid ini?')) return;
    try {
      await request(`/students/${id}`, { method: 'DELETE' });
      await loadData();
      setMessage('Data murid dihapus.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Manajemen Murid</h1>
        <p className="mt-2 text-sm text-slate-500">Tambah murid dan kelola QR Code otomatis.</p>
      </div>

      {message && <div className="rounded-3xl bg-blue-50 p-4 text-sm text-blue-700">{message}</div>}

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm h-fit">
          <h2 className="text-xl font-semibold text-slate-900">Tambah Murid</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              NIS (Nomor Induk Siswa)
              <input
                value={form.nis}
                onChange={(e) => setForm({ ...form, nis: e.target.value })}
                required
                placeholder="Contoh: 2024001"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Nama Lengkap
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Kelas
              <select
                value={form.class_id}
                onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
              >
                <option value="">Pilih kelas</option>
                {classes.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              QR Code (Otomatis)
              <input
                value={form.qr_code}
                onChange={(e) => setForm({ ...form, qr_code: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-200 px-4 py-3"
              />
            </label>
            <button className="w-full rounded-2xl bg-slate-900 px-4 py-4 text-white font-semibold transition hover:bg-slate-800">
              Simpan Murid
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm overflow-hidden">
          <h2 className="text-xl font-semibold text-slate-900">Daftar Murid</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
              <thead>
                <tr>
                  <th className="px-3 py-3 font-semibold">NIS</th>
                  <th className="px-3 py-3 font-semibold">Nama</th>
                  <th className="px-3 py-3 font-semibold">Kelas</th>
                  <th className="px-3 py-3 font-semibold text-center">QR Code</th>
                  <th className="px-3 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="px-3 py-4">{student.nis}</td>
                    <td className="px-3 py-4 font-medium">{student.name}</td>
                    <td className="px-3 py-4">{student.class_name}</td>
                    <td className="px-3 py-4 text-center">
                      <button 
                        onClick={() => setShowQR(student)}
                        className="mx-auto block p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
                      >
                        <QRCodeSVG value={student.qr_code} size={32} />
                      </button>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="rounded-xl bg-rose-50 px-4 py-2 text-rose-600 font-medium hover:bg-rose-100 transition"
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

      {/* Modal QR Preview */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <h3 className="text-2xl font-bold text-center text-slate-900">{showQR.name}</h3>
            <p className="text-center text-slate-500 mb-6">NIS: {showQR.nis}</p>
            <div className="flex justify-center bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
              <QRCodeSVG value={showQR.qr_code} size={200} />
            </div>
            <button 
              onClick={() => setShowQR(null)}
              className="mt-8 w-full rounded-2xl bg-slate-900 px-4 py-4 text-white font-semibold"
            >
              Tutup
            </button>
            <p className="mt-4 text-[10px] text-center text-slate-400">Gunakan QR ini untuk scan kehadiran</p>
          </div>
        </div>
      )}
    </main>
  );
}
