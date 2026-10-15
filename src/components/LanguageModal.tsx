import React, { useState } from 'react';
import { Search, X, Volume2, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageConfig } from '../languages';
import { speakText, stopSpeaking } from '../speechService';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageConfig;
  onSelectLanguage: (lang: LanguageConfig) => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
}) => {
  const [search, setSearch] = useState('');
  const [playingCode, setPlayingCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  const handlePreviewVoice = async (e: React.MouseEvent, lang: LanguageConfig) => {
    e.stopPropagation();
    stopSpeaking();
    setPlayingCode(lang.code);

    await speakText(lang.sample, {
      voiceName: lang.voice,
      languageCode: lang.code,
      speechLang: lang.speechLang,
      onEnd: () => setPlayingCode(null),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Select Language & Speech Voice
            </h2>
            <p className="text-xs text-slate-400">
              Drishti translates visual hazard alerts, audio descriptions, and voice guidance in real time.
            </p>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by language, script, or country code (e.g. Hindi, Spanish, te, ja)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
          </div>
        </div>

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredLanguages.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-sm">
              No matching languages found.
            </div>
          ) : (
            filteredLanguages.map((lang) => {
              const isSelected = currentLanguage.code === lang.code;
              const isPlaying = playingCode === lang.code;

              return (
                <div
                  key={lang.code}
                  onClick={() => {
                    stopSpeaking();
                    onSelectLanguage(lang);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl select-none">{lang.flag}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm truncate">{lang.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                          {lang.code}
                        </span>
                      </div>
                      <div className="text-xs text-indigo-300/80 truncate font-medium">
                        {lang.nativeName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      type="button"
                      title="Preview Voice Greeting"
                      onClick={(e) => handlePreviewVoice(e, lang)}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-cyan-500 text-slate-950 animate-pulse'
                          : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-indigo-500 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between px-5">
          <span>{filteredLanguages.length} Languages available</span>
          <span className="text-indigo-400 font-medium">Powered by Gemini Voice & Vision</span>
        </div>
      </div>
    </div>
  );
};
