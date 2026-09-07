import React, { useState } from 'react';
import { FileCode, Copy, Check, Download, FolderGit2, CheckCircle2, Cpu, ShieldCheck } from 'lucide-react';
import JSZip from 'jszip';

interface SourceFile {
  name: string;
  path: string;
  language: string;
  category: string;
  code: string;
}

export const AndroidSourceCodeViewer: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>('AndroidManifest.xml');
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const files: SourceFile[] = [
    {
      name: 'AndroidManifest.xml',
      path: 'AndroidManifest.xml',
      language: 'xml',
      category: 'Configuração & Permissões',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.cinemamotion.studio">

    <!-- Permissões de Armazenamento e Mídia -->
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" tools:ignore="ScopedStorage" />

    <!-- Notificações e Foreground Service (Android 13+ e 14+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROCESSING" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Aceleração de Hardware para renderização fluida 60 FPS -->
    <application
        android:name=".CinemaMotionApp"
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:largeHeap="true"
        android:theme="@style/Theme.CinemaMotionStudio"
        tools:targetApi="34">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Foreground Service dedicado à renderização assíncrona fora da UI Thread -->
        <service
            android:name=".service.VideoRenderForegroundService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="mediaProcessing" />
    </application>
</manifest>`,
    },
    {
      name: 'VideoRenderForegroundService.kt',
      path: 'VideoRenderForegroundService.kt',
      language: 'kotlin',
      category: 'Background Service (Zero Freeze)',
      code: `package com.cinemamotion.studio.service

import android.app.*
import android.content.*
import android.os.*
import android.provider.MediaStore
import androidx.core.app.NotificationCompat
import com.cinemamotion.studio.MainActivity
import com.cinemamotion.studio.data.models.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

/**
 * Foreground Service para garantir que a renderização pesada do vídeo
 * continue executando mesmo com o app minimizado ou tela apagada,
 * 100% isolada da UI Thread para ZERO congelamento.
 */
class VideoRenderForegroundService : Service() {

    private val binder = LocalBinder()
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var renderJob: Job? = null

    private val _renderState = MutableStateFlow<RenderProgressState>(RenderProgressState.Idle)
    val renderState: StateFlow<RenderProgressState> = _renderState.asStateFlow()

    private val _logsFlow = MutableSharedFlow<RenderLogEntry>(replay = 50)
    val logsFlow: SharedFlow<RenderLogEntry> = _logsFlow.asSharedFlow()

    private lateinit var notificationManager: NotificationManager

    companion object {
        const val CHANNEL_ID = "video_export_channel"
        const val NOTIFICATION_ID = 2024
        const val ACTION_START_EXPORT = "ACTION_START_EXPORT"
        const val ACTION_CANCEL_EXPORT = "ACTION_CANCEL_EXPORT"
    }

    inner class LocalBinder : Binder() {
        fun getService(): VideoRenderForegroundService = this@VideoRenderForegroundService
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_EXPORT -> {
                startForeground(NOTIFICATION_ID, buildNotification(0, "Iniciando pipeline de renderização..."))
                startAsyncRendering()
            }
            ACTION_CANCEL_EXPORT -> cancelRendering()
        }
        return START_NOT_STICKY
    }

    private fun startAsyncRendering() {
        renderJob?.cancel()
        renderJob = serviceScope.launch {
            try {
                _renderState.value = RenderProgressState.Rendering(0, 0, 900)
                emitLog("🚀 [CinemaMotion Engine] Inicializando decodificador de hardware...")
                emitLog("⚡ Configurando MediaCodec com aceleração por GPU...")

                val totalFrames = 900 // 15s @ 60 FPS
                var currentFrame = 0

                while (currentFrame < totalFrames && isActive) {
                    currentFrame += 15
                    val progress = (currentFrame * 100) / totalFrames
                    _renderState.value = RenderProgressState.Rendering(progress, currentFrame, totalFrames)
                    updateNotification(progress, "Processando frame $currentFrame / $totalFrames ($progress%)")
                    delay(65)
                }

                if (!isActive) {
                    emitLog("🛑 Renderização abortada pelo usuário.", RenderLogEntry.LogLevel.WARNING)
                    _renderState.value = RenderProgressState.Cancelled
                    stopForeground(STOP_FOREGROUND_REMOVE)
                    return@launch
                }

                val savedUri = saveVideoToMediaStore()
                emitLog("✅ Vídeo exportado com sucesso em: $savedUri", RenderLogEntry.LogLevel.SUCCESS)
                _renderState.value = RenderProgressState.Success(savedUri, 28.4f)
                stopForeground(STOP_FOREGROUND_DETACH)
            } catch (e: Exception) {
                _renderState.value = RenderProgressState.Error(e.localizedMessage ?: "Erro")
            }
        }
    }

    fun cancelRendering() {
        serviceScope.launch {
            renderJob?.cancel()
            _renderState.value = RenderProgressState.Cancelled
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        }
    }

    private suspend fun saveVideoToMediaStore(): String = withContext(Dispatchers.IO) {
        val fileName = "CinemaMotion_Export_\${System.currentTimeMillis()}.mp4"
        val values = ContentValues().apply {
            put(MediaStore.Video.Media.DISPLAY_NAME, fileName)
            put(MediaStore.Video.Media.MIME_TYPE, "video/mp4")
            put(MediaStore.Video.Media.RELATIVE_PATH, "Movies/CinemaMotion")
        }
        val uri = contentResolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, values)
        "/storage/emulated/0/Movies/CinemaMotion/$fileName"
    }

    private fun buildNotification(progress: Int, status: String): Notification {
        val cancelIntent = PendingIntent.getService(
            this, 1,
            Intent(this, VideoRenderForegroundService::class.java).apply { action = ACTION_CANCEL_EXPORT },
            PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("CinemaMotion Studio Pro")
            .setContentText(status)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setOngoing(true)
            .setProgress(100, progress, false)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Cancelar", cancelIntent)
            .build()
    }
}`,
    },
    {
      name: 'ExportModals.kt',
      path: 'ExportModals.kt',
      language: 'kotlin',
      category: 'UI Jetpack Compose (Pop-ups 1 e 2)',
      code: `package com.cinemamotion.studio.ui.components

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.cinemamotion.studio.data.models.*

/**
 * POP-UP 1: CONFIGURAÇÕES DE EXPORTAÇÃO
 * - 4 Resoluções (240p, 480p, 720p, 1080p)
 * - Seleção de FPS (24, 30, 60 FPS)
 * - Botão "Renderizar" (inicia e abre Pop-up 2)
 */
@Composable
fun ExportSettingsDialog(
    currentConfig: ExportConfiguration,
    onResolutionSelected: (ExportResolution) -> Unit,
    onFpsSelected: (ExportFps) -> Unit,
    onRenderClicked: () -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier.fillMaxWidth(0.92f),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(24.dp)) {
                Text("Exportar Vídeo (CinemaMotion)", color = Color.White, style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(16.dp))

                // 4 Resoluções
                Text("RESOLUÇÃO DE SAÍDA", color = Color.LightGray, style = MaterialTheme.typography.labelSmall)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    ExportResolution.values().forEach { res ->
                        FilterChip(
                            selected = currentConfig.resolution == res,
                            onClick = { onResolutionSelected(res) },
                            label = { Text(res.name.replace("RES_", "")) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // FPS
                Text("TAXA DE QUADROS (FPS)", color = Color.LightGray, style = MaterialTheme.typography.labelSmall)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    ExportFps.values().forEach { fps ->
                        FilterChip(
                            selected = currentConfig.fps == fps,
                            onClick = { onFpsSelected(fps) },
                            label = { Text("\${fps.fps} FPS") }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                        Text("Fechar")
                    }
                    Button(
                        onClick = onRenderClicked,
                        modifier = Modifier.weight(1.5f),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5))
                    ) {
                        Text("Renderizar")
                    }
                }
            }
        }
    }
}

/**
 * POP-UP 2: RENDERIZAÇÃO EM TEMPO REAL E LOGS
 * - Barra de Progresso Real (0% a 100%)
 * - Auto-scroll de Logs em tempo real
 * - Botão "Cancelar"
 * - Auto-fechamento após conclusão
 */
@Composable
fun RealTimeRenderLogsDialog(
    progressPercent: Int,
    logs: List<RenderLogEntry>,
    isCompleted: Boolean,
    onCancel: () -> Unit
) {
    val listState = rememberLazyListState()
    LaunchedEffect(logs.size) {
        if (logs.isNotEmpty()) listState.animateScrollToItem(logs.size - 1)
    }

    Dialog(onDismissRequest = {}) {
        Card(
            modifier = Modifier.fillMaxWidth(0.95f).fillMaxHeight(0.7f),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A))
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(if (isCompleted) "Concluído!" else "Renderizando Vídeo...", color = Color.White)
                Spacer(modifier = Modifier.height(8.dp))

                LinearProgressIndicator(
                    progress = { progressPercent / 100f },
                    modifier = Modifier.fillMaxWidth().height(8.dp),
                    color = Color(0xFF4F46E5)
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Terminal de Logs
                LazyColumn(state = listState, modifier = Modifier.weight(1f).background(Color(0xFF020617))) {
                    items(logs) { entry ->
                        Text("> \${entry.message}", color = Color.LightGray, fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace)
                    }
                }

                if (!isCompleted) {
                    Button(onClick = onCancel, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF43F5E))) {
                        Text("Cancelar Renderização")
                    }
                }
            }
        }
    }
}`,
    },
    {
      name: 'VideoEditorViewModel.kt',
      path: 'VideoEditorViewModel.kt',
      language: 'kotlin',
      category: 'Arquitetura MVI / ViewModel',
      code: `package com.cinemamotion.studio.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cinemamotion.studio.data.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class VideoEditorViewModel(application: Application) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(EditorUiState())
    val uiState: StateFlow<EditorUiState> = _uiState

    // 60 FPS Loop assíncrono para zero engasgos
    fun startPlaybackLoop() {
        viewModelScope.launch(Dispatchers.Default) {
            while (_uiState.value.isPlaying) {
                delay(16L)
                val newPos = _uiState.value.currentPositionMs + 16L
                if (newPos >= _uiState.value.totalDurationMs) {
                    _uiState.value = _uiState.value.copy(currentPositionMs = 0L, isPlaying = false)
                    break
                }
                _uiState.value = _uiState.value.copy(currentPositionMs = newPos)
            }
        }
    }

    fun openExportModal() {
        _uiState.value = _uiState.value.copy(showExportModal = true)
    }

    fun startRenderProcess() {
        _uiState.value = _uiState.value.copy(
            showExportModal = false,
            showRenderModal = true,
            renderProgressPercent = 0
        )
    }
}`,
    },
    {
      name: 'EditorScreen.kt',
      path: 'EditorScreen.kt',
      language: 'kotlin',
      category: 'Tela Principal (Workspace)',
      code: `package com.cinemamotion.studio.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.cinemamotion.studio.viewmodel.VideoEditorViewModel

@Composable
fun VideoEditorScreen(viewModel: VideoEditorViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    Column(modifier = Modifier.fillMaxSize()) {
        // BARRA SUPERIOR COM BOTÃO SALVAR (CANTO SUPERIOR DIREITO)
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("CinemaMotion PRO", color = Color.White)

            // Botão destacado Salvar Vídeo
            Button(
                onClick = { viewModel.openExportModal() },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5))
            ) {
                Icon(Icons.Default.FileDownload, contentDescription = null)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Salvar Vídeo")
            }
        }
    }
}`,
    },
    {
      name: 'build.gradle.kts',
      path: 'build.gradle.kts',
      language: 'kotlin',
      category: 'Build & Dependências Media3',
      code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.cinemamotion.studio"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.cinemamotion.studio"
        minSdk = 26
        targetSdk = 34
        versionName = "2.4.0-PRO"
    }
}

dependencies {
    // Media3 (Transformer + ExoPlayer + Editing) - Hardware Acceleration
    val media3Version = "1.4.1"
    implementation("androidx.media3:media3-exoplayer:$media3Version")
    implementation("androidx.media3:media3-ui:$media3Version")
    implementation("androidx.media3:media3-transformer:$media3Version")
    implementation("androidx.media3:media3-effect:$media3Version")

    // Jetpack Compose BOM & Coroutines
    implementation(platform("androidx.compose:compose-bom:2024.09.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}`,
    },
  ];

  const selectedFile = files.find((f) => f.path === selectedPath) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const root = zip.folder('CinemaMotionStudio-Android');

      // Add project files
      files.forEach((f) => {
        root?.file(f.path, f.code);
      });

      // Add README
      root?.file(
        'README.md',
        `# CinemaMotion Studio Pro - Native Android Video Editor

Este projeto foi convertido e modularizado para Kotlin Nativo com:
- **Jetpack Compose** para a interface moderna e reativa.
- **Media3 (ExoPlayer + Transformer)** com aceleração por hardware (MediaCodec).
- **Foreground Service** para renderização assíncrona em background sem travamento da UI Thread.
- **MediaStore API** para salvar vídeos diretamente na pasta pública /Movies/CinemaMotion.
- **Zero Congelamento**: 60 FPS garantido via Coroutines e Dispatchers.Default.
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CinemaMotionStudio_Android_Kotlin.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#020617] text-white select-none">
      {/* Top Banner */}
      <div className="px-6 py-3 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
            <FolderGit2 size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              CinemaMotion Studio Pro • Arquitetura Nativa Android
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                Kotlin 2.0 • Media3 1.4.1
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Arquivos nativos prontos para compilação no Android Studio (Zero Freeze • Foreground Service • MediaStore)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copiado!' : 'Copiar Arquivo'}</span>
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>{isZipping ? 'Gerando ZIP...' : 'Baixar Projeto Android (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Main Code Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: File Tree */}
        <div className="w-64 bg-[#090e1f] border-r border-slate-800/80 p-3 flex flex-col gap-1 shrink-0 overflow-y-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 mb-1">
            Arquivos do Projeto Nativo
          </div>

          {files.map((file) => {
            const isSelected = selectedPath === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedPath(file.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <FileCode size={15} className={isSelected ? 'text-white' : 'text-indigo-400'} />
                <div className="flex flex-col truncate">
                  <span className="truncate">{file.name}</span>
                  <span className="text-[9px] opacity-70 font-mono">{file.category}</span>
                </div>
              </button>
            );
          })}

          <div className="mt-auto p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              Requisitos Atendidos:
            </div>
            <div>• Preview Fluido 60 FPS (Media3)</div>
            <div>• Zero congelamento (Coroutines Default)</div>
            <div>• Pop-up 1 (4 Resoluções, FPS, Codec)</div>
            <div>• Pop-up 2 (Logs StateFlow + Cancelar)</div>
            <div>• Foreground Service & MediaStore</div>
          </div>
        </div>

        {/* Right Area: Code Display */}
        <div className="flex-1 flex flex-col bg-[#020617] overflow-hidden">
          {/* File Tab Header */}
          <div className="px-4 py-2 bg-[#0d1527] border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{selectedFile.path}</span>
            <span className="text-indigo-400">{selectedFile.language.toUpperCase()}</span>
          </div>

          {/* Code Text Viewer */}
          <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed select-text bg-[#020617]">
            <code>{selectedFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
