import React from 'react';
import { X, Sparkles, Navigation } from 'lucide-react';
import { PRESET_SCENES } from '../presetScenes';
import { PresetScene } from '../types';

interface PresetScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScene: (scene: PresetScene) => void;
  activeSceneId?: string | null;
}

export const PresetScenariosModal: React.FC<PresetScenariosModalProps> = ({
  isOpen,
  onClose,
  onSelectScene,
  activeSceneId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Demo Navigation Environments
            </h2>
            <p className="text-xs text-slate-400">
              Test Drishti's visual hazard recognition, bounding box geometry, and audio guidance immediately.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_SCENES.map((scene) => {
            const isSelected = activeSceneId === scene.id;

            return (
              <div
                key={scene.id}
                onClick={() => {
                  onSelectScene(scene);
                  onClose();
                }}
                className={`group flex flex-col rounded-xl border overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-950/20'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-800/40'
                }`}
              >
                {/* Scene Preview Image */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-800/80">
                  <img
                    src={scene.url}
                    alt={scene.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950/80 text-cyan-300 border border-slate-800">
                    {scene.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {scene.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {scene.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-indigo-400 font-medium flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5" />
                      Load Scene
                    </span>
                    {isSelected && (
                      <span className="text-emerald-400 font-bold text-[11px]">ACTIVE</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
