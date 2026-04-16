import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isLoggedIn, isSchoolLoggedIn, saveSchoolToken, logout } from '../lib/auth';
import { request } from '../services/api';

export default function Login() {
  const [step, setStep] = useState(1); // 1: School, 2: Role, 3: Admin, 4: Teacher
  const [schoolUser, setSchoolUser] = useState('');
  const [schoolPass, setSchoolPass] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isSchoolLoggedIn()) setStep(2);
    if (isLoggedIn()) navigate('/dashboard');
  }, [navigate]);

  const handleSchoolLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await request('/auth/school-login', {
        method: 'POST',
        body: JSON.stringify({ username: schoolUser, password: schoolPass }),
      });
      saveSchoolToken(data.token);
      setStep(2);
      setError('');
    } catch (err) { setError(err.message); }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: adminEmail, password: adminPass }),
      });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) { setError(err.message); }
  };

  const loadTeachers = async () => {
    try {
      const data = await request('/auth/teachers');
      setTeachers(data);
      setStep(4);
    } catch (err) { setError(err.message); }
  };

  const handleTeacherLogin = async (id) => {
    try {
      const data = await request('/auth/login-teacher', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) { setError(err.message); }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form className="mt-6 space-y-4" onSubmit={handleSchoolLogin}>
            <h1 className="text-2xl font-bold">Login Sekolah</h1>
            <input type="text" placeholder="Username Sekolah" value={schoolUser} onChange={e=>setSchoolUser(e.target.value)} className="w-full p-3 border rounded-xl" required />
            <input type="password" placeholder="Password Sekolah" value={schoolPass} onChange={e=>setSchoolPass(e.target.value)} className="w-full p-3 border rounded-xl" required />
            <button className="w-full bg-slate-900 text-white p-3 rounded-xl">Lanjut</button>
          </form>
        );
      case 2:
        return (
          <div className="mt-6 space-y-4">
            <h1 className="text-2xl font-bold">Pilih Akses</h1>
            <button onClick={() => setStep(3)} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">ADMIN (Edit Data)</button>
            <button onClick={loadTeachers} className="w-full bg-green-600 text-white p-4 rounded-xl font-bold">GURU (Dashboard & Scan)</button>
            <button onClick={() => { logout(); setStep(1); }} className="w-full text-slate-500 text-sm">Keluar Akun Sekolah</button>
          </div>
        );
      case 3:
        return (
          <form className="mt-6 space-y-4" onSubmit={handleAdminLogin}>
            <h1 className="text-2xl font-bold text-blue-600">Login Admin</h1>
            <input type="email" placeholder="Email Admin" value={adminEmail} onChange={e=>setAdminEmail(e.target.value)} className="w-full p-3 border rounded-xl" required />
            <input type="password" placeholder="Password Admin" value={adminPass} onChange={e=>setAdminPass(e.target.value)} className="w-full p-3 border rounded-xl" required />
            <div className="flex gap-2">
              <button type="button" onClick={()=>setStep(2)} className="w-1/3 bg-slate-200 p-3 rounded-xl">Kembali</button>
              <button className="w-2/3 bg-blue-600 text-white p-3 rounded-xl">Masuk</button>
            </div>
          </form>
        );
      case 4:
        return (
          <div className="mt-6 space-y-4">
            <h1 className="text-2xl font-bold text-green-600">Pilih Nama Guru</h1>
            <div className="max-h-60 overflow-auto space-y-2">
              {teachers.map(t => (
                <button key={t.id} onClick={() => handleTeacherLogin(t.id)} className="w-full text-left p-3 border rounded-xl hover:bg-green-50">
                  {t.name}
                </button>
              ))}
            </div>
            <button onClick={()=>setStep(2)} className="w-full bg-slate-100 p-3 rounded-xl">Kembali</button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
        {renderStep()}
      </div>
    </div>
  );
}
