import React from 'react';
import { Camera, Sparkles, Clock, Sliders, Layers, ChevronRight, Check } from 'lucide-react';
import { CameraAnimationType, MediaClip } from '../types';
import { CAMERA_ANIMATIONS, CAPCUT_TRANSITIONS } from '../data/defaults';

interface ContextPanelProps {
  selectedClipIndex: number | null;
  selectedTransitionIndex: number | null;
  clips: MediaClip[];
  onUpdateClipAnimation: (animation: CameraAnimationType) => void;
  onUpdateClipDuration: (duration: number) => void;
  onUpdateTransition: (transitionCode: string) => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  selectedClipIndex,
  selectedTransitionIndex,
  clips,
  onUpdateClipAnimation,
  onUpdateClipDuration,
  onUpdateTransition,
}) => {
  const isClipSelected = selectedClipIndex !== null && selectedClipIndex >= 0 && selectedClipIndex < clips.length;
  const isTransitionSelected = selectedTransitionIndex !== null && selectedTransitionIndex >= 0 && selectedTransitionIndex < clips.length - 1;

  const currentClip = isClipSelected ? clips[selectedClipIndex!] : null;
  const currentTransitionClip = isTransitionSelected ? clips[selectedTransitionIndex!] : null;

  return (
    <div className="w-full bg-[#0f172a] border-t border-slate-800 p-3 h-44 flex flex-col justify-between select-none">
      {isClipSelected && currentClip ? (
        <div className="flex flex-col h-full justify-between">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Animação de Câmera Dinâmica
              </span>
              <span className="text-xs text-slate-400">({currentClip.title})</span>
            </div>

            {/* Duration adjuster */}
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              <span className="text-xs text-slate-300">Duração:</span>
              <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                <button
                  onClick={() => onUpdateClipDuration(Math.max(1, currentClip.duration - 0.5))}
                  className="text-xs text-indigo-400 hover:text-white px-1 font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="text-xs font-mono font-bold text-white px-1">
                  {currentClip.duration.toFixed(1)}s
                </span>
                <button
                  onClick={() => onUpdateClipDuration(Math.min(15, currentClip.duration + 0.5))}
                  className="text-xs text-indigo-400 hover:text-white px-1 font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Camera Animation Selector Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            {CAMERA_ANIMATIONS.map((anim) => {
              const isSelected = currentClip.cameraAnimation === anim.id;
              return (
                <button
                  key={anim.id}
                  onClick={() => onUpdateClipAnimation(anim.id)}
                  className={`shrink-0 flex flex-col p-2 rounded-lg text-left transition-all border cursor-pointer w-36 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-1 ring-indigo-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold truncate">{anim.title}</span>
                    {isSelected && <Check size={12} className="text-white shrink-0" />}
                  </div>
                  <span className="text-[10px] opacity-75 line-clamp-2 leading-tight">
                    {anim.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : isTransitionSelected && currentTransitionClip ? (
        <div className="flex flex-col h-full justify-between">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Catálogo de 20 Transições CapCut Pro
              </span>
              <span className="text-xs text-slate-400">
                (Entre Clipe {selectedTransitionIndex! + 1} e {selectedTransitionIndex! + 2})
              </span>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800 px-2 py-0.5 rounded">
              {currentTransitionClip.transitionToNext}
            </span>
          </div>

          {/* 20 CapCut Transitions Horizontal Grid / Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            {CAPCUT_TRANSITIONS.map((trans) => {
              const isSelected = currentTransitionClip.transitionToNext === trans.code;
              return (
                <button
                  key={trans.id}
                  onClick={() => onUpdateTransition(trans.code)}
                  className={`shrink-0 flex flex-col p-2 rounded-lg text-left transition-all border cursor-pointer w-44 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-1 ring-indigo-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: trans.previewColor }}
                      />
                      <span className="text-xs font-bold truncate">#{trans.id} {trans.title}</span>
                    </div>
                    {isSelected && <Check size={12} className="text-white shrink-0" />}
                  </div>
                  <span className="text-[10px] opacity-75 line-clamp-2 leading-tight">
                    {trans.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-500 text-xs gap-2">
          <Layers size={16} />
          <span>Selecione um clipe de vídeo para editar Animações de Câmera ou o botão (+) para Transições CapCut.</span>
        </div>
      )}
    </div>
  );
};
