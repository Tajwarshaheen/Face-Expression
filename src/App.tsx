/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  AlertCircle,
  Download,
  RefreshCw,
  CheckCircle2,
  Eye,
  Shield,
  Cpu,
  Camera,
  Image as ImageIcon,
  Info,
  Users,
  ScanFace,
  ArrowLeft,
} from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import CameraCapture from './components/CameraCapture.jsx';
import {
  EMOTIONS,
  EMOTION_CONFIG,
  analyzeFacialExpression,
  downloadAnalysisReport,
} from './services/emotionService.js';

interface ExpressionScores {
  happy: number;
  sad: number;
  neutral: number;
  angry: number;
  surprised: number;
  fearful: number;
  disgusted: number;
}

interface FaceAnalysis {
  faceId: number;
  boundingBoxDescription?: string;
  dominantExpression: string;
  confidence: number;
  summary: string;
  visibleCues: string[];
  expressions: ExpressionScores;
}

interface AnalysisResult {
  faceDetected: boolean;
  faceCount: number;
  overallSummary: string;
  disclaimer: string;
  faces: FaceAnalysis[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setSelectedFaceIndex(0);
    setIsAnalyzing(false);
  };

  const runAnalysis = async (imageDataUrl: string, mimeType = 'image/jpeg') => {
    setSelectedImage(imageDataUrl);
    setSelectedMimeType(mimeType);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setSelectedFaceIndex(0);

    try {
      const result = await analyzeFacialExpression(imageDataUrl, mimeType);
      setAnalysisResult(result as AnalysisResult);
    } catch (err: any) {
      setAnalysisError(err?.message || 'An unexpected error occurred during facial expression analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhotoReady = (dataUrl: string, mimeType = 'image/jpeg') => {
    runAnalysis(dataUrl, mimeType);
  };

  const handleSelectSample = async (sampleUrl: string) => {
    setActiveTab('upload');
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setSelectedImage(sampleUrl);

    try {
      const response = await fetch(sampleUrl);
      if (!response.ok) {
        throw new Error('Could not load the sample portrait image.');
      }
      const blob = await response.blob();
      const mimeType = blob.type || 'image/jpeg';
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read sample image data.'));
        reader.readAsDataURL(blob);
      });
      await runAnalysis(dataUrl, mimeType);
    } catch (err: any) {
      setIsAnalyzing(false);
      setAnalysisError(err?.message || 'Failed to analyze sample portrait.');
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setAnalysisError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setAnalysisError('Image file size must be under 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setSelectedImage(dataUrl);
        setSelectedMimeType(file.type || 'image/jpeg');
        setAnalysisResult(null);
        setAnalysisError(null);
      }
    };
    reader.onerror = () => {
      setAnalysisError('Failed to read the selected image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const renderResultsSection = () => {
    if (!selectedImage && !isAnalyzing && !analysisResult && !analysisError) {
      return null;
    }

    const activeFace = analysisResult?.faces?.[selectedFaceIndex] || null;
    const dominantConfig =
      activeFace && EMOTION_CONFIG[activeFace.dominantExpression as keyof typeof EMOTION_CONFIG]
        ? EMOTION_CONFIG[activeFace.dominantExpression as keyof typeof EMOTION_CONFIG]
        : EMOTION_CONFIG.Neutral;

    return (
      <div className="mt-10 max-w-5xl mx-auto">
        <div className="rounded-3xl glass-panel-glow p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-cyan-500/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ScanFace className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Expression Analysis Workspace</h2>
                <p className="text-xs text-slate-400">
                  Ekman 7-emotion probability estimation &amp; anatomical cues
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {analysisResult && (
                <button
                  onClick={() => downloadAnalysisReport(analysisResult)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON</span>
                </button>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Image Preview with Scan Overlay */}
            <div className="lg:col-span-5">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg">
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt="Analyzed portrait"
                    className={`w-full h-full object-cover transition duration-300 ${
                      isAnalyzing ? 'brightness-75 contrast-110' : ''
                    }`}
                  />
                )}

                {isAnalyzing && (
                  <>
                    <div className="absolute inset-0 bg-cyan-500/10" />
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scan" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="px-4 py-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md flex items-center gap-2.5 text-xs font-mono text-cyan-300 shadow-xl">
                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                        <span>ANALYZING FACIAL ACTION UNITS...</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {analysisResult?.faceDetected && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <Users className="w-4 h-4 text-cyan-400" />
                      Detected Faces
                    </span>
                    <span className="font-mono font-bold text-cyan-300">
                      {analysisResult.faceCount}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {analysisResult.overallSummary}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Results or Loading/Error State */}
            <div className="lg:col-span-7 space-y-5">
              {isAnalyzing && (
                <div className="p-8 rounded-2xl glass-card border border-cyan-500/20 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
                  <h3 className="text-base font-bold text-white">Running Vision Inference</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Detecting facial geometry, micro-muscle tension, and calculating expression probability distributions across 7 universal categories.
                  </p>
                </div>
              )}

              {analysisError && !isAnalyzing && (
                <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">Analysis Error</p>
                    <p className="text-xs text-rose-300/90 leading-relaxed">{analysisError}</p>
                    {selectedImage && (
                      <button
                        onClick={() => runAnalysis(selectedImage, selectedMimeType)}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 transition cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Analysis</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {analysisResult && !isAnalyzing && !analysisResult.faceDetected && (
                <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-300">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="font-bold text-base">No Face Detected</h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {analysisResult.overallSummary ||
                      'No human face was clearly detected in this image. Please try a clearer front-facing portrait.'}
                  </p>
                  <p className="text-xs text-slate-400">{analysisResult.disclaimer}</p>
                </div>
              )}

              {analysisResult && !isAnalyzing && analysisResult.faceDetected && activeFace && (
                <>
                  {/* Multi-face switcher */}
                  {analysisResult.faces.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.faces.map((face, idx) => (
                        <button
                          key={face.faceId || idx}
                          onClick={() => setSelectedFaceIndex(idx)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            selectedFaceIndex === idx
                              ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200'
                              : 'bg-slate-900/70 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Face #{face.faceId || idx + 1} • {face.dominantExpression}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Dominant Expression Summary Card */}
                  <div
                    className={`p-5 rounded-2xl glass-card border ${dominantConfig.borderColor}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-2xl">
                          {dominantConfig.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${dominantConfig.badgeBg} ${dominantConfig.badgeText} border ${dominantConfig.borderColor}`}
                            >
                              {activeFace.dominantExpression}
                            </span>
                            {activeFace.boundingBoxDescription && (
                              <span className="text-xs text-slate-400">
                                {activeFace.boundingBoxDescription}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-200 mt-1.5 font-medium">
                            {activeFace.summary}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] font-mono text-slate-400 uppercase">
                          Confidence
                        </div>
                        <div className="text-xl font-extrabold font-mono text-cyan-300">
                          {activeFace.confidence}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Probability Breakdown */}
                  <div className="p-5 rounded-2xl glass-card space-y-3.5">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      7-Emotion Probability Distribution
                    </h3>
                    <div className="space-y-3">
                      {EMOTIONS.map((emotionName) => {
                        const key = emotionName.toLowerCase() as keyof ExpressionScores;
                        const score = activeFace.expressions?.[key] ?? 0;
                        const cfg =
                          EMOTION_CONFIG[emotionName as keyof typeof EMOTION_CONFIG];
                        return (
                          <div key={emotionName} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-2 text-slate-200 font-medium">
                                <span>{cfg.emoji}</span>
                                <span>{cfg.label}</span>
                              </span>
                              <span className="font-mono font-semibold text-slate-300">
                                {score}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-800/90 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-500`}
                                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Visible Anatomical Cues */}
                  {activeFace.visibleCues && activeFace.visibleCues.length > 0 && (
                    <div className="p-5 rounded-2xl glass-card space-y-3">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Observable Facial Action Cues</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeFace.visibleCues.map((cue, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span>{cue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400">
                    <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{analysisResult.disclaimer}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060814] text-slate-100">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab: string) => {
          setActiveTab(tab);
        }}
        onReset={handleReset}
      />

      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              onOpenCamera={() => {
                handleReset();
                setActiveTab('camera');
              }}
              onOpenUpload={() => {
                handleReset();
                setActiveTab('upload');
              }}
              onSelectSample={handleSelectSample}
            />
          </>
        )}

        {activeTab === 'camera' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Overview</span>
              </button>
              <button
                onClick={() => {
                  handleReset();
                  setActiveTab('upload');
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Switch to Image Upload</span>
              </button>
            </div>

            <CameraCapture onPhotoReady={handlePhotoReady} isAnalyzing={isAnalyzing} />
            {renderResultsSection()}
          </section>
        )}

        {activeTab === 'upload' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-6 flex items-center justify-between max-w-3xl mx-auto">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Overview</span>
              </button>
              <button
                onClick={() => {
                  handleReset();
                  setActiveTab('camera');
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Switch to Live Camera</span>
              </button>
            </div>

            <div className="max-w-3xl mx-auto">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed transition-all cursor-pointer glass-panel-glow ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
                    : 'border-cyan-500/25 hover:border-cyan-400/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-cyan-400" />
                </div>

                <h2 className="text-xl font-bold text-white mb-2">
                  Upload a Portrait Image
                </h2>
                <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                  Drag and drop a photo here, or click to browse. Supports JPG, PNG, and WebP up to 15MB.
                </p>

                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-lg shadow-cyan-500/25">
                  <Upload className="w-4 h-4" />
                  <span>Select Photo</span>
                </div>
              </div>

              {selectedImage && !isAnalyzing && !analysisResult && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => runAnalysis(selectedImage, selectedMimeType)}
                    className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-xl shadow-cyan-500/30 transition cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5 text-cyan-200" />
                    <span>Analyze Facial Expression</span>
                  </button>
                </div>
              )}
            </div>

            {renderResultsSection()}
          </section>
        )}

        {activeTab === 'how-it-works' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                <span>Computer Vision Pipeline</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                How MoodVision AI Works
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">
                Powered by multimodal vision inference and Paul Ekman&apos;s Facial Action Coding System (FACS) principles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl glass-card glass-card-hover space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold">
                  01
                </div>
                <h3 className="text-lg font-bold text-white">Capture or Upload</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Use your webcam for a high-resolution snapshot or upload any portrait photograph directly in your browser.
                </p>
              </div>
              <div className="p-6 rounded-2xl glass-card glass-card-hover space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold">
                  02
                </div>
                <h3 className="text-lg font-bold text-white">Action Unit Detection</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The server-side AI vision engine inspects eyebrow position, eye aperture, cheek elevation, and lip curvature.
                </p>
              </div>
              <div className="p-6 rounded-2xl glass-card glass-card-hover space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-mono font-bold">
                  03
                </div>
                <h3 className="text-lg font-bold text-white">Probability Breakdown</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Receive structured probability estimates across all 7 universal expressions along with observable cues and JSON export.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white text-center">
                7 Universal Facial Expressions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {EMOTIONS.map((name) => {
                  const cfg = EMOTION_CONFIG[name as keyof typeof EMOTION_CONFIG];
                  return (
                    <div
                      key={name}
                      className={`p-4 rounded-2xl glass-card border ${cfg.borderColor} space-y-2`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{cfg.emoji}</span>
                        <span className={`font-bold text-sm ${cfg.badgeText}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {cfg.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'about' && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Privacy &amp; Ethics</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                About MoodVision AI &amp; Privacy
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl glass-card space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Zero Persistent Photo Storage</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Webcam snapshots and uploaded images are processed transiently in memory solely to generate the expression analysis response. MoodVision AI does not store or archive your photos in any database.
                </p>
              </div>

              <div className="p-6 rounded-2xl glass-card space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-400" />
                  <span>Important Interpretation Notice</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Estimated facial expression probabilities reflect visible muscular configurations in a single frame and do not determine a person&apos;s true internal emotional state, intent, or mental health.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-cyan-500/10 bg-[#060814]/90 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MoodVision AI — Facial Expression Computer Vision</span>
          <span className="text-slate-600">
            Estimates visible expressions only; not a diagnostic tool.
          </span>
        </div>
      </footer>
    </div>
  );
}
