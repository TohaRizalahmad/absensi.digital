import { useEffect, useState } from 'react';
import { request } from '../services/api';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const data = await request('/classes');
    setClasses(data);
  };

  useEffect(() => {
    loadData().catch((error) => setMessage(error.message));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await request('/classes', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
      setName('');
      setDescription('');
      await loadData();
      setMessage('Kelas ditambahkan.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await request(`/classes/${id}`, { method: 'DELETE' });
      await loadData();
      setMessage('Kelas dihapus.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Manajemen Kelas</h1>
        <p className="mt-2 text-sm text-slate-500">Tambah dan atur kelas yang digunakan di jadwal.</p>
      </div>

      {message && <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">{message}</div>}

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Tambah Kelas</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              Nama Kelas
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Deskripsi
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
              />
            </label>
            <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-700">
              Simpan Kelas
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Daftar Kelas</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
              <thead>
                <tr>
                  <th className="px-3 py-3 font-medium">Nama</th>
                  <th className="px-3 py-3 font-medium">Deskripsi</th>
                  <th className="px-3 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {classes.map((kelas) => (
                  <tr key={kelas.id}>
                    <td className="px-3 py-3">{kelas.name}</td>
                    <td className="px-3 py-3">{kelas.description}</td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleDelete(kelas.id)}
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
