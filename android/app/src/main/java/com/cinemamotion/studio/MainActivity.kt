package com.cinemamotion.studio

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.content.ContextCompat
import com.cinemamotion.studio.ui.components.Indigo600
import com.cinemamotion.studio.ui.components.Slate900
import com.cinemamotion.studio.ui.components.Slate950
import com.cinemamotion.studio.ui.screens.VideoEditorScreen
import com.cinemamotion.studio.viewmodel.VideoEditorViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: VideoEditorViewModel by viewModels()

    private val requestNotificationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            // Permissão de notificação para o Foreground Service
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        checkPermissions()

        setContent {
            val darkColors = darkColorScheme(
                primary = Indigo600,
                background = Slate950,
                surface = Slate900,
                onPrimary = Color.White,
                onBackground = Color.White,
                onSurface = Color.White
            )

            MaterialTheme(colorScheme = darkColors) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Slate950
                ) {
                    VideoEditorScreen(viewModel = viewModel)
                }
            }
        }
    }

    private fun checkPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }
}
