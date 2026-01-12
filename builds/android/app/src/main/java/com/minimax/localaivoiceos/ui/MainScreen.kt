package com.minimax.localaivoiceos.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.WebView

@Composable
fun MainScreen() {
  var isRecording by remember { mutableStateOf(false) }
  var waveformData by remember { mutableStateOf(listOf<Float>()) }
  
  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(Color(0xFF0D0D0D))
      .padding(16.dp)
  ) {
    // Header
    Header()
    
    Spacer(modifier = Modifier.height(16.dp))
    
    // Waveform display
    WaveformDisplay(data = waveformData)
    
    Spacer(modifier = Modifier.height(16.dp))
    
    // Controls
    ControlsSection(
      isRecording = isRecording,
      onRecordToggle = {
        isRecording = !isRecording
        if (isRecording) {
          startAudioCapture()
        } else {
          stopAudioCapture()
        }
      }
    )
    
    Spacer(modifier = Modifier.height(16.dp))
    
    // Layer controls
    LayerControls()
    
    Spacer(modifier = Modifier.weight(1f))
    
    // AI Brain status
    AIBrainStatus()
  }
}

@Composable
fun Header() {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically
  ) {
    Text(
      text = "NeuralVoice OS",
      fontSize = 24.sp,
      fontWeight = FontWeight.Bold,
      color = Color(0xFF00F0FF)
    )
    
    Text(
      text = "v1.0.0",
      fontSize = 14.sp,
      color = Color.Gray
    )
  }
}

@Composable
fun WaveformDisplay(data: List<Float>) {
  Box(
    modifier = Modifier
      .fillMaxWidth()
      .height(120.dp)
      .clip(RoundedCornerShape(12.dp))
      .background(Color(0xFF1A1A1A))
  ) {
    if (data.isEmpty()) {
      // Draw placeholder waveform
      Canvas(modifier = Modifier.fillMaxSize()) {
        val path = Path()
        val centerY = size.height / 2
        
        for (x in 0 until size.width.toInt() step 2) {
          val y = centerY + (kotlin.math.sin(x * 0.05) * 20).toFloat()
          if (x == 0) {
            path.moveTo(x.toFloat(), y)
          } else {
            path.lineTo(x.toFloat(), y)
          }
        }
        
        drawPath(
          path = path,
          color = Color(0xFF00F0FF),
          style = Stroke(width = 2f)
        )
      }
    } else {
      // Draw actual waveform data
      Canvas(modifier = Modifier.fillMaxSize()) {
        val path = Path()
        val stepX = size.width / (data.size - 1).coerceAtLeast(1)
        
        for (i in data.indices) {
          val x = i * stepX
          val normalizedY = data[i].coerceIn(-1f, 1f)
          val y = size.height / 2 + (normalizedY * size.height / 3)
          
          if (i == 0) {
            path.moveTo(x, y)
          } else {
            path.lineTo(x, y)
          }
        }
        
        drawPath(
          path = path,
          color = Color(0xFF00F0FF),
          style = Stroke(width = 2f)
        )
      }
    }
  }
}

@Composable
fun ControlsSection(
  isRecording: Boolean,
  onRecordToggle: () -> Unit
) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.SpaceEvenly,
    verticalAlignment = Alignment.CenterVertically
  ) {
    // Record button
    FilledIconButton(
      onClick = onRecordToggle,
      modifier = Modifier.size(64.dp),
      colors = IconButtonDefaults.filledIconButtonColors(
        containerColor = if (isRecording) Color(0xFFFF4444) else Color(0xFF00F0FF)
      )
    ) {
      Text(
        text = if (isRecording) "STOP" else "REC",
        fontWeight = FontWeight.Bold,
        color = Color.Black
      )
    }
    
    // Play button
    FilledIconButton(
      onClick = { /* Play functionality */ },
      modifier = Modifier.size(56.dp),
      colors = IconButtonDefaults.filledIconButtonColors(
        containerColor = Color(0xFF00FF88)
      )
    ) {
      Text(
        text = "▶",
        fontWeight = FontWeight.Bold,
        color = Color.Black
      )
    }
    
    // Settings button
    FilledIconButton(
      onClick = { /* Open settings */ },
      modifier = Modifier.size(48.dp),
      colors = IconButtonDefaults.filledIconButtonColors(
        containerColor = Color(0xFF3D3D3D)
      )
    ) {
      Text(
        text = "⚙",
        color = Color.White
      )
    }
  }
}

@Composable
fun LayerControls() {
  Column(modifier = Modifier.fillMaxWidth()) {
    Text(
      text = "Voice Layers",
      fontSize = 16.sp,
      fontWeight = FontWeight.Bold,
      color = Color.White
    )
    
    Spacer(modifier = Modifier.height(8.dp))
    
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      repeat(3) { index ->
        LayerChip(
          name = if (index == 0) "Main" else "Layer ${index + 1}",
          isActive = index == 0
        )
      }
    }
  }
}

@Composable
fun LayerChip(name: String, isActive: Boolean) {
  Surface(
    color = if (isActive) Color(0xFF00F0FF).copy(alpha = 0.2f) else Color(0xFF2D2D2D),
    shape = RoundedCornerShape(8.dp),
    modifier = Modifier.padding(end = 8.dp)
  ) {
    Row(
      modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Box(
        modifier = Modifier
          .size(8.dp)
          .background(
            color = if (isActive) Color(0xFF00F0FF) else Color.Gray,
            shape = androidx.compose.foundation.shape.CircleShape
          )
      )
      Spacer(modifier = Modifier.width(8.dp))
      Text(
        text = name,
        color = Color.White,
        fontSize = 12.sp
      )
    }
  }
}

@Composable
fun AIBrainStatus() {
  Surface(
    color = Color(0xFF1A1A1A),
    shape = RoundedCornerShape(12.dp)
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(16.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Box(
        modifier = Modifier
          .size(40.dp)
          .background(
            brush = Brush.radialGradient(
              colors = listOf(
                Color(0xFF00F0FF),
                Color(0xFF00F0FF).copy(alpha = 0.5f)
              )
          ),
        shape = androidx.compose.foundation.shape.CircleShape
      )
      
      Spacer(modifier = Modifier.width(12.dp))
      
      Column {
        Text(
          text = "AI Brain",
          fontSize = 14.sp,
          fontWeight = FontWeight.Bold,
          color = Color.White
        )
        Text(
          text = "Learning your voice...",
          fontSize = 12.sp,
          color = Color.Gray
        )
      }
      
      Spacer(modifier = Modifier.weight(1f))
      
      LinearProgressIndicator(
        progress = { 0.65f },
        modifier = Modifier
          .width(80.dp)
          .height(4.dp)
          .clip(RoundedCornerShape(2.dp)),
        color = Color(0xFF00FF88),
        trackColor = Color(0xFF2D2D2D)
      )
    }
  }
}

// Audio capture simulation
private var audioJob: kotlinx.coroutines.Job? = null

private fun startAudioCapture() {
  // In a real implementation, this would start the AudioProcessingService
  // and collect waveform data via callback
}

private fun stopAudioCapture() {
  audioJob?.cancel()
  audioJob = null
}
