import React, { useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Plus, Sparkles, Scissors, Clock } from 'lucide-react';
import { MediaClip, AudioTrackConfig } from '../types';

interface TimelineProps {
  clips: MediaClip[];
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  selectedClipIndex: number | null;
  selectedTransitionIndex: number | null;
  onSelectClip: (index: number) => void;
  onSelectTransition: (index: number) => void;
  audioTrack: AudioTrackConfig;
  onToggleAudioMute: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  clips,
  currentTime,
  totalDuration,
  isPlaying,
  onTogglePlay,
  onSeek,
  selectedClipIndex,
  selectedTransitionIndex,
  onSelectClip,
  onSelectTransition,
  audioTrack,
  onToggleAudioMute,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis}`;
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = clickX / rect.width;
    onSeek(ratio * totalDuration);
  };

  const playheadPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="w-full bg-[#0f172a] border-t border-slate-800 flex flex-col select-none">
      {/* Top Playback Controls Bar */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800/80 bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow transition-colors cursor-pointer"
            title={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>

          <div className="text-xs font-mono text-slate-300">
            <span className="text-white font-semibold">{formatTime(currentTime)}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Audio Quick Mute */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAudioMute}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
              audioTrack.isMuted
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
            }`}
          >
            {audioTrack.isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{audioTrack.isMuted ? 'Mudo' : '48kHz AAC'}</span>
          </button>
        </div>
      </div>

      {/* Scrubbing Ruler & Needle Container */}
      <div className="relative px-4 py-2">
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative w-full h-5 bg-slate-900/90 rounded border border-slate-800/60 cursor-pointer overflow-hidden flex items-center"
        >
          {/* Timeline Marks */}
          <div className="absolute inset-0 flex justify-between px-2 text-[9px] font-mono text-slate-500 pointer-events-none items-center">
            <span>00:00</span>
            <span>{formatTime(totalDuration * 0.25)}</span>
            <span>{formatTime(totalDuration * 0.5)}</span>
            <span>{formatTime(totalDuration * 0.75)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>

          {/* Played Progress Bar */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-indigo-600/25 pointer-events-none"
            style={{ width: `${playheadPercent}%` }}
          />

          {/* Needle / Playhead indicator (#F43F5E - Rose-500) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#f43f5e] z-30 shadow-[0_0_8px_#f43f5e] pointer-events-none"
            style={{ left: `${playheadPercent}%` }}
          >
            <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-[#f43f5e] rotate-45 rounded-xs" />
          </div>
        </div>

        {/* Video Clips Track */}
        <div className="relative mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-2">
          {clips.map((clip, index) => {
            const isSelected = selectedClipIndex === index;
            const clipWidthPercent = (clip.duration / totalDuration) * 100;

            return (
              <React.Fragment key={clip.id}>
                {/* Clip Card */}
                <div
                  onClick={() => onSelectClip(index)}
                  className={`relative flex-1 min-w-[130px] h-14 rounded-lg p-2 flex flex-col justify-between cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-500/40'
                      : 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
                  }`}
                  style={{
                    background: isSelected ? '#4f46e5' : '#1e293b',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold truncate max-w-[90px]">
                      {clip.title}
                    </span>
                    <span className="text-[10px] font-mono opacity-80">
                      {clip.duration.toFixed(1)}s
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] opacity-75">
                    <span className="bg-black/30 px-1.5 py-0.5 rounded font-mono truncate max-w-[75px]">
                      {clip.cameraAnimation.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] font-mono text-slate-300">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                {/* Junction Button (+) for CapCut Transitions (Seção 4.2) */}
                {index < clips.length - 1 && (
                  <button
                    onClick={() => onSelectTransition(index)}
                    title={`Transição: ${clip.transitionToNext}`}
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                      selectedTransitionIndex === index
                        ? 'bg-indigo-600 text-white border-indigo-400 scale-110 ring-2 ring-indigo-500/50 shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-indigo-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Plus size={14} className="stroke-[2.5]" />
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Audio Track (#059669 - Emerald-600) */}
        <div
          className={`relative mt-1 w-full h-8 rounded-lg flex items-center px-3 border transition-opacity ${
            audioTrack.isMuted
              ? 'bg-emerald-950/40 border-emerald-900/40 opacity-40'
              : 'bg-[#059669]/20 border-emerald-600/40 opacity-95'
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="truncate">{audioTrack.title}</span>
          </div>

          {/* Waveform graphic visualization */}
          <div className="ml-auto flex items-center gap-0.5 h-4 opacity-70">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className="w-1 bg-emerald-400/80 rounded-full"
                style={{
                  height: `${Math.sin(i * 0.7) * 8 + 10}px`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
