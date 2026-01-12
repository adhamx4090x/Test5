package com.minimax.localaivoiceos

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import android.media.audiofx.Visualizer
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder

class AudioProcessingService : Service() {
  
  private var audioRecord: AudioRecord? = null
  private var visualizer: Visualizer? = null
  private var isProcessing = false
  
  companion object {
    const val CHANNEL_ID = "audio_processing_channel"
    const val NOTIFICATION_ID = 1001
    const val ACTION_START = "com.minimax.localaivoiceos.START_PROCESSING"
    const val ACTION_STOP = "com.minimax.localaivoiceos.STOP_PROCESSING"
  }
  
  override fun onCreate() {
    super.onCreate()
    createNotificationChannel()
  }
  
  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_START -> startProcessing()
      ACTION_STOP -> stopProcessing()
    }
    return START_STICKY
  }
  
  override fun onBind(intent: Intent?): IBinder? = null
  
  private fun createNotificationChannel() {
    val channel = NotificationChannel(
      CHANNEL_ID,
      "Audio Processing",
      NotificationManager.IMPORTANCE_LOW
    ).apply {
      description = "NeuralVoice OS audio processing service"
      setShowBadge(false)
    }
    
    val notificationManager = getSystemService(NotificationManager::class.java)
    notificationManager.createNotificationChannel(channel)
  }
  
  private fun startProcessing() {
    if (isProcessing) return
    
    val notification = NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("NeuralVoice OS")
      .setContentText("Processing audio...")
      .setSmallIcon(android.R.drawable.ic_btn_speak_now)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .setOngoing(true)
      .build()
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }
    
    isProcessing = true
    initializeAudioRecording()
  }
  
  private fun stopProcessing() {
    isProcessing = false
    releaseAudioResources()
    stopForeground(STOP_FOREGROUND_REMOVE)
    stopSelf()
  }
  
  private fun initializeAudioRecording() {
    val sampleRate = 48000
    val channelConfig = AudioFormat.CHANNEL_IN_MONO
    val audioFormat = AudioFormat.ENCODING_PCM_16BIT
    val bufferSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat) * 2
    
    try {
      audioRecord = AudioRecord(
        MediaRecorder.AudioSource.MIC,
        sampleRate,
        channelConfig,
        audioFormat,
        bufferSize
      )
      
      audioRecord?.startRecording()
      
      // Start reading audio data
      readAudioData(bufferSize)
      
    } catch (e: SecurityException) {
      // Handle microphone permission denied
      stopProcessing()
    } catch (e: Exception) {
      // Handle other audio errors
      stopProcessing()
    }
  }
  
  private fun readAudioData(bufferSize: Int) {
    if (!isProcessing) return
    
    val buffer = ShortArray(bufferSize / 2)
    
    try {
      val readCount = audioRecord?.read(buffer, 0, buffer.size) ?: -1
      
      if (readCount > 0) {
        // Process audio data here
        processAudioData(buffer, readCount)
        
        // Continue reading
        android.os.Handler(mainLooper).post { readAudioData(bufferSize) }
      } else {
        stopProcessing()
      }
      
    } catch (e: Exception) {
      stopProcessing()
    }
  }
  
  private fun processAudioData(data: ShortArray, length: Int) {
    // Calculate RMS (Root Mean Square) for visualization
    var sum = 0.0
    for (i in 0 until length) {
      sum += data[i] * data[i]
    }
    val rms = Math.sqrt(sum / length) / Short.MAX_VALUE
    
    // Calculate frequency centroid for color visualization
    var weightedSum = 0.0
    var totalEnergy = 0.0
    
    for (i in 0 until length) {
      val frequency = i.toDouble() * 48000 / (2 * length)
      val energy = (data[i] * data[i]).toDouble()
      weightedSum += frequency * energy
      totalEnergy += energy
    }
    
    val centroid = if (totalEnergy > 0) weightedSum / totalEnergy else 0.0
    
    // Send data to web view via JavaScript interface
    // This would be implemented with a WebView.evaluateJavascript call
  }
  
  private fun releaseAudioResources() {
    audioRecord?.stop()
    audioRecord?.release()
    audioRecord = null
    
    visualizer?.release()
    visualizer = null
  }
  
  override fun onDestroy() {
    stopProcessing()
    super.onDestroy()
  }
}
