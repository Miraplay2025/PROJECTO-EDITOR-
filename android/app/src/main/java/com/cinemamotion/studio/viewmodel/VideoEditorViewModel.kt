package com.cinemamotion.studio.viewmodel

import android.app.Application
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.net.Uri
import android.os.IBinder
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cinemamotion.studio.data.models.AspectRatio
import com.cinemamotion.studio.data.models.AudioTrack
import com.cinemamotion.studio.data.models.CameraAnimation
import com.cinemamotion.studio.data.models.CapCutTransition
import com.cinemamotion.studio.data.models.ExportConfiguration
import com.cinemamotion.studio.data.models.ExportFps
import com.cinemamotion.studio.data.models.ExportResolution
import com.cinemamotion.studio.data.models.MediaClip
import com.cinemamotion.studio.data.models.RenderLogEntry
import com.cinemamotion.studio.data.models.RenderProgressState
import com.cinemamotion.studio.service.VideoRenderForegroundService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

data class EditorUiState(
    val projectName: String = "CinemaMotion Vídeo #1",
    val aspectRatio: AspectRatio = AspectRatio.RATIO_16_9,
    val isPlaying: Boolean = false,
    val currentPositionMs: Long = 0L,
    val totalDurationMs: Long = 12000L,
    val clips: List<MediaClip> = emptyList(),
    val selectedClipIndex: Int? = 0,
    val selectedTransitionIndex: Int? = null,
    val audioTrack: AudioTrack = AudioTrack(uri = null, isMuted = false),
    // Pop-up 1: Configurações de Exportação
    val showExportModal: Boolean = false,
    val exportConfig: ExportConfiguration = ExportConfiguration(),
    // Pop-up 2: Renderização em tempo real e Logs
    val showRenderModal: Boolean = false,
    val renderProgressPercent: Int = 0,
    val renderLogs: List<RenderLogEntry> = emptyList(),
    val isRenderComplete: Boolean = false,
    val exportedFilePath: String? = null
)

class VideoEditorViewModel(application: Application) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(EditorUiState())
    val uiState: StateFlow<EditorUiState> = _uiState.asStateFlow()

    private var playbackJob: Job? = null
    private var renderService: VideoRenderForegroundService? = null
    private var isBound = false

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as VideoRenderForegroundService.LocalBinder
            renderService = binder.getService()
            isBound = true

            // Observa o StateFlow e logs emitidos pelo serviço em background
            viewModelScope.launch {
                renderService?.renderState?.collect { state ->
                    when (state) {
                        is RenderProgressState.Rendering -> {
                            _uiState.value = _uiState.value.copy(
                                renderProgressPercent = state.progressPercent
                            )
                        }
                        is RenderProgressState.Success -> {
                            _uiState.value = _uiState.value.copy(
                                renderProgressPercent = 100,
                                isRenderComplete = true,
                                exportedFilePath = state.savedPath
                            )
                            // Auto-fechamento do Pop-up 2 com delay para confirmação visual
                            delay(1800)
                            closeRenderModal()
                        }
                        is RenderProgressState.Cancelled -> {
                            closeRenderModal()
                        }
                        else -> Unit
                    }
                }
            }

            viewModelScope.launch {
                renderService?.logsFlow?.collect { log ->
                    val updatedLogs = _uiState.value.renderLogs + log
                    _uiState.value = _uiState.value.copy(renderLogs = updatedLogs)
                }
            }
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            renderService = null
            isBound = false
        }
    }

    init {
        loadDefaultSampleProject()
    }

    private fun loadDefaultSampleProject() {
        val sampleClips = listOf(
            MediaClip(
                id = "clip-1",
                uri = Uri.parse("asset:///sample_sunset.mp4"),
                name = "Tomada Aérea Sunset",
                durationSeconds = 4.0f,
                cameraAnimation = CameraAnimation.KEN_BURNS,
                transitionToNext = CapCutTransition.CHROMATIC_GLITCH
            ),
            MediaClip(
                id = "clip-2",
                uri = Uri.parse("asset:///sample_city.mp4"),
                name = "Metrópole Noturna",
                durationSeconds = 4.0f,
                cameraAnimation = CameraAnimation.DOLLY_ZOOM_PRO,
                transitionToNext = CapCutTransition.LIGHT_LEAK
            ),
            MediaClip(
                id = "clip-3",
                uri = Uri.parse("asset:///sample_nature.mp4"),
                name = "Floresta Neblina",
                durationSeconds = 4.0f,
                cameraAnimation = CameraAnimation.PUSH_IN,
                transitionToNext = CapCutTransition.CROSS_DISSOLVE
            )
        )
        _uiState.value = _uiState.value.copy(
            clips = sampleClips,
            totalDurationMs = 12000L
        )
    }

    // ==========================================
    // CONTROLES DE REPRODUÇÃO (ZERO CONGELAMENTO)
    // ==========================================
    fun togglePlayPause() {
        val isCurrentlyPlaying = _uiState.value.isPlaying
        if (isCurrentlyPlaying) {
            playbackJob?.cancel()
            _uiState.value = _uiState.value.copy(isPlaying = false)
        } else {
            _uiState.value = _uiState.value.copy(isPlaying = true)
            startPlaybackLoop()
        }
    }

    private fun startPlaybackLoop() {
        playbackJob?.cancel()
        playbackJob = viewModelScope.launch(Dispatchers.Default) {
            val stepMs = 16L // ~60 FPS suave sem travar UI
            while (isActive && _uiState.value.isPlaying) {
                delay(stepMs)
                val newPos = _uiState.value.currentPositionMs + stepMs
                if (newPos >= _uiState.value.totalDurationMs) {
                    _uiState.value = _uiState.value.copy(currentPositionMs = 0L, isPlaying = false)
                    break
                } else {
                    _uiState.value = _uiState.value.copy(currentPositionMs = newPos)
                }
            }
        }
    }

    fun seekTo(positionMs: Long) {
        _uiState.value = _uiState.value.copy(
            currentPositionMs = positionMs.coerceIn(0L, _uiState.value.totalDurationMs)
        )
    }

    fun setAspectRatio(ratio: AspectRatio) {
        _uiState.value = _uiState.value.copy(aspectRatio = ratio)
    }

    fun selectClip(index: Int) {
        _uiState.value = _uiState.value.copy(selectedClipIndex = index, selectedTransitionIndex = null)
    }

    fun selectTransition(index: Int) {
        _uiState.value = _uiState.value.copy(selectedTransitionIndex = index, selectedClipIndex = null)
    }

    fun updateSelectedClipAnimation(animation: CameraAnimation) {
        val index = _uiState.value.selectedClipIndex ?: return
        val currentClips = _uiState.value.clips.toMutableList()
        if (index in currentClips.indices) {
            currentClips[index] = currentClips[index].copy(cameraAnimation = animation)
            _uiState.value = _uiState.value.copy(clips = currentClips)
        }
    }

    fun updateSelectedClipDuration(durationSec: Float) {
        val index = _uiState.value.selectedClipIndex ?: return
        val currentClips = _uiState.value.clips.toMutableList()
        if (index in currentClips.indices) {
            currentClips[index] = currentClips[index].copy(durationSeconds = durationSec)
            val total = (currentClips.sumOf { it.durationSeconds.toDouble() } * 1000).toLong()
            _uiState.value = _uiState.value.copy(clips = currentClips, totalDurationMs = total)
        }
    }

    fun updateSelectedTransition(transition: CapCutTransition) {
        val index = _uiState.value.selectedTransitionIndex ?: return
        val currentClips = _uiState.value.clips.toMutableList()
        if (index in currentClips.indices) {
            currentClips[index] = currentClips[index].copy(transitionToNext = transition)
            _uiState.value = _uiState.value.copy(clips = currentClips)
        }
    }

    fun toggleAudioMute() {
        val current = _uiState.value.audioTrack
        _uiState.value = _uiState.value.copy(audioTrack = current.copy(isMuted = !current.isMuted))
    }

    // ==========================================
    // POP-UP 1: CONFIGURAÇÕES DE EXPORTAÇÃO
    // ==========================================
    fun openExportModal() {
        // Pausa vídeo antes de abrir modal
        if (_uiState.value.isPlaying) {
            togglePlayPause()
        }
        _uiState.value = _uiState.value.copy(showExportModal = true)
    }

    fun closeExportModal() {
        _uiState.value = _uiState.value.copy(showExportModal = false)
    }

    fun updateExportResolution(resolution: ExportResolution) {
        _uiState.value = _uiState.value.copy(
            exportConfig = _uiState.value.exportConfig.copy(resolution = resolution)
        )
    }

    fun updateExportFps(fps: ExportFps) {
        _uiState.value = _uiState.value.copy(
            exportConfig = _uiState.value.exportConfig.copy(fps = fps)
        )
    }

    fun updateExportBitrate(bitrate: Float) {
        _uiState.value = _uiState.value.copy(
            exportConfig = _uiState.value.exportConfig.copy(bitrateMbps = bitrate)
        )
    }

    // ==========================================
    // POP-UP 2: RENDERIZAÇÃO EM BACKGROUND & LOGS
    // ==========================================
    fun startRenderProcess(context: Context) {
        // Fecha Pop-up 1 e abre imediatamente Pop-up 2
        _uiState.value = _uiState.value.copy(
            showExportModal = false,
            showRenderModal = true,
            renderProgressPercent = 0,
            renderLogs = emptyList(),
            isRenderComplete = false,
            exportedFilePath = null
        )

        // Inicia o Foreground Service no Android
        val serviceIntent = Intent(context, VideoRenderForegroundService::class.java).apply {
            action = VideoRenderForegroundService.ACTION_START_EXPORT
        }
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent)
        } else {
            context.startService(serviceIntent)
        }
        context.bindService(serviceIntent, serviceConnection, Context.BIND_AUTO_CREATE)
    }

    fun cancelRenderProcess(context: Context) {
        renderService?.cancelRendering()
        if (isBound) {
            context.unbindService(serviceConnection)
            isBound = false
        }
        closeRenderModal()
    }

    fun closeRenderModal() {
        _uiState.value = _uiState.value.copy(showRenderModal = false)
    }

    override fun onCleared() {
        super.onCleared()
        playbackJob?.cancel()
        if (isBound) {
            getApplication<Application>().unbindService(serviceConnection)
        }
    }
}
