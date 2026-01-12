/**
 * Local AI Voice Operating System - Core Application
 * Neural Audio Workstation with Local AI Brain
 */

class NeuralVoiceOS {
    constructor() {
        // Core State
        this.state = {
            isPlaying: false,
            isRecording: false,
            isPaused: false,
            currentTime: 0,
            totalDuration: 0,
            zoomLevel: 100,
            controlMode: 'macro', // macro, micro, nano
            creativityMode: false,
            projectType: 'general',
            selectedLayer: 0,
            selectedWord: null
        };

        // Audio Context and Nodes
        this.audioContext = null;
        this.masterGain = null;
        this.analyser = null;
        this.effects = {};
        this.effectChain = [];
        
        // Voice Layers
        this.layers = [];
        this.currentLayerIndex = 0;
        
        // History (Undo/Redo)
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 100;
        
        // AI Brain
        this.aiBrain = {
            isActive: false,
            learningProgress: 0,
            context: {},
            patterns: [],
            suggestions: [],
            preferences: {}
        };
        
        // Project Intelligence
        this.projectIntelligence = {
            type: 'general',
            workflow: [],
            recommendations: []
        };
        
        // Text-Voice
        this.textInput = '';
        this.voiceProfiles = [];
        
        // UI Elements (cached)
        this.ui = {};
        
        // Initialize
        this.init();
    }

    async init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupTheme();
        this.updateOfflineStatus();
        this.initializeAI();
        this.renderWaveforms();
        this.startAIAnalysis();
        
        // Register Service Worker
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('sw.js');
                this.showToast('NeuralVoice OS ready', 'success');
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    cacheElements() {
        // Core UI
        this.ui.cortexBar = document.querySelector('.cortex-bar');
        this.ui.workspace = document.querySelector('.workspace');
        this.ui.playPauseBtn = document.getElementById('playPauseBtn');
        this.ui.stopBtn = document.getElementById('stopBtn');
        this.ui.recordBtn = document.getElementById('recordBtn');
        this.ui.currentTime = document.getElementById('currentTime');
        this.ui.totalTime = document.getElementById('totalTime');
        this.ui.playbackMode = document.getElementById('playbackMode');
        
        // AI Elements
        this.ui.aiCortex = document.getElementById('aiCortex');
        this.ui.aiState = document.getElementById('aiState');
        this.ui.learningMetric = document.getElementById('learningMetric');
        this.ui.contextMetric = document.getElementById('contextMetric');
        this.ui.aiSuggestions = document.getElementById('aiSuggestions');
        this.ui.learningInsights = document.getElementById('learningInsights');
        this.ui.creativityIdeas = document.getElementById('creativityIdeas');
        this.ui.creativityToggle = document.getElementById('creativityToggle');
        this.ui.creativityPanel = document.getElementById('creativityPanel');
        
        // Project Selector
        this.ui.projectTypeBtn = document.getElementById('projectTypeBtn');
        this.ui.currentProjectType = document.getElementById('currentProjectType');
        this.ui.projectDropdown = document.getElementById('projectDropdown');
        
        // Controls
        this.ui.pitchSlider = document.getElementById('pitchSlider');
        this.ui.formantSlider = document.getElementById('formantSlider');
        this.ui.breathSlider = document.getElementById('breathSlider');
        this.ui.timingSlider = document.getElementById('timingSlider');
        this.ui.emotionWheel = document.getElementById('emotionWheel');
        this.ui.modeBtns = document.querySelectorAll('.mode-btn');
        this.ui.emotionBtns = document.querySelectorAll('.emotion-btn');
        this.ui.presetBtns = document.querySelectorAll('.preset-btn');
        
        // Timeline
        this.ui.layersContainer = document.getElementById('layersContainer');
        this.ui.playhead = document.getElementById('playhead');
        this.ui.timelineRuler = document.getElementById('timelineRuler');
        this.ui.addLayerBtn = document.getElementById('addLayerBtn');
        
        // Text Editor
        this.ui.textInput = document.getElementById('textInput');
        this.ui.wordTimeline = document.getElementById('wordTimeline');
        
        // History
        this.ui.undoBtn = document.getElementById('undoBtn');
        this.ui.redoBtn = document.getElementById('redoBtn');
        this.ui.historyCount = document.getElementById('historyCount');
        this.ui.historyTimeline = document.getElementById('historyTimeline');
        
        // System Monitor
        this.ui.cpuUsage = document.getElementById('cpuUsage');
        this.ui.ramUsage = document.getElementById('ramUsage');
        this.ui.modelStatus = document.getElementById('modelStatus');
        
        // Toasts
        this.ui.toastContainer = document.getElementById('toastContainer');
    }

    setupEventListeners() {
        // Transport Controls
        this.setupControl('playPauseBtn', () => this.togglePlayPause());
        this.setupControl('stopBtn', () => this.stop());
        this.setupControl('recordBtn', () => this.toggleRecording());
        this.setupControl('skipBackBtn', () => this.skip(-5));
        this.setupControl('skipForwardBtn', () => this.skip(5));
        this.setupControl('rewindBtn', () => this.skip(-10));
        
        // Zoom Controls
        this.setupControl('zoomInBtn', () => this.zoomIn());
        this.setupControl('zoomOutBtn', () => this.zoomOut());
        this.setupControl('loopBtn', () => this.toggleLoop());
        
        // Project Type Selector
        this.ui.projectTypeBtn?.addEventListener('click', () => {
            this.ui.projectDropdown?.classList.toggle('visible');
        });
        
        // Project Type Options
        document.querySelectorAll('.project-option').forEach(option => {
            option.addEventListener('click', () => {
                this.setProjectType(option.dataset.type);
                this.ui.projectDropdown?.classList.remove('visible');
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.project-selector')) {
                this.ui.projectDropdown?.classList.remove('visible');
            }
        });
        
        // AI Cortex Toggle
        this.ui.creativityToggle?.addEventListener('click', () => this.toggleCreativityMode());
        
        // Control Modes
        this.ui.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.ui.modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setControlMode(btn.dataset.mode);
            });
        });
        
        // Emotion Buttons
        this.ui.emotionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.ui.emotionBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setEmotion(btn.dataset.emotion);
            });
        });
        
        // Formant Presets
        this.ui.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.ui.presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.applyFormantPreset(btn.dataset.preset);
            });
        });
        
        // Precision Sliders
        this.setupPrecisionSlider('pitchSlider', 'pitch', -24, 24, '');
        this.setupPrecisionSlider('formantSlider', 'formant', -12, 12, '');
        this.setupPrecisionSlider('breathSlider', 'breath', 0, 100, '%');
        this.setupPrecisionSlider('timingSlider', 'timing', 0.25, 4, 'x');
        
        // Text Input
        this.ui.textInput?.addEventListener('input', (e) => {
            this.textInput = e.target.value;
            this.debouncedUpdateText();
        });
        
        // Word Timeline
        this.ui.wordTimeline?.addEventListener('click', (e) => {
            if (e.target.classList.contains('word')) {
                this.selectWord(e.target);
            }
        });
        
        // Layer Controls
        this.ui.addLayerBtn?.addEventListener('click', () => this.addLayer());
        
        // History Controls
        this.ui.undoBtn?.addEventListener('click', () => this.undo());
        this.ui.redoBtn?.addEventListener('click', () => this.redo());
        
        // Apply Button
        document.getElementById('applyEffectsBtn')?.addEventListener('click', () => this.applyAllChanges());
        document.getElementById('resetControlsBtn')?.addEventListener('click', () => this.resetControls());
        
        // Input Modal Buttons
        document.getElementById('micInputBtn')?.addEventListener('click', () => this.openMicrophone());
        document.getElementById('fileInputBtn')?.addEventListener('click', () => this.openFilePicker());
        document.getElementById('ttsInputBtn')?.addEventListener('click', () => this.generateTTS());
        
        // Export Button
        document.getElementById('doExportBtn')?.addEventListener('click', () => this.exportProject());
        
        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Modal Close
        document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });
    }

    setupControl(id, handler) {
        const element = document.getElementById(id);
        if (element) element.addEventListener('click', handler);
    }

    setupPrecisionSlider(elementId, param, min, max, suffix) {
        const slider = document.getElementById(elementId);
        if (!slider) return;

        const track = slider.querySelector('.slider-track');
        const handle = slider.querySelector('.slider-handle');
        const fill = slider.querySelector('.slider-fill');
        
        let isDragging = false;
        
        const updateSlider = (clientX) => {
            const rect = track.getBoundingClientRect();
            let percentage = (clientX - rect.left) / rect.width;
            percentage = Math.max(0, Math.min(1, percentage));
            
            const value = min + percentage * (max - min);
            const displayValue = param === 'timing' ? value.toFixed(2) : Math.round(value);
            
            handle.style.left = `${percentage * 100}%`;
            fill.style.width = `${percentage * 100}%`;
            
            const valueEl = document.getElementById(`${param}Value`);
            if (valueEl) valueEl.textContent = displayValue + suffix;
            
            slider.dataset.value = value;
            this.updateEffect(param, value);
            
            // Update precision inputs
            this.updatePrecisionInputs(param, value);
        };
        
        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) updateSlider(e.clientX);
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.addToHistory(`Adjust ${param}`);
            }
        });
        
        // Click on track
        track.addEventListener('click', (e) => {
            updateSlider(e.clientX);
            this.addToHistory(`Adjust ${param}`);
        });
    }

    updatePrecisionInputs(param, value) {
        if (param === 'pitch') {
            const semitones = document.getElementById('pitchSemitones');
            const cents = document.getElementById('pitchCents');
            const hz = document.getElementById('pitchHz');
            if (semitones) semitones.value = Math.round(value);
            if (cents) cents.value = Math.round((value % 1) * 100);
            if (hz) hz.value = (440 * Math.pow(2, value / 12)).toFixed(2);
        }
    }

    // Audio Context
    async initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                latencyHint: 'interactive',
                sampleRate: 48000
            });
            
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.8;
            this.masterGain.connect(this.audioContext.destination);
            
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.connect(this.masterGain);
        }
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // Transport Controls
    async togglePlayPause() {
        await this.initAudioContext();
        
        if (this.state.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.ui.playPauseBtn?.classList.add('playing');
        this.ui.playbackMode.textContent = 'PLAYING';
        this.showToast('Playback started', 'info');
        this.startVisualization();
    }

    pause() {
        this.state.isPlaying = false;
        this.state.isPaused = true;
        this.ui.playPauseBtn?.classList.remove('playing');
        this.ui.playbackMode.textContent = 'PAUSED';
        this.stopVisualization();
    }

    stop() {
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.currentTime = 0;
        this.ui.playPauseBtn?.classList.remove('playing');
        this.ui.playbackMode.textContent = 'STOPPED';
        this.updateTimeDisplay();
        this.stopVisualization();
        this.drawWaveforms();
    }

    async toggleRecording() {
        if (this.state.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        await this.initAudioContext();
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.state.isRecording = true;
            this.ui.recordBtn?.classList.add('recording');
            this.ui.playbackMode.textContent = 'RECORDING';
            this.showToast('Recording started', 'info');
        } catch (error) {
            this.showToast('Could not access microphone', 'error');
        }
    }

    stopRecording() {
        this.state.isRecording = false;
        this.ui.recordBtn?.classList.remove('recording');
        this.ui.playbackMode.textContent = 'STOPPED';
        this.showToast('Recording saved', 'success');
    }

    skip(seconds) {
        this.state.currentTime = Math.max(0, this.state.currentTime + seconds);
        this.updateTimeDisplay();
        this.drawWaveforms();
    }

    zoomIn() {
        this.state.zoomLevel = Math.min(400, this.state.zoomLevel + 25);
        document.getElementById('zoomLevel').textContent = `${this.state.zoomLevel}%`;
        this.renderWaveforms();
    }

    zoomOut() {
        this.state.zoomLevel = Math.max(25, this.state.zoomLevel - 25);
        document.getElementById('zoomLevel').textContent = `${this.state.zoomLevel}%`;
        this.renderWaveforms();
    }

    toggleLoop() {
        // Loop toggle functionality
        this.showToast('Loop mode toggled', 'info');
    }

    // Time Display
    updateTimeDisplay() {
        this.ui.currentTime.textContent = this.formatTime(this.state.currentTime);
        this.ui.totalTime.textContent = this.formatTime(this.state.totalDuration);
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00:00.000';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }

    // Visualization
    startVisualization() {
        const draw = () => {
            this.animationId = requestAnimationFrame(draw);
            // Visualization logic would go here
        };
        draw();
    }

    stopVisualization() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    renderWaveforms() {
        const canvases = document.querySelectorAll('.waveform-canvas');
        canvases.forEach((canvas, index) => {
            this.drawWaveform(canvas, index);
        });
    }

    drawWaveform(canvas, index) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        
        ctx.fillStyle = '#1a1d23';
        ctx.fillRect(0, 0, width, height);
        
        // Draw mock waveform
        ctx.strokeStyle = index === 0 ? '#00f0ff' : '#a855f7';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        const amplitude = height / 4;
        for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin(x * 0.05 + index) * amplitude * Math.random();
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    // AI Brain
    initializeAI() {
        this.aiBrain.isActive = true;
        this.ui.aiCortex?.setAttribute('data-active', 'true');
        
        // Load learned preferences
        const savedPrefs = localStorage.getItem('neuralvoice_preferences');
        if (savedPrefs) {
            this.aiBrain.preferences = JSON.parse(savedPrefs);
        }
        
        // Generate initial suggestions
        this.generateAISuggestions();
    }

    startAIAnalysis() {
        // AI analysis loop
        setInterval(() => {
            if (this.aiBrain.isActive) {
                this.analyzeUserBehavior();
                this.updateAIMetrics();
            }
        }, 1000);
    }

    analyzeUserBehavior() {
        // Analyze editing patterns
        const recentActions = this.history.slice(-10);
        if (recentActions.length > 0) {
            // Learn from user behavior
            this.aiBrain.learningProgress = Math.min(100, this.aiBrain.learningProgress + 0.5);
        }
    }

    updateAIMetrics() {
        this.ui.learningMetric.textContent = `${Math.round(this.aiBrain.learningProgress)}%`;
        this.ui.contextMetric.textContent = this.state.projectType.toUpperCase();
        
        // Update AI state display
        if (this.aiBrain.learningProgress > 50) {
            this.ui.aiState.textContent = 'Learning';
            this.ui.aiState.style.color = '#00f0ff';
        }
        
        if (this.aiBrain.learningProgress > 80) {
            this.ui.aiState.textContent = 'Optimized';
            this.ui.aiState.style.color = '#00ff88';
        }
    }

    generateAISuggestions() {
        const suggestions = [];
        
        // Context-aware suggestions based on project type
        if (this.state.projectType === 'podcast') {
            suggestions.push({
                icon: 'mic',
                text: 'Enable compression for consistent vocal levels',
                priority: 'high'
            });
            suggestions.push({
                icon: 'lightning',
                text: 'Apply de-essing to reduce sibilance',
                priority: 'medium'
            });
        } else if (this.state.projectType === 'music') {
            suggestions.push({
                icon: 'music',
                text: 'Add reverb tail for depth',
                priority: 'high'
            });
            suggestions.push({
                icon: 'star',
                text: 'Consider harmony layers',
                priority: 'low'
            });
        } else if (this.state.projectType === 'voiceover') {
            suggestions.push({
                icon: 'mic',
                text: 'Enhance presence frequencies',
                priority: 'high'
            });
            suggestions.push({
                icon: 'wind',
                text: 'Reduce breath noise automatically',
                priority: 'medium'
            });
        }
        
        // Learning-based suggestions
        if (this.aiBrain.preferences.pitchAdjustment) {
            suggestions.push({
                icon: 'sliders',
                text: 'Apply your preferred pitch shift',
                priority: 'high'
            });
        }
        
        this.aiBrain.suggestions = suggestions;
        this.renderSuggestions();
    }

    renderSuggestions() {
        if (!this.ui.aiSuggestions) return;
        
        this.ui.aiSuggestions.innerHTML = this.aiBrain.suggestions.map(suggestion => `
            <div class="suggestion-card" data-priority="${suggestion.priority}">
                <div class="suggestion-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${this.getIconPath(suggestion.icon)}
                    </svg>
                </div>
                <div class="suggestion-content">
                    <p>${suggestion.text}</p>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        this.ui.aiSuggestions.querySelectorAll('.suggestion-card').forEach(card => {
            card.addEventListener('click', () => {
                this.applySuggestion(card);
            });
        });
    }

    applySuggestion(card) {
        const text = card.querySelector('.suggestion-content p').textContent;
        this.showToast(`Applying: ${text}`, 'ai');
        this.addToHistory(`Applied AI suggestion: ${text.substring(0, 30)}...`);
        
        // Simulate applying suggestion
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';
    }

    // Creativity Mode
    toggleCreativityMode() {
        this.state.creativityMode = !this.state.creativityMode;
        this.ui.creativityToggle?.classList.toggle('active', this.state.creativityMode);
        document.querySelector('.os-container')?.setAttribute('data-creativity', this.state.creativityMode ? 'on' : 'off');
        
        if (this.state.creativityMode) {
            this.generateCreativeIdeas();
            this.ui.aiCortex?.setAttribute('data-active', 'true');
        }
        
        this.showToast(`Creativity Mode ${this.state.creativityMode ? 'enabled' : 'disabled'}`, this.state.creativityMode ? 'ai' : 'info');
    }

    generateCreativeIdeas() {
        const ideas = [
            {
                text: 'Generate a voice profile based on your recent edits',
                action: 'Generate'
            },
            {
                text: 'Create a unique vocal texture by combining harmonics',
                action: 'Combine'
            },
            {
                text: 'Reimagine this as a dramatic narrator voice',
                action: 'Reimagine'
            },
            {
                text: 'Generate ambient texture layer from vocal characteristics',
                action: 'Generate'
            }
        ];
        
        this.ui.creativityIdeas.innerHTML = ideas.map(idea => `
            <div class="idea-card">
                <span class="idea-icon">💡</span>
                <p>${idea.text}</p>
                <button class="idea-action">${idea.action}</button>
            </div>
        `).join('');
    }

    // Project Intelligence
    setProjectType(type) {
        this.state.projectType = type;
        this.ui.currentProjectType.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        document.querySelector('.os-container')?.setAttribute('data-project', type);
        
        // Update UI based on project type
        this.updateProjectUI(type);
        
        // Generate context-aware suggestions
        this.generateAISuggestions();
        
        this.addToHistory(`Changed project type to ${type}`);
        this.showToast(`Project type: ${type}`, 'info');
    }

    updateProjectUI(type) {
        // Update layer names based on project type
        const layerNames = document.querySelectorAll('.layer-name');
        if (type === 'podcast') {
            layerNames.forEach((name, i) => {
                name.textContent = i === 0 ? 'Host Voice' : `Guest ${i}`;
            });
        } else if (type === 'music') {
            layerNames.forEach((name, i) => {
                name.textContent = `Vocal Track ${i + 1}`;
            });
        } else if (type === 'voiceover') {
            layerNames.forEach((name, i) => {
                name.textContent = `Narration ${i + 1}`;
            });
        }
    }

    // Control Modes
    setControlMode(mode) {
        this.state.controlMode = mode;
        
        // Update slider sensitivities
        const sliders = ['pitch', 'formant', 'breath', 'timing'];
        sliders.forEach(param => {
            const slider = document.getElementById(`${param}Slider`);
            if (slider) {
                const step = mode === 'macro' ? 1 : mode === 'micro' ? 0.1 : 0.01;
                slider.querySelectorAll('input').forEach(input => {
                    input.step = step;
                });
            }
        });
    }

    // Emotion Control
    setEmotion(emotion) {
        const emotions = {
            neutral: { pitch: 0, warmth: 50, breath: 20 },
            happy: { pitch: 2, warmth: 60, breath: 30 },
            sad: { pitch: -3, warmth: 40, breath: 10 },
            angry: { pitch: -1, warmth: 70, breath: 15 },
            excited: { pitch: 3, warmth: 55, breath: 40 }
        };
        
        const settings = emotions[emotion];
        if (settings) {
            this.ui.emotionValue.textContent = emotion.charAt(0).toUpperCase() + emotion.slice(1);
            this.addToHistory(`Set emotion to ${emotion}`);
        }
    }

    // Formant Presets
    applyFormantPreset(preset) {
        const presets = {
            natural: { value: 0 },
            bright: { value: 3 },
            warm: { value: -2 },
            dark: { value: -4 }
        };
        
        const settings = presets[preset];
        if (settings) {
            const slider = this.ui.formantSlider;
            if (slider) {
                slider.dataset.value = settings.value;
                slider.querySelector('.slider-handle').style.left = `${((settings.value + 12) / 24) * 100}%`;
                slider.querySelector('.slider-fill').style.width = `${((settings.value + 12) / 24) * 100}%`;
                this.ui.formantValue.textContent = settings.value > 0 ? `+${settings.value}` : settings.value;
            }
            this.addToHistory(`Applied ${preset} formant preset`);
        }
    }

    // Effects
    updateEffect(param, value) {
        // Update audio effect based on parameter
        switch (param) {
            case 'pitch':
                // Pitch shift implementation
                break;
            case 'formant':
                // Formant shift implementation
                break;
            case 'breath':
                // Breath processing
                break;
            case 'timing':
                // Time stretching
                break;
        }
    }

    applyAllChanges() {
        this.addToHistory('Applied all effect changes');
        this.showToast('Changes applied successfully', 'success');
    }

    resetControls() {
        const defaults = {
            pitch: 0,
            formant: 0,
            breath: 0,
            timing: 1
        };
        
        Object.entries(defaults).forEach(([param, value]) => {
            const slider = document.getElementById(`${param}Slider`);
            if (slider) {
                slider.dataset.value = value;
                slider.querySelector('.slider-handle').style.left = '50%';
                slider.querySelector('.slider-fill').style.width = '50%';
            }
            const valueEl = document.getElementById(`${param}Value`);
            if (valueEl) valueEl.textContent = param === 'timing' ? '1.00x' : '0';
        });
        
        this.addToHistory('Reset all controls');
        this.showToast('Controls reset', 'info');
    }

    // Layer Management
    addLayer() {
        const layerCount = document.querySelectorAll('.layer').length;
        const layerHtml = `
            <div class="layer track-layer" data-layer="${layerCount}">
                <div class="layer-header">
                    <div class="layer-controls">
                        <button class="layer-btn" title="Solo">S</button>
                        <button class="layer-btn" title="Mute">M</button>
                        <button class="layer-btn" title="Record">R</button>
                    </div>
                    <span class="layer-name">Voice Layer ${layerCount + 1}</span>
                    <select class="blend-mode-select">
                        <option value="normal">Normal</option>
                        <option value="add">Add</option>
                        <option value="multiply">Multiply</option>
                        <option value="exciter">Exciter</option>
                    </select>
                </div>
                <div class="layer-content" id="layer${layerCount}"></div>
            </div>
        `;
        
        this.ui.addLayerBtn.insertAdjacentHTML('beforebegin', layerHtml);
        this.addToHistory(`Added voice layer ${layerCount + 1}`);
        this.showToast(`Layer ${layerCount + 1} added`, 'info');
    }

    // Text-Voice
    debouncedUpdateText() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.updateWordTimeline();
        }, 300);
    }

    updateWordTimeline() {
        if (!this.textInput) return;
        
        const words = this.textInput.split(/\s+/);
        this.ui.wordTimeline.innerHTML = words.map((word, index) => `
            <span class="word" data-word="${index}" data-start="${index * 0.5}" data-end="${(index + 1) * 0.5}">${word}</span>
        `).join('');
    }

    selectWord(wordElement) {
        this.ui.wordTimeline.querySelectorAll('.word').forEach(w => w.classList.remove('selected'));
        wordElement.classList.add('selected');
        this.state.selectedWord = wordElement.dataset.word;
        
        // Show word-level controls
        this.showToast(`Selected word: "${wordElement.textContent}"`, 'info');
    }

    // Input Methods
    async openMicrophone() {
        document.getElementById('inputModal')?.classList.remove('visible');
        await this.startRecording();
    }

    openFilePicker() {
        document.getElementById('inputModal')?.classList.remove('visible');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.onchange = (e) => {
            if (e.target.files.length > 0) {
                this.showToast(`Loaded: ${e.target.files[0].name}`, 'success');
            }
        };
        input.click();
    }

    generateTTS() {
        document.getElementById('inputModal')?.classList.remove('visible');
        
        if (!this.textInput.trim()) {
            this.showToast('Please enter text first', 'error');
            return;
        }
        
        this.showToast('Generating speech...', 'info');
        
        // Simulate TTS generation
        setTimeout(() => {
            this.addToHistory('Generated TTS');
            this.showToast('Speech generated successfully', 'success');
        }, 1500);
    }

    // Export
    exportProject() {
        this.showToast('Exporting project...', 'info');
        
        setTimeout(() => {
            this.showToast('Project exported successfully', 'success');
            document.getElementById('exportModal')?.classList.remove('visible');
        }, 2000);
    }

    // History (Undo/Redo)
    addToHistory(action) {
        // Remove any future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push({
            action,
            timestamp: Date.now(),
            state: this.getStateSnapshot()
        });
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
        
        this.updateHistoryUI();
    }

    getStateSnapshot() {
        return {
            pitch: parseFloat(this.ui.pitchSlider?.dataset.value || 0),
            formant: parseFloat(this.ui.formantSlider?.dataset.value || 0),
            breath: parseFloat(this.ui.breathSlider?.dataset.value || 0),
            timing: parseFloat(this.ui.timingSlider?.dataset.value || 1),
            emotion: this.ui.emotionValue?.textContent || 'Neutral'
        };
    }

    undo() {
        if (this.historyIndex >= 0) {
            const historyItem = this.history[this.historyIndex];
            this.historyIndex--;
            this.restoreState(historyItem.state);
            this.updateHistoryUI();
            this.showToast('Undo', 'info');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const historyItem = this.history[this.historyIndex];
            this.restoreState(historyItem.state);
            this.updateHistoryUI();
            this.showToast('Redo', 'info');
        }
    }

    restoreState(state) {
        if (state.pitch !== undefined) {
            const slider = this.ui.pitchSlider;
            if (slider) {
                slider.dataset.value = state.pitch;
                slider.querySelector('.slider-handle').style.left = `${((state.pitch + 24) / 48) * 100}%`;
                slider.querySelector('.slider-fill').style.width = `${((state.pitch + 24) / 48) * 100}%`;
                this.ui.pitchValue.textContent = state.pitch;
            }
        }
    }

    updateHistoryUI() {
        const count = this.history.length;
        this.ui.historyCount.textContent = `${count} change${count !== 1 ? 's' : ''}`;
        this.ui.undoBtn.disabled = this.historyIndex < 0;
        this.ui.redoBtn.disabled = this.historyIndex >= this.history.length - 1;
        
        // Render history timeline
        const recentHistory = this.history.slice(-10);
        this.ui.historyTimeline.innerHTML = recentHistory.map((item, index) => {
            const actualIndex = this.history.length - recentHistory.length + index;
            const type = actualIndex <= this.historyIndex ? 'undo' : 'redo';
            return `<div class="history-item ${type}" title="${item.action}">${item.action.substring(0, 15)}...</div>`;
        }).join('');
    }

    // Keyboard Shortcuts
    handleKeyboard(e) {
        // Ctrl+Z = Undo
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            this.undo();
        }
        // Ctrl+Y or Ctrl+Shift+Z = Redo
        if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            this.redo();
        }
        // Space = Play/Pause
        if (e.key === ' ' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            this.togglePlayPause();
        }
        // Escape = Stop
        if (e.key === 'Escape') {
            this.stop();
        }
    }

    // UI Helpers
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    updateOfflineStatus() {
        const badge = document.getElementById('offlineBadge');
        const updateStatus = () => {
            if (navigator.onLine) {
                badge?.classList.remove('offline');
                badge.querySelector('span:last-child').textContent = 'Offline Ready';
            } else {
                badge?.classList.add('offline');
                badge.querySelector('span:last-child').textContent = 'Offline Mode';
            }
        };
        
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        updateStatus();
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        
        this.ui.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlide 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    closeModal() {
        document.getElementById('modalOverlay')?.classList.remove('visible');
    }

    getIconPath(iconName) {
        const icons = {
            mic: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>',
            lightning: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
            wind: '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>',
            music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
            star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
            sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>'
        };
        return icons[iconName] || icons.mic;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NeuralVoiceOS();
});
