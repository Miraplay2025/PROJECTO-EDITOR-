package com.cinemamotion.studio.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.RocketLaunch
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.cinemamotion.studio.data.models.*

// Paleta Oficial CinemaMotion Studio Pro (Seção 2.1 do Manual)
val Slate950 = Color(0xFF020617) // Fundo Principal
val Slate900 = Color(0xFF0F172A) // Painéis e Módulos
val Slate800 = Color(0xFF1E293B)
val Slate700 = Color(0xFF334155)
val Indigo600 = Color(0xFF4F46E5) // Acentos e Destaques
val Indigo500 = Color(0xFF6366F1)
val Emerald600 = Color(0xFF059669) // Trilha de Áudio & Sucesso
val Rose500 = Color(0xFFF43F5E) // Playhead & Ações Destrutivas / Cancelar

/**
 * POP-UP 1: CONFIGURAÇÕES DE EXPORTAÇÃO / QUALIDADE
 * Disparado pelo botão destacado "Salvar Vídeo" no topo direito.
 */
@Composable
fun ExportSettingsDialog(
    currentConfig: ExportConfiguration,
    onResolutionSelected: (ExportResolution) -> Unit,
    onFpsSelected: (ExportFps) -> Unit,
    onBitrateSelected: (Float) -> Unit,
    onRenderClicked: () -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .wrapContentHeight()
                .border(1.dp, Slate700, RoundedCornerShape(16.dp)),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Slate900)
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .fillMaxWidth()
            ) {
                // Header com Título e Fechar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Movie,
                            contentDescription = null,
                            tint = Indigo500,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Exportar Vídeo (CinemaMotion)",
                            color = Color.White,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Fechar",
                            tint = Color.Gray
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Item A: 4 Opções de Resolução (240p, 480p, 720p, 1080p)
                Text(
                    text = "RESOLUÇÃO DE SAÍDA",
                    color = Color.LightGray,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    ExportResolution.values().forEach { res ->
                        val isSelected = currentConfig.resolution == res
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) Indigo600 else Slate800)
                                .border(
                                    width = 1.dp,
                                    color = if (isSelected) Indigo500 else Color.Transparent,
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .clickable { onResolutionSelected(res) }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = res.name.replace("RES_", ""),
                                color = if (isSelected) Color.White else Color.LightGray,
                                fontSize = 13.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Item B: Seleção de FPS (24, 30, 60 FPS)
                Text(
                    text = "TAXA DE QUADROS (FPS)",
                    color = Color.LightGray,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    ExportFps.values().forEach { fpsOption ->
                        val isSelected = currentConfig.fps == fpsOption
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) Indigo600 else Slate800)
                                .border(
                                    width = 1.dp,
                                    color = if (isSelected) Indigo500 else Color.Transparent,
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .clickable { onFpsSelected(fpsOption) }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "${fpsOption.fps} FPS",
                                color = if (isSelected) Color.White else Color.LightGray,
                                fontSize = 13.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Bitrate & Codec
                Text(
                    text = "BITRATE E ENCODER",
                    color = Color.LightGray,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Codec: H.264 / AVC por Hardware (MediaCodec) • Taxa: ${currentConfig.resolution.defaultBitrateMbps} Mbps",
                    color = Color.Gray,
                    fontSize = 12.sp
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Botões de Ação
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.LightGray),
                        border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(Slate700))
                    ) {
                        Text("Fechar")
                    }

                    Button(
                        onClick = onRenderClicked,
                        modifier = Modifier.weight(1.5f),
                        colors = ButtonDefaults.buttonColors(containerColor = Indigo600)
                    ) {
                        Icon(
                            imageVector = Icons.Default.RocketLaunch,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Renderizar",
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

/**
 * POP-UP 2: RENDERIZAÇÃO EM TEMPO REAL E LOGS
 * Mantém-se leve, responsivo (zero congelamento) e exibe StateFlow de progresso e logs.
 */
@Composable
fun RealTimeRenderLogsDialog(
    progressPercent: Int,
    logs: List<RenderLogEntry>,
    isCompleted: Boolean,
    savedPath: String?,
    onCancel: () -> Unit
) {
    val listState = rememberLazyListState()

    // Auto-scroll para a última mensagem de log
    LaunchedEffect(logs.size) {
        if (logs.isNotEmpty()) {
            listState.animateScrollToItem(logs.size - 1)
        }
    }

    Dialog(
        onDismissRequest = { /* Bloqueia toque fora durante renderização */ },
        properties = DialogProperties(dismissOnBackPress = false, dismissOnClickOutside = false, usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.70f)
                .border(1.dp, Slate700, RoundedCornerShape(16.dp)),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Slate900)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .fillMaxSize()
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = if (isCompleted) "Renderização Concluída!" else "Renderizando Vídeo...",
                            color = if (isCompleted) Emerald600 else Color.White,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Foreground Service • Media3 Transformer Pipeline",
                            color = Color.Gray,
                            fontSize = 11.sp
                        )
                    }

                    if (isCompleted) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Sucesso",
                            tint = Emerald600,
                            modifier = Modifier.size(28.dp)
                        )
                    } else {
                        CircularProgressIndicator(
                            progress = { progressPercent / 100f },
                            modifier = Modifier.size(28.dp),
                            color = Indigo500,
                            trackColor = Slate800,
                            strokeWidth = 3.dp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Item A: Barra de Progresso Real (0% a 100%)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Progresso da Codificação",
                        color = Color.LightGray,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = "$progressPercent%",
                        color = if (isCompleted) Emerald600 else Indigo500,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                LinearProgressIndicator(
                    progress = { progressPercent / 100f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = if (isCompleted) Emerald600 else Indigo600,
                    trackColor = Slate800
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Item B: Caixa de Logs em Tempo Real (Terminal com auto-scroll)
                Text(
                    text = "LOGS DO PROCESSAMENTO (ASYNC COROUTINES):",
                    color = Color.Gray,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                )

                Spacer(modifier = Modifier.height(6.dp))

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Slate950)
                        .border(1.dp, Slate800, RoundedCornerShape(8.dp))
                        .padding(10.dp)
                ) {
                    LazyColumn(
                        state = listState,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(logs) { entry ->
                            val color = when (entry.level) {
                                RenderLogEntry.LogLevel.SUCCESS -> Emerald600
                                RenderLogEntry.LogLevel.WARNING -> Color(0xFFFBBF24)
                                RenderLogEntry.LogLevel.ERROR -> Rose500
                                else -> Color(0xFF94A3B8)
                            }
                            Text(
                                text = "> ${entry.message}",
                                color = color,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                lineHeight = 16.sp,
                                modifier = Modifier.padding(vertical = 2.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Item C: Ações e Botão Cancelar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (isCompleted) {
                        Text(
                            text = "Salvo em: ${savedPath ?: "Movies/CinemaMotion/"}",
                            color = Emerald600,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.weight(1f)
                        )
                    } else {
                        Button(
                            onClick = onCancel,
                            colors = ButtonDefaults.buttonColors(containerColor = Rose500),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Cancelar Renderização",
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}
