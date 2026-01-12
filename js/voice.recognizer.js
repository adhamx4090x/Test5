/**
 * Voice Recognition Module
 * Handles speech-to-text functionality using Web Speech API
 */

class VoiceRecognizer {
  constructor(options = {}) {
    this.recognition = null;
    this.isListening = false;
    this.isPaused = false;
    this.interimTranscript = '';
    this.finalTranscript = '';
    this.confidence = 0;
    
    this.options = {
      language: options.language || 'en-US',
      continuous: options.continuous ?? false,
      interimResults: options.interimResults ?? true,
      maxAlternatives: options.maxAlternatives || 3,
      profanityFilter: options.profanityFilter ?? false
    };

    this.onStartCallback = null;
    this.onEndCallback = null;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onAudioStartCallback = null;
    this.onAudioEndCallback = null;
  }

  /**
   * Initialize speech recognition
   */
  initialize() {
    if (!this.isSupported()) {
      throw new Error('Speech recognition is not supported in this browser');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.lang = this.options.language;
    this.recognition.continuous = this.options.continuous;
    this.recognition.interimResults = this.options.interimResults;
    this.recognition.maxAlternatives = this.options.maxAlternatives;
    this.recognition.profanityFilter = this.options.profanityFilter;

    this.setupEventHandlers();
    
    return this;
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported() {
    return ('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window);
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.recognition.onstart = () => {
      this.isListening = true;
      this.isPaused = false;
      if (this.onStartCallback) {
        this.onStartCallback();
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback(this.finalTranscript);
      }
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          this.confidence = Math.max(this.confidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.finalTranscript += finalTranscript;
      }

      this.interimTranscript = interimTranscript;

      if (this.onResultCallback) {
        this.onResultCallback({
          final: finalTranscript,
          interim: interimTranscript,
          full: this.finalTranscript,
          confidence: this.confidence
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };

    this.recognition.onaudiostart = () => {
      if (this.onAudioStartCallback) {
        this.onAudioStartCallback();
      }
    };

    this.recognition.onaudioend = () => {
      if (this.onAudioEndCallback) {
        this.onAudioEndCallback();
      }
    };
  }

  /**
   * Start listening for speech
   */
  start() {
    if (!this.recognition) {
      this.initialize();
    }

    if (this.isListening) {
      console.warn('Already listening');
      return false;
    }

    this.interimTranscript = '';
    this.finalTranscript = '';
    this.confidence = 0;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      return false;
    }
  }

  /**
   * Stop listening for speech
   */
  stop() {
    if (!this.recognition || !this.isListening) {
      return '';
    }

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Failed to stop recognition:', error);
    }

    return this.finalTranscript;
  }

  /**
   * Abort recognition
   */
  abort() {
    if (!this.recognition) return;
    
    try {
      this.recognition.abort();
    } catch (error) {
      console.error('Failed to abort recognition:', error);
    }
  }

  /**
   * Clear transcript
   */
  clear() {
    this.interimTranscript = '';
    this.finalTranscript = '';
    this.confidence = 0;
  }

  /**
   * Get current transcript
   */
  getTranscript() {
    return {
      interim: this.interimTranscript,
      final: this.finalTranscript,
      full: this.interimTranscript + this.finalTranscript,
      confidence: this.confidence
    };
  }

  /**
   * Check if currently listening
   */
  get isActive() {
    return this.isListening;
  }

  /**
   * Register callback for start event
   */
  onStart(callback) {
    this.onStartCallback = callback;
  }

  /**
   * Register callback for end event
   */
  onEnd(callback) {
    this.onEndCallback = callback;
  }

  /**
   * Register callback for result event
   */
  onResult(callback) {
    this.onResultCallback = callback;
  }

  /**
   * Register callback for error event
   */
  onError(callback) {
    this.onErrorCallback = callback;
  }

  /**
   * Register callback for audio start event
   */
  onAudioStart(callback) {
    this.onAudioStartCallback = callback;
  }

  /**
   * Register callback for audio end event
   */
  onAudioEnd(callback) {
    this.onAudioEndCallback = callback;
  }
}

module.exports = VoiceRecognizer;
