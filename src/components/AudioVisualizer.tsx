import React from 'react';

interface AudioVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isListening,
  isSpeaking,
  isThinking,
}) => {
  const bars = [14, 28, 42, 60, 48, 30, 18, 36, 52, 24];

  return (
    <div className="flex items-center justify-center gap-1.5 h-10 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-inner">
      {bars.map((height, i) => {
        let barHeight = 6;
        let colorClass = 'bg-slate-700';

        if (isListening) {
          barHeight = Math.max(6, (height * ((i % 3) + 1)) % 32);
          colorClass = 'bg-rose-500 animate-pulse';
        } else if (isSpeaking) {
          barHeight = Math.max(8, (height * ((i % 2) + 1.2)) % 30);
          colorClass = 'bg-cyan-400';
        } else if (isThinking) {
          barHeight = 12;
          colorClass = 'bg-indigo-500 animate-bounce';
        }

        return (
          <div
            key={i}
            style={{
              height: `${barHeight}px`,
              transition: 'height 120ms ease-in-out',
              animationDelay: `${i * 65}ms`,
            }}
            className={`w-1 rounded-full ${colorClass}`}
          />
        );
      })}
    </div>
  );
};
