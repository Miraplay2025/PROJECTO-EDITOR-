export type AspectRatioType = '16:9' | '9:16' | '1:1' | '4:5' | '21:9';

export interface AspectRatioConfig {
  id: AspectRatioType;
  label: string;
  widthRatio: number;
  heightRatio: number;
  description: string;
}

export type CameraAnimationType =
  | 'NONE'
  | 'PAN_LEFT'
  | 'PAN_RIGHT'
  | 'TILT_UP'
  | 'TILT_DOWN'
  | 'PUSH_IN'
  | 'PULL_OUT'
  | 'DOLLY_ZOOM'
  | 'KEN_BURNS';

export interface CameraAnimationConfig {
  id: CameraAnimationType;
  title: string;
  description: string;
}

export interface CapCutTransitionConfig {
  id: number;
  code: string;
  title: string;
  description: string;
  previewColor: string;
}

export type ExportResolutionType = '240p' | '480p' | '720p' | '1080p';

export interface ExportResolutionOption {
  id: ExportResolutionType;
  label: string;
  width: number;
  height: number;
  defaultBitrateMbps: number;
  badge: string;
}

export type ExportFpsType = 24 | 30 | 60;

export interface ExportSettings {
  resolution: ExportResolutionType;
  fps: ExportFpsType;
  codec: 'H.264 / AVC' | 'H.265 / HEVC';
  bitrateMbps: number;
}

export interface MediaClip {
  id: string;
  title: string;
  duration: number; // in seconds (e.g. 4.0)
  cameraAnimation: CameraAnimationType;
  transitionToNext: string; // code of CapCutTransition
  type: 'image' | 'video' | 'gradient';
  src: string;
  colorTheme: string;
}

export interface AudioTrackConfig {
  title: string;
  isMuted: boolean;
  volume: number;
  duration: number;
}

export interface RenderLog {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'progress' | 'warning' | 'success' | 'error';
}

export interface VideoProject {
  id: string;
  name: string;
  aspectRatio: AspectRatioType;
  clips: MediaClip[];
  audio: AudioTrackConfig;
  thumbnail: string;
  updatedAt: string;
}
