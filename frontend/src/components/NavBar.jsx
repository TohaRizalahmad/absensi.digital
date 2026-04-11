import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../lib/auth';

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="text-xl font-semibold text-slate-900">
          Absensi Digital
        </Link>

        <nav className="flex flex-wrap gap-2 text-sm text-slate-600">
          <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" to="/dashboard">
            Dashboard
          </Link>
          <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" to="/scan">
            Scan
          </Link>
          <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" to="/students">
            Murid
          </Link>
          <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" to="/classes">
            Kelas
          </Link>
          <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" to="/subjects">
            Mapel
          </Link>
          <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" to="/schedules">
            Jadwal
          </Link>
          <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" to="/attendance">
            Rekap
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-full bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
