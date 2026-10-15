import React from 'react';
import { Volume2, VolumeX, Globe, Sparkles, RefreshCw } from 'lucide-react';
import { LanguageConfig } from '../languages';

interface NavbarProps {
  currentLanguage: LanguageConfig;
  onOpenLanguageModal: () => void;
  voiceName: string;
  onChangeVoiceName: (voice: string) => void;
  isAutoScan: boolean;
  onToggleAutoScan: () => void;
  isVoiceMuted: boolean;
  onToggleVoiceMute: () => void;
  backendOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onOpenLanguageModal,
  isAutoScan,
  onToggleAutoScan,
  isVoiceMuted,
  onToggleVoiceMute,
  backendOnline,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Drishti <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">Vision & Voice AI</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multimodal Assistive Intelligence for Navigation & Safety
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Button */}
          <button
            onClick={onOpenLanguageModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all text-xs font-medium cursor-pointer shadow-sm"
            title="Change language"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-sm">{currentLanguage.flag}</span>
            <span className="hidden md:inline font-semibold">{currentLanguage.name}</span>
            <span className="text-slate-400 text-[11px] hidden lg:inline">({currentLanguage.nativeName})</span>
          </button>

          {/* Auto-Scan Continuous Mode Toggle */}
          <button
            onClick={onToggleAutoScan}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              isAutoScan
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Auto-scan continuously"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAutoScan ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isAutoScan ? 'Auto-Scan ON' : 'Auto-Scan'}</span>
          </button>

          {/* Voice Response Mute Toggle */}
          <button
            onClick={onToggleVoiceMute}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              !isVoiceMuted
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isVoiceMuted ? 'Voice is Muted (Click to Unmute)' : 'Voice is Active (Click to Mute)'}
            aria-label="Toggle voice responses"
          >
            {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Backend Status indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-medium"
            title={backendOnline ? 'Connected to Gemini Vision Server' : 'Connecting to Server'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="text-slate-400 hidden xl:inline">
              {backendOnline ? 'AI Connected' : 'Connecting...'}
            </span>
            <Sparkles className="w-3 h-3 text-indigo-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
