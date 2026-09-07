import React from 'react';
import { Play, Pause, X, Bell, Film, Download, CheckCircle2 } from 'lucide-react';
import { ExportSettings } from '../types';

interface ForegroundNotificationBarProps {
  isRendering: boolean;
  progress: number;
  isCompleted: boolean;
  settings: ExportSettings;
  onCancel: () => void;
  onOpenModal: () => void;
}

export const ForegroundNotificationBar: React.FC<ForegroundNotificationBarProps> = ({
  isRendering,
  progress,
  isCompleted,
  settings,
  onCancel,
  onOpenModal,
}) => {
  if (!isRendering && !isCompleted) return null;

  return (
    <div className="w-full bg-[#0b1329] border-b border-indigo-900/60 px-4 py-2 flex items-center justify-between text-xs text-slate-300 shadow-md animate-in slide-in-from-top duration-300 z-40">
      <div
        onClick={onOpenModal}
        className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
          {isCompleted ? (
            <CheckCircle2 size={16} className="text-emerald-400" />
          ) : (
            <Film size={15} className="text-indigo-400 animate-spin" />
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">
              {isCompleted ? 'CinemaMotion: Exportação Concluída' : 'CinemaMotion: Renderizando em Background'}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono">
              Foreground Service
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>
              {isCompleted
                ? 'Salvo em /Movies/CinemaMotion'
                : `Processando (${progress}%) • ${settings.resolution} @ ${settings.fps}FPS`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Progress Mini Bar */}
        {!isCompleted && (
          <div className="hidden sm:flex items-center gap-2 w-32">
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-indigo-400">{progress}%</span>
          </div>
        )}

        {/* Cancel Button in Persistent Notification */}
        {!isCompleted ? (
          <button
            onClick={onCancel}
            className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X size={12} />
            <span>Cancelar</span>
          </button>
        ) : (
          <button
            onClick={onOpenModal}
            className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Download size={12} />
            <span>Ver Arquivo</span>
          </button>
        )}
      </div>
    </div>
  );
};
