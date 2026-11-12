import React from 'react';
import { Camera, Upload, Shield, Eye, Activity, Cpu, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export default function Hero({ onOpenCamera, onOpenUpload, onSelectSample }) {
  // Curated demo portrait samples to let users test instantly
  const demoSamples = [
    {
      title: 'Joyful Expression',
      expression: 'Happy',
      tag: 'Smile & Eye Crinkle',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Contemplative Focus',
      expression: 'Neutral',
      tag: 'Calm & Composed',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Amazed Expression',
      expression: 'Surprised',
      tag: 'Raised Brows & Open Eyes',
      url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="relative pt-6 pb-16 sm:pt-12 sm:pb-24 overflow-hidden">
      {/* Background ambient neon glow spheres */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 -left-32 w-96 h-96 bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide shadow-sm shadow-cyan-500/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen Computer Vision Analysis</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span className="text-slate-400 font-normal">Ekman Universal Model</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Understand Facial Expressions{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                with AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Capture or upload a photo to explore estimated facial expressions. Analyze micro-expressions, facial action units, and probability distributions with state-of-the-art vision models.
            </p>

            {/* Two Main Call-To-Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onOpenCamera}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-7 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                <Camera className="w-5 h-5 text-cyan-200" />
                <span>Open Camera</span>
              </button>

              <button
                onClick={onOpenUpload}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-7 py-4 rounded-2xl text-base font-semibold text-slate-100 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/50 shadow-lg shadow-black/40 hover:shadow-cyan-500/15 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                <Upload className="w-5 h-5 text-cyan-400" />
                <span>Upload Image</span>
              </button>
            </div>

            {/* Trust & Privacy features */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-800/80 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>7 Universal Emotions</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Zero Photo Storage</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Sub-second AI Inference</span>
              </div>
            </div>

            {/* Quick Demo Sample Picker */}
            {onSelectSample && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 justify-center lg:justify-start">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Or test instantly with a sample portrait:</span>
                </p>
                <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto lg:mx-0">
                  {demoSamples.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectSample(sample.url)}
                      className="group relative rounded-xl overflow-hidden border border-slate-700/60 hover:border-cyan-400/80 transition-all duration-200 text-left cursor-pointer"
                    >
                      <div className="h-16 w-full relative">
                        <img
                          src={sample.url}
                          alt={sample.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300 brightness-90 group-hover:brightness-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                        <span className="absolute bottom-1 left-1.5 right-1.5 text-[11px] font-semibold text-white truncate block">
                          {sample.expression}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Visual Biometric AI Facial Analysis Hologram */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              
              {/* Outer decorative glowing ring */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-3xl blur-xl opacity-30 animate-pulse-glow" />

              {/* Main Futuristic Biometric Card */}
              <div className="relative rounded-3xl glass-card border border-cyan-500/25 p-5 shadow-2xl overflow-hidden">
                
                {/* HUD Header Bar */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-cyan-500/15 text-[11px] font-mono text-cyan-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span className="font-bold tracking-wider">HUD // BIOMETRIC_TRACKING</span>
                  </div>
                  <span className="text-slate-400">FPS: 60 | CONF: 98.7%</span>
                </div>

                {/* Facial Visual Scan Area */}
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  
                  {/* Photo illustration */}
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                    alt="AI Facial Analysis Demo"
                    className="w-full h-full object-cover brightness-90 contrast-105"
                  />

                  {/* Gradient dark overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060814] via-transparent to-transparent opacity-80" />
                  <div className="absolute inset-0 bg-cyan-500/5 mix-blend-color-dodge" />

                  {/* Animated Scanner Bar */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scan z-20 pointer-events-none" />

                  {/* Target Bounding Brackets around Face */}
                  <div className="absolute top-[18%] left-[24%] right-[24%] bottom-[14%] border border-cyan-400/40 rounded-2xl pointer-events-none">
                    {/* Corner brackets */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                    
                    {/* Center crosshair */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-cyan-400/30 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                    </div>

                    {/* HUD face label */}
                    <div className="absolute -top-6 left-0 bg-cyan-950/80 backdrop-blur-md border border-cyan-500/40 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 font-semibold shadow-sm">
                      FACE_01: DOMINANT_HAPPY (82%)
                    </div>
                  </div>

                  {/* Floating Action Unit Micro-tags */}
                  <div className="absolute bottom-3 left-3 bg-[#070b18]/90 backdrop-blur-md border border-purple-500/30 px-2.5 py-1 rounded-lg text-[10px] font-mono text-purple-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    <span>AU12 Zygomaticus Lift</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-[#070b18]/90 backdrop-blur-md border border-cyan-500/30 px-2.5 py-1 rounded-lg text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>AU06 Eye Squint Check</span>
                  </div>
                </div>

                {/* Live Probability Bars Mock Ticker */}
                <div className="mt-4 space-y-2 bg-slate-900/60 rounded-xl p-3 border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <span>😊</span> Happy
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">82%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[82%]" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>Neutral:</span>
                      <span className="text-slate-300 font-semibold">11%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Surprised:</span>
                      <span className="text-slate-300 font-semibold">5%</span>
                    </div>
                  </div>
                </div>

                {/* Sub-footer note */}
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>Real-Time Geometric Landmarks</span>
                  </span>
                  <span className="font-mono text-cyan-400/80">ISO/IEC-2382 CV</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
