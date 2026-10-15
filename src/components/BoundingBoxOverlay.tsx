import React from 'react';
import { AlertTriangle, ShieldCheck, ArrowRight, ArrowLeft, ArrowUp } from 'lucide-react';
import { Obstacle } from '../types';

interface BoundingBoxOverlayProps {
  obstacles: Obstacle[];
  isScanning: boolean;
  onSelectObstacle?: (obstacle: Obstacle) => void;
  selectedObstacleId?: string | null;
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  obstacles,
  isScanning,
  onSelectObstacle,
  selectedObstacleId,
}) => {
  const getLocationIcon = (loc: string) => {
    switch (loc) {
      case 'left':
        return <ArrowLeft className="w-3 h-3 text-amber-400" />;
      case 'right':
        return <ArrowRight className="w-3 h-3 text-amber-400" />;
      default:
        return <ArrowUp className="w-3 h-3 text-cyan-400" />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Scanning laser beam animation */}
      {isScanning && (
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] radar-sweep z-30" />
      )}

      {/* Crosshair guide lines in viewfinder */}
      <div className="absolute inset-0 border border-slate-700/30">
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-500/80 rounded-tl-sm" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-500/80 rounded-tr-sm" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-500/80 rounded-bl-sm" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-500/80 rounded-br-sm" />
      </div>

      {/* Render detected obstacle bounding boxes */}
      {obstacles.map((obs) => {
        const [ymin, xmin, ymax, xmax] = obs.box2d || [200, 200, 600, 600];
        const top = Math.max(0, Math.min(100, ymin / 10));
        const left = Math.max(0, Math.min(100, xmin / 10));
        const height = Math.max(5, Math.min(100 - top, (ymax - ymin) / 10));
        const width = Math.max(5, Math.min(100 - left, (xmax - xmin) / 10));

        const isHazard = obs.isHazard || obs.severity === 'high' || obs.severity === 'critical';
        const isSelected = selectedObstacleId === obs.id;

        return (
          <div
            key={obs.id}
            onClick={() => onSelectObstacle?.(obs)}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${width}%`,
              height: `${height}%`,
            }}
            className={`absolute pointer-events-auto cursor-pointer transition-all duration-300 rounded-lg flex flex-col justify-between p-1.5 border-2 ${
              isHazard
                ? 'border-rose-500 bg-rose-500/15 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                : obs.severity === 'medium'
                ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                : 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
            } ${isSelected ? 'ring-4 ring-cyan-400' : ''}`}
          >
            {/* Corner brackets */}
            <div className="flex items-start justify-between gap-1">
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm ${
                  isHazard
                    ? 'bg-rose-600 text-white'
                    : obs.severity === 'medium'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isHazard ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                {obs.label}
              </span>

              {obs.distance && (
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-950/80 text-cyan-300 border border-slate-700/60 backdrop-blur-md">
                  {getLocationIcon(obs.location)}
                  {obs.distance}
                </span>
              )}
            </div>

            {/* Bottom tag on mobile/desktop */}
            <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium">
              <span className="px-1 py-0.5 rounded bg-slate-950/70 text-slate-300 backdrop-blur-sm">
                {obs.location}
              </span>
              {isHazard && (
                <span className="px-1 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-800 text-[9px] font-bold">
                  HAZARD
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
