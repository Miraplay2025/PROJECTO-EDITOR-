import {
  AspectRatioConfig,
  CameraAnimationConfig,
  CapCutTransitionConfig,
  ExportResolutionOption,
  MediaClip,
  VideoProject,
} from '../types';

export const ASPECT_RATIOS: AspectRatioConfig[] = [
  { id: '16:9', label: '16:9', widthRatio: 16, heightRatio: 9, description: 'YouTube / Desktop' },
  { id: '9:16', label: '9:16', widthRatio: 9, heightRatio: 16, description: 'Reels / TikTok / Shorts' },
  { id: '1:1', label: '1:1', widthRatio: 1, heightRatio: 1, description: 'Feed Instagram / Quadrado' },
  { id: '4:5', label: '4:5', widthRatio: 4, heightRatio: 5, description: 'Retrato Instagram' },
  { id: '21:9', label: '21:9', widthRatio: 21, heightRatio: 9, description: 'Cinema UltraWide' },
];

export const CAMERA_ANIMATIONS: CameraAnimationConfig[] = [
  { id: 'NONE', title: 'Estático', description: 'Sem movimento de câmera' },
  { id: 'PAN_LEFT', title: 'Pan Esquerda', description: 'Deslocamento horizontal para a esquerda' },
  { id: 'PAN_RIGHT', title: 'Pan Direita', description: 'Deslocamento horizontal para a direita' },
  { id: 'TILT_UP', title: 'Tilt Cima', description: 'Movimentação vertical ascendente (grua)' },
  { id: 'TILT_DOWN', title: 'Tilt Baixo', description: 'Movimentação vertical descendente (grua)' },
  { id: 'PUSH_IN', title: 'Push In (Zoom +)', description: 'Aproximação progressiva e dinâmica de foco' },
  { id: 'PULL_OUT', title: 'Pull Out (Zoom -)', description: 'Afastamento progressivo revelando a cena' },
  { id: 'DOLLY_ZOOM', title: 'Dolly Zoom Pro', description: 'Efeito Vertigo combinando escala e compensação' },
  { id: 'KEN_BURNS', title: 'Ken Burns', description: 'Combinação harmoniosa de Pan suave e Zoom contínuo' },
];

export const CAPCUT_TRANSITIONS: CapCutTransitionConfig[] = [
  { id: 1, code: 'CROSS_DISSOLVE', title: 'Dissolvência Cruzada', description: 'Fusão linear e suave entre a mídia A e a mídia B', previewColor: '#6366f1' },
  { id: 2, code: 'FADE_BLACK', title: 'Fade com Flash Preto', description: 'Esmaecimento temporário para o preto na metade do tempo', previewColor: '#0f172a' },
  { id: 3, code: 'WHITE_FLASH', title: 'Flash Branco de Transição', description: 'Estouro de luz branca (overexposure) na troca de cena', previewColor: '#ffffff' },
  { id: 4, code: 'ZOOM_BLUR', title: 'Zoom In Desfocado', description: 'Aproximação rápida acompanhada de blur dinâmico', previewColor: '#38bdf8' },
  { id: 5, code: 'LIGHT_LEAK', title: 'Light Leak Glow CapCut', description: 'Overlay de vazamento de luz dourada/cinematográfica', previewColor: '#fbbf24' },
  { id: 6, code: 'FILM_FLASH', title: 'Film Flash Retro', description: 'Simulação de vinheta e estalo de filme analógico', previewColor: '#f97316' },
  { id: 7, code: 'LENS_BLUR', title: 'Lens Blur Mesclado', description: 'Desfocagem gaussiana de lente com transição de canal', previewColor: '#a855f7' },
  { id: 8, code: 'CHROMATIC_GLITCH', title: 'Chromatic Glitch Blend', description: 'Aberração cromática RGB com pulso digital', previewColor: '#ec4899' },
  { id: 9, code: 'SPIN_RADIAL', title: 'Spin Radial Blur', description: 'Rotação acelerada no eixo central com desfoque radial', previewColor: '#06b6d4' },
  { id: 10, code: 'PUSH_MOTION', title: 'Push Motion Blur', description: 'Empurrão lateral rápido com rastro de movimento', previewColor: '#10b981' },
  { id: 11, code: 'IRIS_ZOOM', title: 'Iris Circular Focus', description: 'Abertura/fechamento em íris focal cinematográfica', previewColor: '#3b82f6' },
  { id: 12, code: 'SPLIT_EXPAND', title: 'Split Vertical/Horizontal', description: 'Divisão dinâmica de tela com revelação A/B', previewColor: '#8b5cf6' },
  { id: 13, code: 'BLOOM_DREAM', title: 'Dreamy Bloom Glow', description: 'Vazamento difuso de altas luzes com atmosfera mágica', previewColor: '#f43f5e' },
  { id: 14, code: 'BOKEH_LIGHTS', title: 'Cinematic Bokeh Fade', description: 'Círculos de desfoque óptico orgânico entre as tomadas', previewColor: '#eab308' },
  { id: 15, code: 'GLITCH_ROLL', title: 'Vertical Glitch Roll', description: 'Salto de quadro sincronizado com ruído analógico', previewColor: '#14b8a6' },
  { id: 16, code: 'WHIP_PAN', title: 'Whip Pan Cinemático', description: 'Giro ultra-rápido de câmera simulando transição contínua', previewColor: '#64748b' },
  { id: 17, code: 'KALEIDO_BURST', title: 'Kaleidoscope Burst', description: 'Prisma caleidoscópico multifacetado', previewColor: '#d946ef' },
  { id: 18, code: 'PRISM_REFRACT', title: 'Prism Flare Refraction', description: 'Refração de espectro luminoso e prisma óptico', previewColor: '#0ea5e9' },
  { id: 19, code: 'RGB_SHAKE', title: 'Impact Camera Shake', description: 'Impacto com vibração de câmera e aberração nos eixos', previewColor: '#ef4444' },
  { id: 20, code: 'LUMA_FADE', title: 'Luma Matte Reveal', description: 'Transição gradual baseada nos tons de luminância', previewColor: '#e2e8f0' },
];

export const EXPORT_RESOLUTIONS: ExportResolutionOption[] = [
  { id: '240p', label: '240p', width: 426, height: 240, defaultBitrateMbps: 0.8, badge: 'Ultra Rápido' },
  { id: '480p', label: '480p', width: 854, height: 480, defaultBitrateMbps: 2.0, badge: 'SD Padrão' },
  { id: '720p', label: '720p (HD)', width: 1280, height: 720, defaultBitrateMbps: 5.0, badge: 'HD Equilibrado' },
  { id: '1080p', label: '1080p (Full HD)', width: 1920, height: 1080, defaultBitrateMbps: 10.0, badge: 'Full HD Master' },
];

export const INITIAL_CLIPS: MediaClip[] = [
  {
    id: 'clip-1',
    title: 'Pôr do Sol Dourado',
    duration: 4.0,
    cameraAnimation: 'KEN_BURNS',
    transitionToNext: 'CHROMATIC_GLITCH',
    type: 'gradient',
    src: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #7c3aed 100%)',
    colorTheme: '#f59e0b',
  },
  {
    id: 'clip-2',
    title: 'Metrópole Cyberpunk',
    duration: 4.0,
    cameraAnimation: 'DOLLY_ZOOM',
    transitionToNext: 'LIGHT_LEAK',
    type: 'gradient',
    src: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #9333ea 100%)',
    colorTheme: '#06b6d4',
  },
  {
    id: 'clip-3',
    title: 'Floresta com Neblina',
    duration: 4.0,
    cameraAnimation: 'PUSH_IN',
    transitionToNext: 'CROSS_DISSOLVE',
    type: 'gradient',
    src: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #064e3b 100%)',
    colorTheme: '#059669',
  },
  {
    id: 'clip-4',
    title: 'Ondas do Oceano',
    duration: 4.0,
    cameraAnimation: 'PAN_RIGHT',
    transitionToNext: 'ZOOM_BLUR',
    type: 'gradient',
    src: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #082f49 100%)',
    colorTheme: '#0284c7',
  },
];

export const SAMPLE_PROJECTS: VideoProject[] = [
  {
    id: 'proj-1',
    name: 'CinemaMotion Showreel 2026',
    aspectRatio: '16:9',
    clips: INITIAL_CLIPS,
    audio: {
      title: 'Synthwave Neon Horizon (48kHz)',
      isMuted: false,
      volume: 0.9,
      duration: 16.0,
    },
    thumbnail: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
    updatedAt: 'Hoje às 09:30',
  },
  {
    id: 'proj-2',
    name: 'Teaser Reels Fashion Week',
    aspectRatio: '9:16',
    clips: INITIAL_CLIPS.slice(0, 3),
    audio: {
      title: 'Lofi Beat Acoustic (48kHz)',
      isMuted: false,
      volume: 1.0,
      duration: 12.0,
    },
    thumbnail: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    updatedAt: 'Ontem às 18:15',
  },
  {
    id: 'proj-3',
    name: 'Campanha Comercial Square',
    aspectRatio: '1:1',
    clips: INITIAL_CLIPS.slice(0, 2),
    audio: {
      title: 'Corporate Ambient Energy',
      isMuted: false,
      volume: 0.8,
      duration: 8.0,
    },
    thumbnail: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    updatedAt: 'Há 2 dias',
  },
];
