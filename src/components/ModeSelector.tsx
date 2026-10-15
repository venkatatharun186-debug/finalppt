import React from 'react';
import { ShieldAlert, BookOpen, Eye, Banknote } from 'lucide-react';
import { VisionTask } from '../types';

interface ModeSelectorProps {
  currentTask: VisionTask;
  onChangeTask: (task: VisionTask) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentTask, onChangeTask }) => {
  const modes = [
    {
      id: 'obstacle_safety' as VisionTask,
      name: 'Obstacle & Safety',
      icon: ShieldAlert,
      badge: 'Hazards & BBoxes',
    },
    {
      id: 'read_text' as VisionTask,
      name: 'Read Signs & OCR',
      icon: BookOpen,
      badge: 'Text Reader',
    },
    {
      id: 'scene_description' as VisionTask,
      name: 'Scene Description',
      icon: Eye,
      badge: 'Spatial Audio',
    },
    {
      id: 'currency_reader' as VisionTask,
      name: 'Currency & Items',
      icon: Banknote,
      badge: 'Money & Meds',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentTask === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => onChangeTask(mode.id)}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              isActive
                ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 hover:border-slate-700'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            )}
            <div
              className={`p-1.5 rounded-lg ${
                isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate leading-tight">{mode.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{mode.badge}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
