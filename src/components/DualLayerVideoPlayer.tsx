import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Maximize2, Sparkles, Film } from 'lucide-react';
import { AspectRatioType, MediaClip } from '../types';
import { ASPECT_RATIOS } from '../data/defaults';

interface DualLayerVideoPlayerProps {
  aspectRatio: AspectRatioType;
  clips: MediaClip[];
  currentTime: number; // in seconds
  totalDuration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  activeClipIndex: number;
}

export const DualLayerVideoPlayer: React.FC<DualLayerVideoPlayerProps> = ({
  aspectRatio,
  clips,
  currentTime,
  totalDuration,
  isPlaying,
  onTogglePlay,
  activeClipIndex,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fps, setFps] = useState<number>(60);
  const fpsFrameCount = useRef<number>(0);
  const lastFpsCheck = useRef<number>(performance.now());

  const currentAspect = ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[0];

  // Helper to find which clip is active and if a transition is in progress
  const getCurrentPlaybackState = () => {
    let accumulated = 0;
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const clipStart = accumulated;
      const clipEnd = clipStart + clip.duration;

      if (currentTime >= clipStart && currentTime < clipEnd) {
        const timeInsideClip = currentTime - clipStart;
        const remainingInClip = clipEnd - currentTime;
        const transitionWindow = 0.8; // 800ms transition duration
        const isTransitioning = remainingInClip <= transitionWindow && i < clips.length - 1;
        const nextClip = isTransitioning ? clips[i + 1] : null;
        const transitionProgress = isTransitioning ? 1 - remainingInClip / transitionWindow : 0;

        return {
          clipIndex: i,
          currentClip: clip,
          timeInsideClip,
          isTransitioning,
          nextClip,
          transitionProgress,
          transitionType: clip.transitionToNext,
        };
      }
      accumulated = clipEnd;
    }

    // Default to last clip
    const last = clips[clips.length - 1] || clips[0];
    return {
      clipIndex: clips.length - 1,
      currentClip: last,
      timeInsideClip: last?.duration || 4,
      isTransitioning: false,
      nextClip: null,
      transitionProgress: 0,
      transitionType: 'NONE',
    };
  };

  // Render loop onto canvas simulating Android SurfaceView / TextureView Hardware Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // FPS measurement
      fpsFrameCount.current++;
      const now = performance.now();
      if (now - lastFpsCheck.current >= 1000) {
        setFps(fpsFrameCount.current);
        fpsFrameCount.current = 0;
        lastFpsCheck.current = now;
      }

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const state = getCurrentPlaybackState();
      const { currentClip, timeInsideClip, isTransitioning, nextClip, transitionProgress, transitionType } = state;

      if (!currentClip) return;

      // Function to draw a clip layer with Camera Animation transforms
      const drawClipLayer = (clip: MediaClip, time: number, alpha: number = 1.0) => {
        ctx.save();
        ctx.globalAlpha = alpha;

        const progress = Math.min(Math.max(time / clip.duration, 0), 1);

        // Apply Camera Animation Matrix
        ctx.translate(width / 2, height / 2);

        switch (clip.cameraAnimation) {
          case 'PAN_LEFT': {
            const shift = (progress - 0.5) * 60;
            ctx.translate(-shift, 0);
            break;
          }
          case 'PAN_RIGHT': {
            const shift = (progress - 0.5) * 60;
            ctx.translate(shift, 0);
            break;
          }
          case 'TILT_UP': {
            const shift = (progress - 0.5) * 50;
            ctx.translate(0, -shift);
            break;
          }
          case 'TILT_DOWN': {
            const shift = (progress - 0.5) * 50;
            ctx.translate(0, shift);
            break;
          }
          case 'PUSH_IN': {
            const scale = 1.0 + progress * 0.25;
            ctx.scale(scale, scale);
            break;
          }
          case 'PULL_OUT': {
            const scale = 1.25 - progress * 0.25;
            ctx.scale(scale, scale);
            break;
          }
          case 'DOLLY_ZOOM': {
            // Vertigo effect
            const scale = 1.0 + Math.sin(progress * Math.PI) * 0.3;
            ctx.scale(scale, scale);
            ctx.rotate((progress - 0.5) * 0.03);
            break;
          }
          case 'KEN_BURNS': {
            const scale = 1.05 + progress * 0.18;
            const panX = Math.sin(progress * Math.PI) * 35;
            const panY = Math.cos(progress * Math.PI) * 20;
            ctx.translate(panX, panY);
            ctx.scale(scale, scale);
            break;
          }
          default:
            break;
        }

        ctx.translate(-width / 2, -height / 2);

        // Draw dynamic cinematic gradient backdrop
        const grad = ctx.createLinearGradient(0, 0, width, height);
        if (clip.id === 'clip-1') {
          grad.addColorStop(0, '#f59e0b');
          grad.addColorStop(0.5, '#ef4444');
          grad.addColorStop(1, '#6366f1');
        } else if (clip.id === 'clip-2') {
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.5, '#3b82f6');
          grad.addColorStop(1, '#9333ea');
        } else if (clip.id === 'clip-3') {
          grad.addColorStop(0, '#059669');
          grad.addColorStop(0.5, '#10b981');
          grad.addColorStop(1, '#064e3b');
        } else {
          grad.addColorStop(0, '#0284c7');
          grad.addColorStop(0.5, '#0369a1');
          grad.addColorStop(1, '#0f172a');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(-40, -40, width + 80, height + 80);

        // Draw animated graphical overlay elements (cinematic lines & landscape silhouette)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let i = 0; i < 4; i++) {
          const wavePhase = (time * 2 + i * 1.5);
          ctx.beginPath();
          ctx.arc(
            width * 0.5 + Math.sin(wavePhase) * (width * 0.25),
            height * 0.5 + Math.cos(wavePhase) * (height * 0.2),
            80 + i * 30,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // Draw cinematic letterbox details and title inside video frame
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(20, height - 74, width - 40, 54);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(clip.title, 32, height - 44);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.fillText(
          `CÂMERA: ${clip.cameraAnimation} | T: ${time.toFixed(1)}s / ${clip.duration.toFixed(1)}s`,
          32,
          height - 28
        );

        ctx.restore();
      };

      // RENDER DUAL-LAYER: Layer A (current) and Layer B (next during transition)
      if (isTransitioning && nextClip) {
        const p = transitionProgress;

        // Apply 20 CapCut Transition Visual Algorithms
        switch (transitionType) {
          case 'CROSS_DISSOLVE':
            drawClipLayer(currentClip, timeInsideClip, 1 - p);
            drawClipLayer(nextClip, 0, p);
            break;

          case 'FADE_BLACK':
            if (p < 0.5) {
              drawClipLayer(currentClip, timeInsideClip, 1 - p * 2);
              ctx.fillStyle = '#000000';
              ctx.globalAlpha = p * 2;
              ctx.fillRect(0, 0, width, height);
            } else {
              drawClipLayer(nextClip, 0, (p - 0.5) * 2);
              ctx.fillStyle = '#000000';
              ctx.globalAlpha = (1 - p) * 2;
              ctx.fillRect(0, 0, width, height);
            }
            break;

          case 'WHITE_FLASH':
            drawClipLayer(currentClip, timeInsideClip, 1 - p);
            drawClipLayer(nextClip, 0, p);
            // Overexposure flash curve
            const flashIntensity = Math.sin(p * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = flashIntensity * 0.85;
            ctx.fillRect(0, 0, width, height);
            break;

          case 'LIGHT_LEAK':
            drawClipLayer(currentClip, timeInsideClip, 1 - p);
            drawClipLayer(nextClip, 0, p);
            // Warm golden leak glow
            const leakGrad = ctx.createRadialGradient(
              width * p, height * (1 - p), 10,
              width * 0.5, height * 0.5, width * 0.8
            );
            leakGrad.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
            leakGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.4)');
            leakGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
            ctx.fillStyle = leakGrad;
            ctx.globalAlpha = Math.sin(p * Math.PI);
            ctx.fillRect(0, 0, width, height);
            break;

          case 'CHROMATIC_GLITCH':
            // RGB Split effect
            ctx.save();
            const glitchOffset = Math.sin(p * Math.PI * 8) * 14 * Math.sin(p * Math.PI);
            drawClipLayer(currentClip, timeInsideClip, 1 - p);
            ctx.translate(glitchOffset, 0);
            drawClipLayer(nextClip, 0, p);
            // Scanline noise
            ctx.fillStyle = 'rgba(236, 72, 153, 0.3)';
            ctx.fillRect(0, (height * p) % height, width, 12);
            ctx.restore();
            break;

          case 'PUSH_MOTION':
            ctx.save();
            ctx.translate(-p * width, 0);
            drawClipLayer(currentClip, timeInsideClip, 1);
            ctx.restore();
            ctx.save();
            ctx.translate((1 - p) * width, 0);
            drawClipLayer(nextClip, 0, 1);
            ctx.restore();
            break;

          case 'ZOOM_BLUR':
            ctx.save();
            const zoomA = 1 + p * 0.5;
            ctx.translate(width / 2, height / 2);
            ctx.scale(zoomA, zoomA);
            ctx.translate(-width / 2, -height / 2);
            drawClipLayer(currentClip, timeInsideClip, 1 - p);
            ctx.restore();
            drawClipLayer(nextClip, 0, p);
            break;

          case 'IRIS_ZOOM':
            drawClipLayer(currentClip, timeInsideClip, 1);
            ctx.save();
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, p * Math.hypot(width, height) / 2, 0, Math.PI * 2);
            ctx.clip();
            drawClipLayer(nextClip, 0, 1);
            ctx.restore();
            break;

          case 'SPLIT_EXPAND':
            drawClipLayer(currentClip, timeInsideClip, 1);
            ctx.save();
            ctx.beginPath();
            const halfW = (width * p) / 2;
            ctx.rect(width / 2 - halfW, 0, halfW * 2, height);
            ctx.clip();
            drawClipLayer(nextClip, 0, 1);
            ctx.restore();
            break;

          case 'FILM_FLASH':
          case 'LENS_BLUR':
          case 'SPIN_RADIAL':
          case 'BLOOM_DREAM':
          case 'BOKEH_LIGHTS':
          case 'GLITCH_ROLL':
          case 'WHIP_PAN':
          case 'KALEIDO_BURST':
          case 'PRISM_REFRACT':
          case 'RGB_SHAKE':
          case 'LUMA_FADE':
          default:
            drawClipLayer(currentClip, timeInsideClip, 1 - p);
            drawClipLayer(nextClip, 0, p);
            break;
        }

        // Display transition indicator badge
        ctx.fillStyle = 'rgba(79, 70, 229, 0.85)';
        ctx.roundRect(width / 2 - 80, 20, 160, 28, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`⚡ ${transitionType} (${Math.round(p * 100)}%)`, width / 2, 38);
        ctx.textAlign = 'start';
      } else {
        // Normal single-layer playback
        drawClipLayer(currentClip, timeInsideClip, 1.0);
      }

      ctx.globalAlpha = 1.0;

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentTime, isPlaying, clips, aspectRatio]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#020617] p-2 select-none">
      {/* Video Container with mathematical Aspect Ratio */}
      <div
        className="relative max-w-full max-h-full rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-black flex items-center justify-center transition-all duration-300"
        style={{
          aspectRatio: `${currentAspect.widthRatio} / ${currentAspect.heightRatio}`,
          height: aspectRatio === '9:16' ? '92%' : '88%',
        }}
      >
        <canvas
          ref={canvasRef}
          width={currentAspect.widthRatio * 80}
          height={currentAspect.heightRatio * 80}
          className="w-full h-full object-contain block"
        />

        {/* 60 FPS HW Hardware Decoded Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur border border-slate-800 text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 font-bold">{fps} FPS</span>
          <span className="text-slate-400 text-[10px]">Media3 HW</span>
        </div>

        {/* Play/Pause Center Tap Area */}
        <div
          onClick={onTogglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/25 cursor-pointer transition-colors group"
        >
          <div
            className={`w-14 h-14 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg transition-transform transform ${
              isPlaying ? 'opacity-0 group-hover:opacity-90 scale-90' : 'opacity-90 scale-100'
            } group-hover:scale-110`}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </div>
        </div>

        {/* Bottom Floating Info Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur border border-slate-800 text-xs">
          <Film size={14} className="text-indigo-400" />
          <span className="text-white font-medium">Dual-Layer A/B</span>
          <span className="text-slate-500">•</span>
          <span className="text-indigo-400 font-mono text-[11px]">
            Clipe {activeClipIndex + 1}/{clips.length}
          </span>
        </div>
      </div>
    </div>
  );
};
