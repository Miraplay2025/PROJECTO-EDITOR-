import React, { useState } from 'react';
import { X, Plus, Music, Film, Check, UploadCloud } from 'lucide-react';
import { AspectRatioType, MediaClip, VideoProject } from '../types';
import { ASPECT_RATIOS, INITIAL_CLIPS } from '../data/defaults';

interface ProjectWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: VideoProject) => void;
}

export const ProjectWizardModal: React.FC<ProjectWizardModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('Novo Vídeo CinemaMotion');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');
  const [audioTitle, setAudioTitle] = useState('Trilha Sonora Oficial (48kHz AAC)');
  const [clips, setClips] = useState<MediaClip[]>(INITIAL_CLIPS);

  if (!isOpen) return null;

  const handleFinish = () => {
    const newProj: VideoProject = {
      id: `proj-${Date.now()}`,
      name: name.trim() || 'Meu Vídeo CinemaMotion',
      aspectRatio,
      clips,
      audio: {
        title: audioTitle,
        isMuted: false,
        volume: 1.0,
        duration: clips.reduce((acc, c) => acc + c.duration, 0),
      },
      thumbnail: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
      updatedAt: 'Agora mesmo',
    };
    onCreateProject(newProj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f172a] border border-slate-700 shadow-2xl p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold">Criar Novo Projeto de Vídeo</h2>
            <p className="text-xs text-slate-400">Assistente CinemaMotion Studio Pro</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="py-4 space-y-4 text-xs">
          {/* 1. Nome do Projeto */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              1. Nome do Projeto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-xs"
              placeholder="Ex: Teaser Cinematográfico 4K"
            />
          </div>

          {/* 2. Proporção */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              2. Proporção Inicial da Tela
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.slice(0, 3).map((ratio) => {
                const isSelected = aspectRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <div>{ratio.label}</div>
                    <div className="text-[10px] opacity-70">{ratio.description.split(' ')[0]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Mídias Importadas */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              3. Mídias Selecionadas ({clips.length} clipes)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {clips.map((clip, i) => (
                <div
                  key={clip.id}
                  className="h-16 rounded-lg p-1.5 flex flex-col justify-between text-[10px] border border-slate-700 relative overflow-hidden"
                  style={{ background: clip.src }}
                >
                  <span className="font-bold bg-black/50 px-1 rounded truncate text-white">
                    #{i + 1}
                  </span>
                  <span className="bg-black/50 px-1 rounded text-slate-300 font-mono text-[9px]">
                    {clip.duration}s
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Trilha Sonora */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              4. Trilha Sonora (Opcional MP3 / WAV)
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 border border-slate-700">
              <Music size={16} className="text-emerald-400 shrink-0" />
              <input
                type="text"
                value={audioTitle}
                onChange={(e) => setAudioTitle(e.target.value)}
                className="w-full bg-transparent text-white focus:outline-none text-xs"
                placeholder="Nome da música"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleFinish}
            className="flex-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <Film size={15} />
            <span>Abrir no Editor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
