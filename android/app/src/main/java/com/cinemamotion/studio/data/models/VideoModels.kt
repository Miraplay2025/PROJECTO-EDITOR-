package com.cinemamotion.studio.data.models

import android.net.Uri

/**
 * Proporções suportadas pelo CinemaMotion Studio Pro
 */
enum class AspectRatio(val label: String, val widthRatio: Float, val heightRatio: Float) {
    RATIO_16_9("16:9 (YouTube)", 16f, 9f),
    RATIO_9_16("9:16 (Reels/TikTok)", 9f, 16f),
    RATIO_1_1("1:1 (Quadrado)", 1f, 1f),
    RATIO_4_5("4:5 (Instagram)", 4f, 5f),
    RATIO_21_9("21:9 (Cinema)", 21f, 9f)
}

/**
 * Modos de Animação de Câmera Dinâmica (Seção 4.1 do manual)
 */
enum class CameraAnimation(val title: String, val description: String) {
    NONE("Estático", "Sem movimentação de câmera"),
    PAN_LEFT("Pan Esquerda", "Deslocamento horizontal para a esquerda"),
    PAN_RIGHT("Pan Direita", "Deslocamento horizontal para a direita"),
    TILT_UP("Tilt Cima", "Movimentação vertical para cima (grua)"),
    TILT_DOWN("Tilt Baixo", "Movimentação vertical para baixo (grua)"),
    PUSH_IN("Push In (Zoom +)", "Aproximação progressiva de foco"),
    PULL_OUT("Pull Out (Zoom -)", "Afastamento progressivo de foco"),
    DOLLY_ZOOM_PRO("Dolly Zoom Pro", "Efeito Vertigo avançado com escala e compensação"),
    KEN_BURNS("Ken Burns Cinematográfico", "Combinação harmoniosa de Pan suave e Zoom contínuo")
}

/**
 * Catálogo completo de 20 Transições Avançadas Estilo CapCut Pro (Seção 4.2 do manual)
 */
enum class CapCutTransition(val id: Int, val title: String, val effectDescription: String) {
    NONE(0, "Nenhuma", "Corte seco direto"),
    CROSS_DISSOLVE(1, "Dissolvência Cruzada", "Fusão linear e suave entre a mídia A e B"),
    FADE_BLACK(2, "Fade com Flash Preto", "Esmaecimento temporário para preto na metade"),
    WHITE_FLASH(3, "Flash Branco de Transição", "Estouro de luz branca (overexposure) na troca"),
    ZOOM_BLUR(4, "Zoom In Desfocado", "Aproximação ultra-rápida com blur dinâmico"),
    LIGHT_LEAK(5, "Light Leak Glow CapCut", "Overlay de vazamento de luz dourada/cinematográfica"),
    FILM_FLASH(6, "Film Flash Retro", "Simulação de vinheta e estalo de filme analógico"),
    LENS_BLUR(7, "Lens Blur Mesclado", "Desfocagem gaussiana de lente com transição de canal"),
    CHROMATIC_GLITCH(8, "Chromatic Glitch Blend", "Aberração cromática RGB com pulso digital"),
    SPIN_RADIAL(9, "Spin Radial Blur", "Rotação acelerada no eixo central com desfoque radial"),
    PUSH_MOTION(10, "Push Motion Blur", "Empurrão lateral rápido com rastro de movimento"),
    IRIS_ZOOM(11, "Iris Circular Focus", "Abertura/fechamento em íris focal cinematográfica"),
    SPLIT_EXPAND(12, "Split Vertical/Horizontal", "Divisão dinâmica de tela com revelação A/B"),
    BLOOM_DREAM(13, "Dreamy Bloom Glow", "Vazamento difuso de altas luzes com atmosfera mágica"),
    BOKEH_LIGHTS(14, "Cinematic Bokeh Fade", "Círculos de desfoque óptico orgânico entre as tomadas"),
    GLITCH_ROLL(15, "Vertical Glitch Roll", "Salto de quadro sincronizado com ruído analógico"),
    WHIP_PAN(16, "Whip Pan Cinemático", "Giro ultra-rápido de câmera simulando transição contínua"),
    KALEIDO_BURST(17, "Kaleidoscope Burst", "Prisma caleidoscópico multifacetado"),
    PRISM_REFRACT(18, "Prism Flare Refraction", "Refração de espectro luminoso e prisma óptico"),
    RGB_SHAKE(19, "Impact Camera Shake", "Impacto com vibração de câmera e aberração nos eixos"),
    LUMA_FADE(20, "Luma Matte Reveal", "Transição gradual baseada nos tons de luminância")
}

/**
 * Resoluções para Pop-up 1 (Configurações de Exportação)
 */
enum class ExportResolution(val label: String, val width: Int, val height: Int, val defaultBitrateMbps: Float) {
    RES_240P("240p (Muito Rápido)", 426, 240, 0.8f),
    RES_480P("480p (Padrão Web)", 854, 480, 2.0f),
    RES_720P("720p (HD Alta Performance)", 1280, 720, 5.0f),
    RES_1080P("1080p (Full HD Master)", 1920, 1080, 10.0f)
}

enum class ExportFps(val fps: Int, val label: String) {
    FPS_24(24, "24 FPS (Cinematográfico)"),
    FPS_30(30, "30 FPS (Padrão Mobile)"),
    FPS_60(60, "60 FPS (Ultra Fluido / Suave)")
}

enum class VideoCodec(val label: String, val mimeType: String) {
    H264("H.264 / AVC (Compatibilidade Total)", "video/avc"),
    H265("H.265 / HEVC (Alta Eficiência)", "video/hevc")
}

data class ExportConfiguration(
    val resolution: ExportResolution = ExportResolution.RES_720P,
    val fps: ExportFps = ExportFps.FPS_60,
    val codec: VideoCodec = VideoCodec.H264,
    val bitrateMbps: Float = 5.0f
)

data class MediaClip(
    val id: String,
    val uri: Uri,
    val name: String,
    val durationSeconds: Float = 4.0f,
    val cameraAnimation: CameraAnimation = CameraAnimation.NONE,
    val transitionToNext: CapCutTransition = CapCutTransition.CROSS_DISSOLVE,
    val transitionDurationSeconds: Float = 0.8f,
    val thumbnailUri: Uri? = null
)

data class AudioTrack(
    val uri: Uri?,
    val title: String = "Trilha de Fundo",
    val isMuted: Boolean = false,
    val volume: Float = 1.0f
)

data class RenderLogEntry(
    val timestamp: Long = System.currentTimeMillis(),
    val message: String,
    val level: LogLevel = LogLevel.INFO
) {
    enum class LogLevel { INFO, PROGRESS, WARNING, SUCCESS, ERROR }
}

sealed class RenderProgressState {
    object Idle : RenderProgressState()
    data class Rendering(val progressPercent: Int, val currentFrame: Int, val totalFrames: Int) : RenderProgressState()
    data class Success(val savedPath: String, val fileSizeMb: Float) : RenderProgressState()
    data class Error(val errorMessage: String) : RenderProgressState()
    object Cancelled : RenderProgressState()
}
