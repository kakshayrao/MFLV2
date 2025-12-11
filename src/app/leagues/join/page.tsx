'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, QrCode, Type, Loader2 } from 'lucide-react';

export default function JoinLeaguePage() {
  const router = useRouter();
  const [method, setMethod] = useState<'code' | 'qr'>('code');
  const [leagueCode, setLeagueCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leagueCode.trim()) {
      setError('Please enter a league code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/leagues/join-by-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: leagueCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join league');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/leagues/${data.leagueId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startQRScanner = async () => {
    setScanning(true);
    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanQRCode();
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopQRScanner = () => {
    setScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const scanQRCode = () => {
    if (!canvasRef.current || !videoRef.current || !scanning) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple QR code detection: look for dark squares (very basic)
    // In production, use a proper QR code library like jsQR
    // For now, we'll use a placeholder approach
    
    if ((window as any).jsQR) {
      const code = (window as any).jsQR(data, canvas.width, canvas.height);
      if (code) {
        const qrData = code.data;
        // Extract league code from QR data (format: league:CODE)
        if (qrData.startsWith('league:')) {
          const code = qrData.replace('league:', '');
          setLeagueCode(code);
          stopQRScanner();
          setMethod('code');
          return;
        }
      }
    }

    // Continue scanning
    requestAnimationFrame(scanQRCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fb] via-white to-[#eef2f7]">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link href="/main-dashboard" className="inline-flex items-center gap-2 mb-8 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="card-elevated p-6 mb-8">
          <h1 className="text-3xl headline mb-2">Join a League</h1>
          <p className="subtle">Enter a league code or scan a QR code to join a fitness league.</p>
        </div>

        {/* Method selector */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setMethod('code')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              method === 'code'
                ? 'bg-[var(--color-accent)] text-white'
                : 'card subtle hover:bg-[var(--color-elevated)]'
            }`}
          >
            <Type className="w-4 h-4 mr-2 inline" />
            Enter Code
          </button>
          <button
            onClick={() => setMethod('qr')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              method === 'qr'
                ? 'bg-[var(--color-accent)] text-white'
                : 'card subtle hover:bg-[var(--color-elevated)]'
            }`}
          >
            <QrCode className="w-4 h-4 mr-2 inline" />
            Scan QR
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700 text-sm font-medium">✓ Successfully joined! Redirecting...</p>
          </div>
        )}

        {/* Code entry */}
        {method === 'code' && (
          <form onSubmit={handleJoinByCode} className="card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-primary)' }}>
                League Code
              </label>
              <input
                type="text"
                placeholder="e.g., ABC123"
                value={leagueCode}
                onChange={(e) => {
                  setLeagueCode(e.target.value.toUpperCase());
                  setError('');
                }}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                disabled={loading}
              />
              <p className="text-xs subtle mt-1">
                Ask the league host for the code. It's displayed on their league page.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !leagueCode.trim()}
              className="btn-accent w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join League'
              )}
            </Button>
          </form>
        )}

        {/* QR Scanner */}
        {method === 'qr' && (
          <div className="card p-6 space-y-4">
            {!scanning ? (
              <div className="text-center">
                <QrCode className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-muted)' }} />
                <p className="subtle mb-4">
                  Point your camera at the league QR code to scan it automatically.
                </p>
                <Button
                  onClick={startQRScanner}
                  className="btn-accent w-full"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-80 object-cover"
                    autoPlay
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 border-2 border-[var(--color-accent)] rounded-lg pointer-events-none">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-[var(--color-accent)] rounded-lg"></div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={stopQRScanner}
                  variant="outline"
                  className="btn-outline w-full"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Help text */}
        <div className="card p-6 mt-8">
          <h3 className="font-medium mb-3" style={{ color: 'var(--color-primary)' }}>
            How to get a league code:
          </h3>
          <ol className="space-y-2 text-sm subtle">
            <li>1. Ask the league host for the league code or QR code</li>
            <li>2. The code is displayed on the league's management page</li>
            <li>3. Enter it above or scan the QR code to join instantly</li>
            <li>4. You'll be added to the league's member list</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
