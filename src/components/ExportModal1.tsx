import React from 'react';
import { X, Film, Rocket, Check, Cpu, HardDrive } from 'lucide-react';
import { ExportFpsType, ExportResolutionType, ExportSettings } from '../types';
import { EXPORT_RESOLUTIONS } from '../data/defaults';

interface ExportModal1Props {
  isOpen: boolean;
  settings: ExportSettings;
  onUpdateSettings: (newSettings: Partial<ExportSettings>) => void;
  onStartRender: () => void;
  onClose: () => void;
}

export const ExportModal1: React.FC<ExportModal1Props> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onStartRender,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-2xl p-6 text-white overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Film size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Configurações de Exportação</h2>
              <p className="text-xs text-slate-400">CinemaMotion Studio Pro • Android Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="py-5 space-y-5">
          {/* Section A: 4 Resoluções (240p, 480p, 720p, 1080p) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              1. Resolução de Saída (4 Opções)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {EXPORT_RESOLUTIONS.map((res) => {
                const isSelected = settings.resolution === res.id;
                return (
                  <button
                    key={res.id}
                    onClick={() => {
                      onUpdateSettings({
                        resolution: res.id,
                        bitrateMbps: res.defaultBitrateMbps,
                      });
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-500/40'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold">{res.label}</div>
                      <div className="text-[11px] opacity-75 font-mono">
                        {res.width}x{res.height}
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <Check size={13} className="text-white" />
                      </div>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                        {res.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section B: FPS (24, 30, 60 FPS) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              2. Taxa de Quadros (FPS)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {([24, 30, 60] as ExportFpsType[]).map((fps) => {
                const isSelected = settings.fps === fps;
                return (
                  <button
                    key={fps}
                    onClick={() => onUpdateSettings({ fps })}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-500/40 font-bold'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 font-medium'
                    }`}
                  >
                    <div className="text-sm">{fps} FPS</div>
                    <div className="text-[10px] opacity-70">
                      {fps === 24 ? 'Cinema' : fps === 30 ? 'Padrão' : 'Ultra Fluido'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section C: Bitrate & Codec */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              3. Encoder por Hardware & Bitrate
            </label>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cpu size={14} className="text-indigo-400" /> Decodificação/Codificação:
                </span>
                <span className="text-indigo-400 font-mono font-semibold">
                  Android MediaCodec ({settings.codec})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <HardDrive size={14} className="text-emerald-400" /> Armazenamento Alvo:
                </span>
                <span className="text-emerald-400 font-mono font-medium">
                  /storage/emulated/0/Movies/
                </span>
              </div>
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-slate-400">Taxa de Bits:</span>
                <span className="text-white font-mono font-bold">
                  {settings.bitrateMbps.toFixed(1)} Mbps
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
          <button
            onClick={onStartRender}
            className="flex-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Rocket size={16} />
            <span>Renderizar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
