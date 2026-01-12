package com.minimax.localaivoiceos.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// NeuralVoice OS Color Palette
val CyanPrimary = Color(0xFF00F0FF)
val CyanSecondary = Color(0xFF00F0FF).copy(alpha = 0.7f)
val GreenAccent = Color(0xFF00FF88)
val PurpleAccent = Color(0xFFA855F7)
val PinkAccent = Color(0xFFFF44AA)

val DarkBackground = Color(0xFF0D0D0D)
val DarkSurface = Color(0xFF1A1A1A)
val DarkSurfaceVariant = Color(0xFF2D2D2D)

private val DarkColorScheme = darkColorScheme(
  primary = CyanPrimary,
  onPrimary = Color.Black,
  primaryContainer = CyanPrimary.copy(alpha = 0.2f),
  onPrimaryContainer = CyanPrimary,
  
  secondary = GreenAccent,
  onSecondary = Color.Black,
  secondaryContainer = GreenAccent.copy(alpha = 0.2f),
  onSecondaryContainer = GreenAccent,
  
  tertiary = PurpleAccent,
  onTertiary = Color.White,
  tertiaryContainer = PurpleAccent.copy(alpha = 0.2f),
  onTertiaryContainer = PurpleAccent,
  
  background = DarkBackground,
  onBackground = Color.White,
  
  surface = DarkSurface,
  onSurface = Color.White,
  surfaceVariant = DarkSurfaceVariant,
  onSurfaceVariant = Color.White.copy(alpha = 0.7f),
  
  outline = Color.White.copy(alpha = 0.2f),
  outlineVariant = Color.White.copy(alpha = 0.1f),
  
  error = Color(0xFFFF4444),
  onError = Color.White
)

private val LightColorScheme = lightColorScheme(
  primary = CyanPrimary,
  onPrimary = Color.Black,
  primaryContainer = CyanPrimary.copy(alpha = 0.2f),
  onPrimaryContainer = CyanPrimary,
  
  secondary = GreenAccent,
  onSecondary = Color.Black,
  secondaryContainer = GreenAccent.copy(alpha = 0.2f),
  onSecondaryContainer = GreenAccent,
  
  tertiary = PurpleAccent,
  onTertiary = Color.White,
  tertiaryContainer = PurpleAccent.copy(alpha = 0.2f),
  onTertiaryContainer = PurpleAccent,
  
  background = Color.White,
  onBackground = Color.Black,
  
  surface = Color(0xFFF5F5F5),
  onSurface = Color.Black,
  surfaceVariant = Color(0xFFE0E0E0),
  onSurfaceVariant = Color.Black.copy(alpha = 0.7f),
  
  outline = Color.Black.copy(alpha = 0.2f),
  outlineVariant = Color.Black.copy(alpha = 0.1f),
  
  error = Color(0xFFFF4444),
  onError = Color.White
)

@Composable
fun LocalAIVoiceOSTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  dynamicColor: Boolean = false,
  content: @Composable () -> Unit
) {
  val colorScheme = when {
    dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
      val context = LocalContext.current
      if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
    }
    darkTheme -> DarkColorScheme
    else -> LightColorScheme
  }
  
  val view = LocalView.current
  if (!view.isInEditMode) {
    SideEffect {
      val window = (view.context as Activity).window
      window.statusBarColor = colorScheme.background.toArgb()
      WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
    }
  }

  MaterialTheme(
    colorScheme = colorScheme,
    typography = Typography(),
    content = content
  )
}
