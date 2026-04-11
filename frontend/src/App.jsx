import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { isLoggedIn } from './lib/auth';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';
import Schedules from './pages/Schedules';
import Attendance from './pages/Attendance';

function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <NavBar />
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="scan" element={<Scan />} />
                  <Route path="students" element={<Students />} />
                  <Route path="classes" element={<Classes />} />
                  <Route path="subjects" element={<Subjects />} />
                  <Route path="schedules" element={<Schedules />} />
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
