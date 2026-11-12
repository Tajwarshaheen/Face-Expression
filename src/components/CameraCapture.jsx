import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle,
  FlipHorizontal,
  Shield,
  HelpCircle,
} from 'lucide-react';

export default function CameraCapture({ onPhotoReady, isAnalyzing }) {
  const [streamActive, setStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Check if multiple camera devices exist
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((device) => device.kind === 'videoinput');
          if (videoInputs.length > 1) {
            setHasMultipleCameras(true);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Safe stopping of all media tracks
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setCameraLoading(false);
  }, []);

  // Stop tracks upon unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Request camera access and start stream
  const startCamera = async (overrideFacingMode) => {
    setCameraError(null);
    setCameraLoading(true);
    setCapturedImage(null);

    // Stop any existing stream first
    stopCameraStream();

    const selectedFacingMode = overrideFacingMode || facingMode;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera capture via mediaDevices API.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: selectedFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setStreamActive(true);
      setCameraLoading(false);
    } catch (err) {
      console.error('Camera access error:', err);
      stopCameraStream();

      let friendlyMessage = 'Unable to access your webcam.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        friendlyMessage =
          'Camera access was denied. Please allow camera permissions in your browser address bar settings to use the live webcam.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        friendlyMessage =
          'No camera device was detected on your system. Please connect a webcam or use the "Upload Image" tab.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        friendlyMessage =
          'Your camera may be in use by another application (e.g., Zoom, Teams, or another browser tab). Please close other camera apps and retry.';
      } else {
        friendlyMessage = err.message || friendlyMessage;
      }

      setCameraError(friendlyMessage);
    }
  };

  // Switch between front and back camera (e.g. on mobile/tablets)
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (streamActive) {
      startCamera(nextMode);
    }
  };

  // Capture current video frame to image
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if facingMode is user to match mirror preview
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);

    // Stop stream to conserve battery & camera indicator
    stopCameraStream();
  };

  // Retake photo: restart camera
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Analyze the captured photo
  const handleAnalyze = () => {
    if (capturedImage && onPhotoReady) {
      onPhotoReady(capturedImage, 'image/jpeg');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Top instruction card */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Live Webcam Capture</span>
              {streamActive && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  STREAMING
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Align your face within the frame and capture a high-resolution snapshot.
            </p>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Local capture • In-memory analysis</span>
        </div>
      </div>

      {/* Camera Viewport Container */}
      <div className="relative aspect-4/3 sm:aspect-16/10 w-full rounded-3xl overflow-hidden glass-panel-glow border-2 border-cyan-500/20 shadow-2xl bg-black">
        
        {/* State 1: Captured Image Preview */}
        {capturedImage ? (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured face preview"
              className="w-full h-full object-cover"
            />
            
            {/* Captured overlay badge */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-lg">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Snapshot Captured (High-Res JPEG)</span>
            </div>

            {/* Corner aesthetic brackets */}
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />
          </div>
        ) : streamActive ? (
          /* State 2: Live Video Feed */
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Biometric Face Guide Oval */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[58%] sm:w-[48%] h-[75%] sm:h-[78%] rounded-[50%] border-2 border-dashed border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)] flex flex-col items-center justify-between p-4 relative animate-pulse-glow">
                <span className="text-[11px] font-mono text-cyan-300 bg-[#060814]/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  ALIGN FACE HERE
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-[#060814]/80 px-2 py-0.5 rounded-full border border-slate-700">
                  KEEP EVEN LIGHTING
                </span>
              </div>
            </div>

            {/* Live Scanner Sweep */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-scan pointer-events-none" />

            {/* Flip Camera button if multiple available */}
            {hasMultipleCameras && (
              <button
                onClick={toggleFacingMode}
                className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition"
                title="Switch Camera"
              >
                <FlipHorizontal className="w-5 h-5 text-cyan-400" />
              </button>
            )}
          </div>
        ) : (
          /* State 3: Standby / Idle Camera State */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#090e24] to-[#060814]">
            
            {/* Camera icon circle */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center mb-5 shadow-inner">
              <Camera className="w-10 h-10 text-cyan-400" />
            </div>

            <h4 className="text-xl font-bold text-white mb-2">Webcam is Inactive</h4>
            <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
              Click the button below to start your camera. MoodVision AI will request permission to preview your video stream.
            </p>

            <button
              onClick={() => startCamera()}
              disabled={cameraLoading}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-xl shadow-cyan-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer disabled:opacity-50"
            >
              {cameraLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Requesting Camera...</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 text-cyan-200" />
                  <span>Start Camera</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>

      {/* Error alert if camera failed or permission denied */}
      {cameraError && (
        <div className="mt-4 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-rose-200">Camera Access Notice</p>
            <p className="text-rose-300/90 leading-relaxed">{cameraError}</p>
            <p className="text-slate-400 pt-1">
              Tip: You can also use the <strong>Upload Image</strong> tab to select any photo file without requiring webcam permissions.
            </p>
          </div>
        </div>
      )}

      {/* Control Buttons Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {capturedImage ? (
          <>
            <button
              onClick={handleRetake}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span>Retake Photo</span>
            </button>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-xl shadow-cyan-500/30 transform hover:-translate-y-0.5 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Analyze Captured Photo</span>
            </button>
          </>
        ) : streamActive ? (
          <>
            <button
              onClick={capturePhoto}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-xl shadow-cyan-500/30 transform hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <div className="w-4 h-4 rounded-full border-2 border-white bg-cyan-200 animate-pulse" />
              <span>Capture Photo</span>
            </button>

            <button
              onClick={stopCameraStream}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition cursor-pointer"
            >
              <CameraOff className="w-4 h-4 text-rose-400" />
              <span>Stop Camera</span>
            </button>
          </>
        ) : null}
      </div>

      {/* Helpful Guidelines */}
      <div className="mt-8 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
        <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-slate-300">Tips for Best Expression Analysis:</p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-400">
            <li>Position your face centered and facing forward toward the camera lens.</li>
            <li>Ensure soft, balanced front lighting without heavy backlighting shadows.</li>
            <li>Maintain a natural or deliberate facial expression (smile, surprise, neutral, etc.).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
