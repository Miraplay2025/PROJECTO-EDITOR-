import React, { useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertTriangle, Terminal, Download, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExportSettings, RenderLog } from '../types';

interface ExportModal2Props {
  isOpen: boolean;
  progress: number;
  logs: RenderLog[];
  isCompleted: boolean;
  exportedFileUrl: string | null;
  settings: ExportSettings;
  onCancel: () => void;
  onClose: () => void;
}

export const ExportModal2: React.FC<ExportModal2Props> = ({
  isOpen,
  progress,
  logs,
  isCompleted,
  exportedFileUrl,
  settings,
  onCancel,
  onClose,
}) => {
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the bottom of logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Confetti on completion
  useEffect(() => {
    if (isCompleted) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
      });
    }
  }, [isCompleted]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-2xl p-6 text-white overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
                isCompleted
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
              }`}
            >
              {isCompleted ? <CheckCircle2 size={22} /> : <Terminal size={20} />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {isCompleted ? 'Renderização Concluída!' : 'Renderizando Vídeo...'}
                {isCompleted && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-normal">
                    Salvo com Sucesso
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Foreground Service • Media3 Transformer Pipeline ({settings.resolution} @ {settings.fps} FPS)
              </p>
            </div>
          </div>

          {!isCompleted && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
              <span className="text-xs font-mono text-indigo-400 font-bold">HW BUSY</span>
            </div>
          )}
        </div>

        {/* Real-time Progress Bar */}
        <div className="py-4 shrink-0">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium">Progresso da Codificação</span>
            <span
              className={`font-mono font-bold text-sm ${
                isCompleted ? 'text-emerald-400' : 'text-indigo-400'
              }`}
            >
              {progress}%
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className={`h-full rounded-full transition-all duration-150 shadow-sm ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Real-Time Auto-Scrolling Logs Terminal */}
        <div className="flex flex-col flex-1 min-h-[220px] max-h-[340px] overflow-hidden mb-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
            <span>Terminal de Processamento (Async Coroutines):</span>
            <span className="text-[10px] font-mono text-slate-500">{logs.length} eventos</span>
          </div>

          <div className="flex-1 bg-[#020617] rounded-xl border border-slate-800 p-3 overflow-y-auto font-mono text-xs space-y-1.5 select-text shadow-inner">
            {logs.map((log) => {
              const colorClass =
                log.level === 'success'
                  ? 'text-emerald-400 font-semibold'
                  : log.level === 'warning'
                  ? 'text-amber-400'
                  : log.level === 'error'
                  ? 'text-rose-400 font-bold'
                  : log.level === 'progress'
                  ? 'text-indigo-300'
                  : 'text-slate-300';

              return (
                <div key={log.id} className="leading-relaxed flex items-start gap-2">
                  <span className="text-slate-600 shrink-0 text-[10px] pt-0.5">[{log.timestamp}]</span>
                  <span className={colorClass}>&gt; {log.message}</span>
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Saved Path Info or Actions */}
        {isCompleted && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/40 text-xs text-emerald-300 flex items-center justify-between shrink-0">
            <div>
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Vídeo gravado no MediaStore do Android
              </div>
              <div className="font-mono text-[11px] text-emerald-400/80">
                /storage/emulated/0/Movies/CinemaMotion/CinemaMotion_Render.mp4
              </div>
            </div>

            {exportedFileUrl && (
              <a
                href={exportedFileUrl}
                download="CinemaMotion_Render.webm"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs shrink-0 ml-2"
              >
                <Download size={14} />
                <span>Baixar</span>
              </a>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between shrink-0">
          {!isCompleted ? (
            <button
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
            >
              <X size={16} />
              <span>Cancelar Renderização</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Fechar e Voltar ao Editor</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
