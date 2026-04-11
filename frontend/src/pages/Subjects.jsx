import { useEffect, useState } from 'react';
import { request } from '../services/api';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const data = await request('/subjects');
    setSubjects(data);
  };

  useEffect(() => {
    loadData().catch((error) => setMessage(error.message));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await request('/subjects', {
        method: 'POST',
        body: JSON.stringify({ name, code }),
      });
      setName('');
      setCode('');
      await loadData();
      setMessage('Mapel ditambahkan.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await request(`/subjects/${id}`, { method: 'DELETE' });
      await loadData();
      setMessage('Mapel dihapus.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Manajemen Mapel</h1>
        <p className="mt-2 text-sm text-slate-500">Tambah mata pelajaran yang digunakan dalam jadwal pelajaran.</p>
      </div>

      {message && <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">{message}</div>}

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Tambah Mapel</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              Nama Mapel
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Kode Mapel
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
              />
            </label>
            <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-700">
              Simpan Mapel
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Daftar Mapel</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
              <thead>
                <tr>
                  <th className="px-3 py-3 font-medium">Nama</th>
                  <th className="px-3 py-3 font-medium">Kode</th>
                  <th className="px-3 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td className="px-3 py-3">{subject.name}</td>
                    <td className="px-3 py-3">{subject.code}</td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleDelete(subject.id)}
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
