import React from 'react';
import { Plus, Film, Trash2, Clock, Music, Play, Layers, Sparkles } from 'lucide-react';
import { VideoProject } from '../types';

interface DashboardProps {
  projects: VideoProject[];
  onOpenProject: (project: VideoProject) => void;
  onCreateNewProject: () => void;
  onDeleteProject: (projectId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onOpenProject,
  onCreateNewProject,
  onDeleteProject,
}) => {
  return (
    <div className="flex-1 w-full bg-[#020617] text-white p-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Film size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              CinemaMotion <span className="text-indigo-400">Studio Pro</span>
            </h1>
            <p className="text-xs text-slate-400">
              Dashboard de Projetos Android • Jetpack Compose & Media3
            </p>
          </div>
        </div>

        <button
          onClick={onCreateNewProject}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Criar Novo Projeto</span>
        </button>
      </div>

      {/* Projects Grid or Empty State */}
      <div className="max-w-6xl mx-auto pt-6">
        {projects.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-[#0f172a]/40 rounded-2xl border border-slate-800 p-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Layers size={32} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Nenhum projeto encontrado</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Comece a produzir vídeos cinematográficos com 20 transições dinâmicas CapCut e animações sincronizadas de câmera.
            </p>
            <button
              onClick={onCreateNewProject}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30"
            >
              <Plus size={16} />
              <span>Criar Meu Primeiro Projeto</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => {
              const totalSec = proj.clips.reduce((acc, c) => acc + c.duration, 0);
              return (
                <div
                  key={proj.id}
                  className="group rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden shadow-lg flex flex-col justify-between"
                >
                  {/* Thumbnail Banner */}
                  <div
                    onClick={() => onOpenProject(proj)}
                    className="h-36 relative cursor-pointer flex items-center justify-center p-4 overflow-hidden group-hover:brightness-105 transition-all"
                    style={{ background: proj.thumbnail }}
                  >
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] font-mono text-white border border-white/10">
                      {proj.aspectRatio}
                    </div>

                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-indigo-950/80 backdrop-blur text-[10px] font-mono text-indigo-300 border border-indigo-700/50">
                      {totalSec.toFixed(1)}s
                    </div>

                    <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 transition-all shadow-md">
                      <Play size={22} className="ml-0.5" />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h3
                        onClick={() => onOpenProject(proj)}
                        className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors cursor-pointer truncate"
                      >
                        {proj.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <Clock size={12} /> Modificado {proj.updatedAt}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-[11px] text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {proj.clips.length} clipes
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 truncate max-w-[120px]">
                          <Music size={12} /> {proj.audio.title.split(' ')[0]}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onDeleteProject(proj.id)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                          title="Excluir Projeto"
                        >
                          <Trash2 size={13} />
                        </button>
                        <button
                          onClick={() => onOpenProject(proj)}
                          className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Abrir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
