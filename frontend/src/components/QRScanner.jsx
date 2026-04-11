import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess }) {
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode('qr-reader');
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        // Automatically try to use back camera (environment)
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            // Silently ignore scan errors (no QR found in frame)
          }
        );
      } catch (err) {
        console.error('Failed to start scanner:', err);
        setError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
            scannerRef.current.clear();
        }).catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-black">
      <div id="qr-reader" className="h-full w-full" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center text-sm text-rose-500">
          {error}
        </div>
      )}
      <div className="absolute bottom-6 flex space-x-2">
        <div className="flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-[10px] font-medium text-white tracking-wider uppercase">Auto-Scanning</span>
        </div>
      </div>
    </div>
  );
}
