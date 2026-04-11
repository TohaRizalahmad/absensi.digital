import { useEffect, useState } from 'react';
import QRScanner from '../components/QRScanner';
import { request } from '../services/api';

export default function Scan() {
  const [schedules, setSchedules] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [recentScans, setRecentScans] = useState([]); // List of recent scans
  const [lastStudent, setLastStudent] = useState(null); // Last scanned student detail
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [scheduleList, active] = await Promise.all([request('/schedules'), request('/sessions/active')]);
        setSchedules(scheduleList);
        setActiveSessions(active);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };
    loadData();
  }, []);

  const handleStartSession = async () => {
    if (!sessionId) return;
    try {
      const data = await request('/sessions', {
        method: 'POST',
        body: JSON.stringify({ schedule_id: sessionId }),
      });
      setLastStudent(null);
      setErrorMessage('');
      const active = await request('/sessions/active');
      setActiveSessions(active);
      // Set the newly created session as the active one
      setSessionId(data.id.toString());
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    // Basic debounce - don't scan the same thing twice in 2 seconds
    if (lastStudent && lastStudent.qrCode === decodedText) return;

    try {
      const targetSessionId = sessionId || (activeSessions[0]?.id ?? '');
      if (!targetSessionId) {
        setErrorMessage('Silakan pilih atau mulai sesi terlebih dahulu.');
        return;
      }

      const data = await request('/attendance/scan', {
        method: 'POST',
        body: JSON.stringify({ qrCode: decodedText, sessionId: targetSessionId }),
      });

      const scanInfo = {
        name: data.student.name,
        time: new Date().toLocaleTimeString(),
        status: data.status,
        qrCode: decodedText
      };

      setLastStudent(scanInfo);
      setRecentScans((prev) => [scanInfo, ...prev].slice(0, 5));
      setErrorMessage('');
      
      // Clear last student display after 5 seconds
      setTimeout(() => setLastStudent(null), 5000);
    } catch (error) {
      setErrorMessage(error.message);
      setLastStudent(null);
    }
  };

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Scan QR Absensi</h1>
        <p className="mt-2 text-sm text-slate-500">Gunakan kamera untuk mencatat kehadiran murid.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Pengaturan Sesi</h2>
            
            <label className="mt-4 block text-sm font-medium text-slate-700">Pilih Jadwal</label>
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">-- Pilih Jadwal --</option>
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.class_name} - {schedule.subject_name}
                </option>
              ))}
            </select>

            <button
              onClick={handleStartSession}
              className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-4 text-white font-semibold transition hover:bg-slate-800"
            >
              Mulai Sesi Baru
            </button>

            {activeSessions.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="text-sm font-semibold text-slate-900">Sesi Aktif</h3>
                <div className="mt-3 space-y-2">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="rounded-2xl bg-emerald-50 p-3 border border-emerald-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-700 uppercase">Sesi #{session.id}</span>
                      <span className="text-xs text-emerald-600">Sedang berjalan</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Riwayat Scan</h2>
            <div className="mt-4 space-y-3">
              {recentScans.length > 0 ? (
                recentScans.map((scan, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{scan.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{scan.status}</p>
                    </div>
                    <p className="text-xs text-slate-400">{scan.time}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Belum ada scan.</p>
              )}
            </div>
          </div>
        </section>

        <section className="relative flex flex-col items-center">
          <div className="w-full h-[600px] rounded-[40px] bg-slate-950 p-3 shadow-2xl relative overflow-hidden transition-all border-[8px] border-slate-900">
            <QRScanner onScanSuccess={handleScanSuccess} />
            
            {/* Success Overlay Notification */}
            {lastStudent && (
              <div className="absolute top-10 inset-x-10 animate-in slide-in-from-top duration-500">
                <div className="bg-white rounded-3xl p-6 shadow-2xl border border-emerald-100 flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-900">{lastStudent.name}</h4>
                    <p className="text-sm text-emerald-600 font-medium uppercase tracking-wide">Status: {lastStudent.status}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="absolute bottom-10 inset-x-10 animate-in slide-in-from-bottom duration-300">
                <div className="bg-rose-500 text-white rounded-2xl p-4 text-center text-sm font-medium shadow-xl">
                  {errorMessage}
                </div>
              </div>
            )}
          </div>
          
          <p className="mt-6 text-sm text-slate-500 font-medium">
            💡 Pastikan pencahayaan cukup dan QR Code terlihat jelas di layar.
          </p>
        </section>
      </div>
    </main>
  );
}
