/**
 * Audio Processing Library
 * Provides audio capture, processing, and analysis utilities
 */

class AudioProcessor {
  constructor(options = {}) {
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.isRecording = false;
    this.recordingStartTime = 0;
    
    this.options = {
      sampleRate: options.sampleRate || 16000,
      channelCount: options.channelCount || 1,
      bufferSize: options.bufferSize || 4096,
      echoCancellation: options.echoCancellation ?? true,
      noiseSuppression: options.noiseSuppression ?? true,
      autoGainControl: options.autoGainControl ?? true
    };

    this.audioBuffers = [];
    this.onDataCallback = null;
    this.onVolumeCallback = null;
    this.onStopCallback = null;
  }

  /**
   * Initialize audio context and request microphone access
   */
  async initialize() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass({
        sampleRate: this.options.sampleRate
      });

      const constraints = {
        audio: {
          sampleRate: { ideal: this.options.sampleRate },
          channelCount: { ideal: this.options.channelCount },
          echoCancellation: { ideal: this.options.echoCancellation },
          noiseSuppression: { ideal: this.options.noiseSuppression },
          autoGainControl: { ideal: this.options.autoGainControl }
        }
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.options.bufferSize;
      this.analyser.smoothingTimeConstant = 0.8;

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);

      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      throw new Error(`Audio initialization failed: ${error.message}`);
    }
  }

  /**
   * Start recording audio
   */
  async start() {
    if (!this.audioContext) {
      await this.initialize();
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isRecording = true;
    this.recordingStartTime = Date.now();
    this.audioBuffers = [];

    this.captureAudioData();
    this.monitorVolume();

    return true;
  }

  /**
   * Stop recording audio
   */
  async stop() {
    if (!this.isRecording) {
      return null;
    }

    this.isRecording = false;

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }

    if (this.onStopCallback) {
      const duration = Date.now() - this.recordingStartTime;
      this.onStopCallback(duration);
    }

    return this.getAudioBlob();
  }

  /**
   * Capture audio data from the stream
   */
  captureAudioData() {
    if (!this.isRecording) return;

    const processor = this.audioContext.createScriptProcessor(
      this.options.bufferSize,
      this.options.channelCount,
      this.options.channelCount
    );

    processor.onaudioprocess = (event) => {
      if (!this.isRecording) return;

      const inputData = event.inputBuffer.getChannelData(0);
      const processedData = this.processAudioData(inputData);
      
      this.audioBuffers.push(processedData);

      if (this.onDataCallback) {
        this.onDataCallback(processedData);
      }
    };

    this.mediaStream.connect(processor);
    processor.connect(this.audioContext.destination);
  }

  /**
   * Process audio data (apply filters, normalize, etc.)
   */
  processAudioData(audioData) {
    const processed = new Float32Array(audioData.length);
    
    // Apply noise reduction if enabled
    if (this.options.noiseSuppression) {
      this.applyNoiseReduction(processed, audioData);
    } else {
      processed.set(audioData);
    }

    // Normalize audio
    this.normalizeAudio(processed);

    return processed;
  }

  /**
   * Apply noise reduction to audio data
   */
  applyNoiseReduction(output, input) {
    const frameSize = 512;
    const frames = Math.ceil(input.length / frameSize);

    for (let i = 0; i < frames; i++) {
      const start = i * frameSize;
      const end = Math.min(start + frameSize, input.length);
      const frame = input.slice(start, end);
      
      // Simple spectral subtraction
      const magnitude = this.computeMagnitude(frame);
      const threshold = this.estimateNoiseFloor(magnitude);
      
      for (let j = start; j < end; j++) {
        const freq = j - start;
        const reduction = Math.max(0, 1 - threshold / (magnitude[freq] + 0.001));
        output[j] = input[j] * Math.pow(reduction, 0.5);
      }
    }
  }

  /**
   * Compute magnitude spectrum
   */
  computeMagnitude(signal) {
    const magnitude = new Float32Array(signal.length / 2);
    const real = new Float32Array(signal.length / 2);
    const imag = new Float32Array(signal.length / 2);
    
    // Simple magnitude approximation
    for (let i = 0; i < magnitude.length; i++) {
      magnitude[i] = Math.abs(signal[i]);
    }
    
    return magnitude;
  }

  /**
   * Estimate noise floor from audio data
   */
  estimateNoiseFloor(magnitude) {
    let sum = 0;
    for (let i = 0; i < magnitude.length; i++) {
      sum += magnitude[i];
    }
    return sum / magnitude.length;
  }

  /**
   * Normalize audio data
   */
  normalizeAudio(audioData) {
    let maxAmplitude = 0;
    for (let i = 0; i < audioData.length; i++) {
      maxAmplitude = Math.max(maxAmplitude, Math.abs(audioData[i]));
    }

    if (maxAmplitude > 0) {
      const gain = 0.95 / maxAmplitude;
      for (let i = 0; i < audioData.length; i++) {
        audioData[i] *= gain;
      }
    }
  }

  /**
   * Monitor input volume levels
   */
  monitorVolume() {
    if (!this.isRecording) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const amplitude = (dataArray[i] - 128) / 128;
      sum += amplitude * amplitude;
    }

    const rms = Math.sqrt(sum / dataArray.length);
    const volume = Math.min(1, rms * 2);

    if (this.onVolumeCallback) {
      this.onVolumeCallback(volume);
    }

    requestAnimationFrame(() => this.monitorVolume());
  }

  /**
   * Get current volume level
   */
  getVolume() {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const amplitude = (dataArray[i] - 128) / 128;
      sum += amplitude * amplitude;
    }

    return Math.sqrt(sum / dataArray.length);
  }

  /**
   * Get recorded audio as Blob
   */
  getAudioBlob() {
    if (this.audioBuffers.length === 0) {
      return null;
    }

    const totalLength = this.audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0);
    const mergedBuffer = new Float32Array(totalLength);
    let offset = 0;

    for (const buffer of this.audioBuffers) {
      mergedBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    // Convert to WAV format
    const wavBuffer = this.encodeWAV(mergedBuffer);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });

    return blob;
  }

  /**
   * Encode audio buffer to WAV format
   */
  encodeWAV(samples) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, this.options.sampleRate, true);
    view.setUint32(28, this.options.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Audio data
    const offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }

    return buffer;
  }

  /**
   * Write string to DataView
   */
  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /**
   * Get available audio input devices
   */
  async getInputDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'audioinput');
  }

  /**
   * Switch audio input device
   */
  async switchDevice(deviceId) {
    if (this.isRecording) {
      await this.stop();
    }

    this.options.deviceId = deviceId;
    return this.initialize();
  }

  /**
   * Register callback for audio data
   */
  onData(callback) {
    this.onDataCallback = callback;
  }

  /**
   * Register callback for volume changes
   */
  onVolume(callback) {
    this.onVolumeCallback = callback;
  }

  /**
   * Register callback for stop event
   */
  onStop(callback) {
    this.onStopCallback = callback;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isRecording = false;
  }
}

module.exports = AudioProcessor;
