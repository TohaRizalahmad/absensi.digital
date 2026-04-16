import { Link, useNavigate } from 'react-router-dom';
import { logout, getUser } from '../lib/auth';

export default function NavBar() {
  const navigate = useNavigate();
  const user = getUser();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-xl font-semibold text-slate-900">
            Absensi Digital
          </Link>
          <span className="hidden sm:inline text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase font-bold">
            {user?.role}
          </span>
        </div>

        <nav className="flex flex-wrap gap-2 text-sm text-slate-600">
          <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" to="/dashboard">
            Dashboard
          </Link>
          <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" to="/scan">
            Scan
          </Link>
          
          {isAdmin && (
            <>
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
            </>
          )}

          <div className="flex items-center gap-2 ml-4">
            <span className="text-slate-900 font-medium hidden md:inline">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700 text-xs font-bold"
            >
              LOGOUT
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
