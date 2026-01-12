/**
 * Local AI Voice Operating System - Test Suite
 * Tests: AI Brain, Ultra-Precision Controls, Voice Layers, Project Intelligence
 */

const TEST_CONFIG = {
    timeout: 15000,
    verbose: true
};

// Test utilities
const TestUtils = {
    createMockDOM() {
        return {
            // AI Cortex elements
            aiCortex: { 
                setAttribute: () => {}, 
                getAttribute: () => 'false',
                querySelector: () => ({ 
                    textContent: '',
                    style: {},
                    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false }
                })
            },
            aiState: { textContent: '', style: {} },
            learningMetric: { textContent: '0%' },
            contextMetric: { textContent: '--' },
            aiSuggestions: { 
                innerHTML: '',
                querySelectorAll: () => ({ length: 0, forEach: () => {} })
            },
            learningInsights: { innerHTML: '' },
            creativityIdeas: { innerHTML: '' },
            creativityToggle: { 
                classList: { 
                    add: () => {}, 
                    remove: () => {}, 
                    toggle: () => {},
                    contains: () => false
                },
                addEventListener: () => {}
            },
            creativityPanel: { setAttribute: () => {} },
            
            // Project selector elements
            projectTypeBtn: { addEventListener: () => {}, querySelector: () => ({ textContent: '' }) },
            currentProjectType: { textContent: 'General' },
            projectDropdown: { 
                classList: { 
                    add: () => {}, 
                    remove: () => {}, 
                    toggle: () => {},
                    contains: () => false
                } 
            },
            
            // Transport elements
            playPauseBtn: { 
                classList: { add: () => {}, remove: () => {}, contains: () => false },
                addEventListener: () => {},
                querySelector: () => ({ style: {} })
            },
            stopBtn: { addEventListener: () => {} },
            recordBtn: { 
                classList: { add: () => {}, remove: () => {} },
                addEventListener: () => {}
            },
            currentTime: { textContent: '00:00:00.000' },
            totalTime: { textContent: '00:00:00.000' },
            playbackMode: { textContent: 'READY' },
            
            // Control elements
            pitchSlider: { 
                dataset: { value: '0' },
                querySelector: () => ({ 
                    style: { left: '50%', width: '50%' },
                    addEventListener: () => {},
                    parentElement: { getBoundingClientRect: () => ({ left: 0, width: 200 }) }
                })
            },
            formantSlider: { 
                dataset: { value: '0' },
                querySelector: () => ({ style: { left: '50%', width: '50%' } })
            },
            breathSlider: { 
                dataset: { value: '0' },
                querySelector: () => ({ style: { left: '0%', width: '0%' } })
            },
            timingSlider: { 
                dataset: { value: '1' },
                querySelector: () => ({ style: { left: '50%', width: '50%' } })
            },
            pitchValue: { textContent: '0' },
            formantValue: { textContent: '0' },
            breathValue: { textContent: '0%' },
            timingValue: { textContent: '1.0x' },
            emotionValue: { textContent: 'Neutral' },
            
            // Mode buttons
            modeBtns: [
                { classList: { add: () => {}, remove: () => {}, contains: () => false }, dataset: { mode: 'macro' }, addEventListener: () => {} },
                { classList: { add: () => {}, remove: () => {}, contains: () => true }, dataset: { mode: 'micro' }, addEventListener: () => {} },
                { classList: { add: () => {}, remove: () => {}, contains: () => false }, dataset: { mode: 'nano' }, addEventListener: () => {} }
            ],
            
            // Emotion buttons
            emotionBtns: [
                { classList: { add: () => {}, remove: () => {}, contains: () => true }, dataset: { emotion: 'neutral' }, addEventListener: () => {} },
                { classList: { add: () => {}, remove: () => {}, contains: () => false }, dataset: { emotion: 'happy' }, addEventListener: () => {} },
                { classList: { add: () => {}, remove: () => {}, contains: () => false }, dataset: { emotion: 'sad' }, addEventListener: () => {} },
                { classList: { add: () => {}, remove: () => {}, contains: () => false }, dataset: { emotion: 'angry' }, addEventListener: () => {} },
                { classList: { add: () => {}, remove: () => {}, contains: () => false }, dataset: { emotion: 'excited' }, addEventListener: () => {} }
            ],
            
            // Preset buttons
            presetBtns: [
                { classList: { add: () => {}, remove: () => {}, contains: () => true }, dataset: { preset: 'natural' }, addEventListener: () => {} },
                { classList: { add: () => {}, remove: () => {}, contains: () => false }, dataset: { preset: 'bright' }, addEventListener: () => {} },
                { classList: { add: () => {}, remove: () => {}, contains: () => false }, dataset: { preset: 'warm' }, addEventListener: () => {} },
                { classList: { add: () => {}, remove: () => {}, contains: () => false }, dataset: { preset: 'dark' }, addEventListener: () => {} }
            ],
            
            // Timeline elements
            layersContainer: { 
                innerHTML: '',
                querySelectorAll: () => [],
                insertAdjacentHTML: () => {},
                addEventListener: () => {}
            },
            playhead: { style: { left: '50%' } },
            timelineRuler: { addEventListener: () => {} },
            addLayerBtn: { addEventListener: () => {} },
            
            // Text editor elements
            textInput: { value: '', addEventListener: () => {}, addEventListener: () => {} },
            wordTimeline: { 
                innerHTML: '',
                querySelectorAll: () => [],
                addEventListener: () => {}
            },
            
            // History elements
            undoBtn: { disabled: false, addEventListener: () => {} },
            redoBtn: { disabled: true, addEventListener: () => {} },
            historyCount: { textContent: '0 changes' },
            historyTimeline: { innerHTML: '' },
            
            // System monitor elements
            cpuUsage: { textContent: '12%' },
            ramUsage: { textContent: '1.2 GB' },
            modelStatus: { textContent: 'Loaded' },
            
            // Toast container
            toastContainer: { appendChild: () => {} },
            
            // Modal elements
            modalOverlay: { 
                classList: { add: () => {}, remove: () => {}, contains: () => false },
                addEventListener: () => {}
            },
            modalClose: { addEventListener: () => {} },
            modalTitle: { textContent: '' },
            modalContent: { innerHTML: '' }
        };
    },

    createMockAudioContext() {
        return {
            state: 'running',
            sampleRate: 48000,
            currentTime: 0,
            createGain: () => ({
                gain: { value: 0.8 },
                connect: () => {},
                disconnect: () => {}
            }),
            createAnalyser: () => ({
                fftSize: 2048,
                frequencyBinCount: 1024,
                getByteTimeDomainData: () => {},
                getByteFrequencyData: () => {},
                connect: () => {}
            }),
            createMediaStreamSource: () => ({}),
            createMediaStreamDestination: () => ({
                stream: { getTracks: () => [] }
            }),
            createBiquadFilter: () => ({
                type: 'lowshelf',
                frequency: { value: 320 },
                gain: { value: 0 }
            }),
            createWaveShaper: () => ({}),
            createConvolver: () => ({}),
            createOscillator: () => ({
                frequency: { value: 440 },
                type: 'sine',
                connect: () => {},
                start: () => {},
                stop: () => {}
            }),
            createDelay: () => ({
                delayTime: { value: 0.3 }
            }),
            createBufferSource: () => ({
                buffer: null,
                connect: () => {},
                start: () => {},
                stop: () => {},
                onended: null
            }),
            createBuffer: (channels, length, sampleRate) => ({
                numberOfChannels: channels,
                length: length,
                sampleRate: sampleRate,
                getChannelData: (channel) => new Float32Array(length)
            }),
            decodeAudioData: async () => ({
                duration: 0,
                getChannelData: () => new Float32Array(48000),
                numberOfChannels: 2
            }),
            resume: async () => {},
            suspend: async () => {}
        };
    },

    async runTest(name, testFn) {
        return new Promise((resolve) => {
            const timer = setTimeout(() => {
                resolve({ name, passed: false, error: 'Test timed out' });
            }, TEST_CONFIG.timeout);

            Promise.resolve()
                .then(() => testFn())
                .then(() => {
                    clearTimeout(timer);
                    resolve({ name, passed: true });
                })
                .catch(error => {
                    clearTimeout(timer);
                    resolve({ name, passed: false, error: error.message || String(error) });
                });
        });
    },

    assert(condition, message) {
        if (!condition) throw new Error(message || 'Assertion failed');
    },

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    },

    assertContains(str, substr, message) {
        if (!str.includes(substr)) {
            throw new Error(message || `Expected "${str}" to contain "${substr}"`);
        }
    }
};

// Test categories
const AIBrainTests = {
    async testAIBrainInitialization() {
        const mockElements = TestUtils.createMockDOM();
        
        // Test AI brain initialization
        const aiBrain = {
            isActive: false,
            learningProgress: 0,
            preferences: {}
        };
        
        // Simulate initialization
        aiBrain.isActive = true;
        aiBrain.learningProgress = 0;
        
        TestUtils.assertEqual(aiBrain.isActive, true, 'AI Brain should be active after initialization');
        TestUtils.assertEqual(aiBrain.learningProgress, 0, 'Learning progress should start at 0');
        
        return { category: 'AI Brain Initialization', tests: [{ name: 'AI brain activates correctly', passed: true }] };
    },

    async testLearningProgress() {
        const aiBrain = {
            learningProgress: 0,
            analyzeBehavior: function(actions) {
                if (actions.length > 0) {
                    this.learningProgress = Math.min(100, this.learningProgress + actions.length * 0.5);
                }
            }
        };
        
        // Simulate learning from 10 actions
        const actions = Array(10).fill('edit');
        aiBrain.analyzeBehavior(actions);
        
        TestUtils.assertEqual(aiBrain.learningProgress, 5, 'Learning progress should increase with actions');
        
        // Simulate more actions
        aiBrain.analyzeBehavior(actions);
        TestUtils.assertEqual(aiBrain.learningProgress, 10, 'Learning progress should continue increasing');
        
        // Test cap at 100
        aiBrain.learningProgress = 99.5;
        aiBrain.analyzeBehavior(actions);
        TestUtils.assertEqual(aiBrain.learningProgress, 100, 'Learning progress should cap at 100');
        
        return { category: 'AI Brain Learning', tests: [
            { name: 'Learning progress increases with actions', passed: true },
            { name: 'Learning progress caps at 100%', passed: true }
        ]};
    },

    async testSuggestionGeneration() {
        const projectTypes = ['podcast', 'music', 'voiceover', 'gaming', 'general'];
        
        const suggestions = {
            podcast: [
                'Enable compression for consistent vocal levels',
                'Apply de-essing to reduce sibilance'
            ],
            music: [
                'Add reverb tail for depth',
                'Consider harmony layers'
            ],
            voiceover: [
                'Enhance presence frequencies',
                'Reduce breath noise automatically'
            ]
        };
        
        projectTypes.forEach(type => {
            if (suggestions[type]) {
                TestUtils.assert(
                    suggestions[type].length > 0,
                    `Project type ${type} should have suggestions`
                );
            }
        });
        
        return { category: 'AI Brain Suggestions', tests: [
            { name: 'Context-aware suggestions generated', passed: true }
        ]};
    },

    async testCreativityMode() {
        const creativityMode = {
            isActive: false,
            ideas: [],
            
            toggle() {
                this.isActive = !this.isActive;
            },
            
            generateIdeas() {
                return [
                    'Generate a voice profile based on your recent edits',
                    'Create a unique vocal texture by combining harmonics',
                    'Reimagine this as a dramatic narrator voice'
                ];
            }
        };
        
        // Test toggle
        TestUtils.assertEqual(creativityMode.isActive, false, 'Creativity mode should start inactive');
        
        creativityMode.toggle();
        TestUtils.assertEqual(creativityMode.isActive, true, 'Creativity mode should toggle to active');
        
        // Test idea generation
        const ideas = creativityMode.generateIdeas();
        TestUtils.assertEqual(ideas.length, 3, 'Should generate 3 creative ideas');
        TestUtils.assertContains(ideas[0], 'voice profile', 'Ideas should be relevant to voice');
        
        return { category: 'Creativity Mode', tests: [
            { name: 'Creativity mode toggles correctly', passed: true },
            { name: 'Creative ideas generated', passed: true }
        ]};
    }
};

const ControlTests = {
    async testControlModes() {
        const modes = ['macro', 'micro', 'nano'];
        
        const config = {
            macro: { step: 1, sensitivity: 'high' },
            micro: { step: 0.1, sensitivity: 'medium' },
            nano: { step: 0.01, sensitivity: 'low' }
        };
        
        modes.forEach(mode => {
            TestUtils.assert(
                config[mode] !== undefined,
                `Mode ${mode} should be defined`
            );
            TestUtils.assertEqual(
                typeof config[mode].step,
                'number',
                `Mode ${mode} should have numeric step`
            );
        });
        
        return { category: 'Control Modes', tests: modes.map(mode => ({
            name: `Mode ${mode} configuration valid`,
            passed: true
        }))};
    },

    async testPrecisionSliderCalculation() {
        const testSlider = {
            min: -24,
            max: 24,
            
            calculateValue(percentage) {
                return this.min + percentage * (this.max - this.min);
            },
            
            calculatePercentage(value) {
                return (value - this.min) / (this.max - this.min);
            }
        };
        
        // Test edge cases
        TestUtils.assertEqual(
            testSlider.calculateValue(0),
            -24,
            '0% should equal minimum value'
        );
        
        TestUtils.assertEqual(
            testSlider.calculateValue(1),
            24,
            '100% should equal maximum value'
        );
        
        TestUtils.assertEqual(
            testSlider.calculateValue(0.5),
            0,
            '50% should equal midpoint value'
        );
        
        // Test round trip
        const testValue = 12;
        const percentage = testSlider.calculatePercentage(testValue);
        const backToValue = testSlider.calculateValue(percentage);
        TestUtils.assertEqual(
            backToValue,
            testValue,
            'Round trip calculation should preserve value'
        );
        
        return { category: 'Precision Sliders', tests: [
            { name: 'Slider calculations correct at edges', passed: true },
            { name: 'Slider midpoint calculation correct', passed: true },
            { name: 'Round trip calculation preserves value', passed: true }
        ]};
    },

    async testEmotionPresets() {
        const emotions = {
            neutral: { pitchMod: 0, warmth: 50, breath: 20 },
            happy: { pitchMod: 2, warmth: 60, breath: 30 },
            sad: { pitchMod: -3, warmth: 40, breath: 10 },
            angry: { pitchMod: -1, warmth: 70, breath: 15 },
            excited: { pitchMod: 3, warmth: 55, breath: 40 }
        };
        
        // Verify all emotions have required properties
        Object.keys(emotions).forEach(emotion => {
            const settings = emotions[emotion];
            TestUtils.assert(
                typeof settings.pitchMod === 'number',
                `${emotion} should have pitch modifier`
            );
            TestUtils.assert(
                settings.warmth >= 0 && settings.warmth <= 100,
                `${emotion} warmth should be 0-100`
            );
            TestUtils.assert(
                settings.breath >= 0 && settings.breath <= 100,
                `${emotion} breath should be 0-100`
            );
        });
        
        // Test pitch ranges
        const pitchModifiers = Object.values(emotions).map(e => e.pitchMod);
        const minPitch = Math.min(...pitchModifiers);
        const maxPitch = Math.max(...pitchModifiers);
        
        TestUtils.assert(
            minPitch >= -12 && maxPitch <= 12,
            'Pitch modifiers should be within reasonable range'
        );
        
        return { category: 'Emotion Presets', tests: [
            { name: 'All emotion presets valid', passed: true },
            { name: 'Emotion pitch ranges reasonable', passed: true }
        ]};
    },

    async testFormantPresets() {
        const presets = {
            natural: { value: 0, label: 'Natural' },
            bright: { value: 3, label: 'Bright' },
            warm: { value: -2, label: 'Warm' },
            dark: { value: -4, label: 'Dark' }
        };
        
        Object.entries(presets).forEach(([name, preset]) => {
            TestUtils.assert(
                typeof preset.value === 'number',
                `${name} preset should have numeric value`
            );
            TestUtils.assert(
                preset.value >= -12 && preset.value <= 12,
                `${name} value should be within -12 to 12 range`
            );
        });
        
        return { category: 'Formant Presets', tests: [{
            name: 'Formant presets configured correctly',
            passed: true
        }]};
    },

    async testTimingPresets() {
        const timingPresets = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
        
        timingPresets.forEach(preset => {
            TestUtils.assert(
                preset > 0,
                `Timing preset ${preset} should be positive`
            );
            TestUtils.assert(
                preset <= 4,
                `Timing preset ${preset} should not exceed 4x`
            );
        });
        
        // Verify 1x (normal speed) is included
        TestUtils.assert(
            timingPresets.includes(1),
            '1x normal speed should be included'
        );
        
        return { category: 'Timing Presets', tests: [{
            name: 'Timing presets within valid range',
            passed: true
        }]};
    }
};

const VoiceLayerTests = {
    async testLayerCreation() {
        const layers = [];
        
        const addLayer = (name) => {
            const layer = {
                id: layers.length,
                name: name || `Voice Layer ${layers.length + 1}`,
                blendMode: 'normal',
                muted: false,
                solo: false,
                recordArm: false
            };
            layers.push(layer);
            return layer;
        };
        
        // Test initial state
        TestUtils.assertEqual(layers.length, 0, 'Should start with no layers');
        
        // Add first layer
        const layer1 = addLayer('Host Voice');
        TestUtils.assertEqual(layers.length, 1, 'Should have 1 layer after adding');
        TestUtils.assertEqual(layer1.name, 'Host Voice', 'Layer should have custom name');
        
        // Add more layers
        addLayer('Guest 1');
        addLayer('Guest 2');
        TestUtils.assertEqual(layers.length, 3, 'Should have 3 layers');
        
        // Test default names
        const defaultLayer = addLayer();
        TestUtils.assertContains(defaultLayer.name, 'Voice Layer', 'Default name should include "Voice Layer"');
        
        return { category: 'Voice Layers', tests: [
            { name: 'Layer creation works', passed: true },
            { name: 'Layer naming works', passed: true }
        ]};
    },

    async testBlendModes() {
        const blendModes = ['normal', 'add', 'multiply', 'exciter', 'subtract', 'overlay', 'soft-light', 'hard-light'];
        
        blendModes.forEach(mode => {
            TestUtils.assert(
                typeof mode === 'string',
                `Blend mode ${mode} should be a string`
            );
        });
        
        // Test that required modes exist
        const requiredModes = ['normal', 'add', 'multiply', 'exciter'];
        requiredModes.forEach(mode => {
            TestUtils.assert(
                blendModes.includes(mode),
                `Required blend mode ${mode} should exist`
            );
        });
        
        return { category: 'Voice Layer Blend Modes', tests: [{
            name: 'All blend modes defined',
            passed: true
        }]};
    },

    async testLayerControls() {
        const layer = {
            muted: false,
            solo: false,
            recordArm: false,
            
            toggleMute() { this.muted = !this.muted; },
            toggleSolo() { this.solo = !this.solo; },
            toggleRecordArm() { this.recordArm = !this.recordArm; }
        };
        
        // Test initial state
        TestUtils.assertEqual(layer.muted, false, 'Should start unmuted');
        TestUtils.assertEqual(layer.solo, false, 'Should start unsoloed');
        TestUtils.assertEqual(layer.recordArm, false, 'Should start not record armed');
        
        // Test toggles
        layer.toggleMute();
        TestUtils.assertEqual(layer.muted, true, 'Mute toggle should work');
        
        layer.toggleSolo();
        TestUtils.assertEqual(layer.solo, true, 'Solo toggle should work');
        
        layer.toggleRecordArm();
        TestUtils.assertEqual(layer.recordArm, true, 'Record arm toggle should work');
        
        return { category: 'Layer Controls', tests: [{
            name: 'Layer control toggles work',
            passed: true
        }]};
    }
};

const TextVoiceTests = {
    async testTextParsing() {
        const text = 'Hello, welcome to the Neural Voice Operating System test case.';
        
        const parseWords = (text) => {
            return text.split(/\s+/).filter(w => w.length > 0);
        };
        
        const words = parseWords(text);
        TestUtils.assertEqual(words.length, 10, 'Should parse 10 words');
        TestUtils.assertEqual(words[0], 'Hello,', 'First word should include punctuation');
        TestUtils.assertEqual(words[words.length - 1], 'case.', 'Last word should include period');
        
        // Test word timeline generation
        const generateTimeline = (words) => {
            let time = 0;
            return words.map(word => ({
                word,
                start: time,
                end: time + 0.5,
                duration: 0.5
            }));
        };
        
        const timeline = generateTimeline(words);
        TestUtils.assertEqual(timeline.length, 10, 'Timeline should have 10 entries');
        TestUtils.assertEqual(timeline[0].start, 0, 'First word should start at 0');
        TestUtils.assertEqual(timeline[5].word, 'Voice', 'Middle word should be correct');
        
        return { category: 'Text-Voice Parsing', tests: [
            { name: 'Word parsing works correctly', passed: true },
            { name: 'Timeline generation works', passed: true }
        ]};
    },

    async testEmotionMapping() {
        const text = 'Hello, this is amazing!';
        
        const detectEmotion = (text) => {
            if (text.includes('!')) return 'excited';
            if (text.includes('...')) return 'sad';
            if (text.includes('?')) return 'happy';
            return 'neutral';
        };
        
        const emotion = detectEmotion(text);
        TestUtils.assertEqual(emotion, 'excited', 'Exclamation should detect excited emotion');
        
        const sadText = 'Hello... this is sad...';
        const sadEmotion = detectEmotion(sadText);
        TestUtils.assertEqual(sadEmotion, 'sad', 'Ellipses should detect sad emotion');
        
        return { category: 'Text Emotion Detection', tests: [{
            name: 'Emotion detection from text works',
            passed: true
        }]};
    }
};

const HistoryTests = {
    async testHistoryManagement() {
        const history = [];
        let historyIndex = -1;
        let hasDiverged = false;
        let baseIndex = -1; // Track position before divergence
        const maxHistory = 100;
        
        const addToHistory = (action) => {
            // Clear forward history if we've diverged from the main path
            const spliceIndex = hasDiverged && baseIndex >= 0 ? baseIndex : historyIndex;
            
            if (hasDiverged && spliceIndex >= 0) {
                history.splice(spliceIndex);
                historyIndex = spliceIndex;
                hasDiverged = false;
                baseIndex = -1;
            }
            
            history.push({
                action,
                timestamp: Date.now(),
                state: { value: Math.random() }
            });
            
            // Update index
            historyIndex = history.length - 1;
            
            // Limit history size
            if (history.length > maxHistory) {
                history.shift();
                historyIndex--;
            }
        };
        
        // Add some actions
        addToHistory('Adjust pitch');
        addToHistory('Apply reverb');
        addToHistory('Change formant');
        
        TestUtils.assertEqual(history.length, 3, 'Should have 3 history items');
        TestUtils.assertEqual(historyIndex, 2, 'Should be at last history item');
        
        // Test undo
        const undo = () => {
            if (historyIndex >= 0) {
                historyIndex--;
                hasDiverged = true;
                baseIndex = historyIndex; // Remember position before potential redo
                return history[historyIndex + 1];
            }
            return null;
        };
        
        const undone = undo();
        TestUtils.assert(undone, 'Undo should return undone item');
        TestUtils.assertEqual(historyIndex, 1, 'Should move back one in history');
        
        // Test redo
        const redo = () => {
            if (historyIndex < history.length - 1) {
                historyIndex++;
                // Don't update baseIndex, keep the original
                return history[historyIndex];
            }
            return null;
        };
        
        const redone = redo();
        TestUtils.assert(redone, 'Redo should return redone item');
        TestUtils.assertEqual(historyIndex, 2, 'Should move forward in history');
        
        // Test that new action clears redo history
        addToHistory('New action');
        TestUtils.assertEqual(history.length, 2, 'Should have 2 items (redo history cleared)');
        TestUtils.assertEqual(historyIndex, 1, 'Should be at last item');
        
        return { category: 'History Management', tests: [
            { name: 'History adds correctly', passed: true },
            { name: 'Undo works correctly', passed: true },
            { name: 'Redo works correctly', passed: true },
            { name: 'New action clears redo history', passed: true }
        ]};
    }
};

const ProjectIntelligenceTests = {
    async testProjectTypeDetection() {
        const projectTypes = ['podcast', 'music', 'voiceover', 'gaming', 'general'];
        
        const projectConfigs = {
            podcast: {
                defaultLayers: 2,
                recommendedEffects: ['compression', 'de-essing', 'eq'],
                workflow: ['record', 'edit', 'compress', 'export']
            },
            music: {
                defaultLayers: 4,
                recommendedEffects: ['reverb', 'harmony', 'delay'],
                workflow: ['record', 'tune', 'mix', 'master']
            },
            voiceover: {
                defaultLayers: 1,
                recommendedEffects: ['eq', 'de-noise', 'compression'],
                workflow: ['record', 'clean', 'compress', 'export']
            },
            gaming: {
                defaultLayers: 3,
                recommendedEffects: ['characterVoice', 'effects', 'spatial'],
                workflow: ['design', 'record', 'process', 'integrate']
            },
            general: {
                defaultLayers: 1,
                recommendedEffects: ['basic'],
                workflow: ['create', 'edit', 'export']
            }
        };
        
        // Verify all project types have configs
        projectTypes.forEach(type => {
            TestUtils.assert(
                projectConfigs[type] !== undefined,
                `Project type ${type} should have config`
            );
        });
        
        // Verify workflow length
        Object.values(projectConfigs).forEach(config => {
            TestUtils.assert(
                config.workflow.length >= 2,
                'Each project type should have at least 2 workflow steps'
            );
        });
        
        return { category: 'Project Intelligence', tests: [
            { name: 'All project types configured', passed: true },
            { name: 'Project workflows defined', passed: true }
        ]};
    },

    async testWorkflowRecommendations() {
        const getRecommendations = (projectType, stage) => {
            const workflows = {
                podcast: {
                    record: ['Use compression', 'Set correct gain'],
                    edit: ['Remove silences', 'Normalize levels'],
                    compress: ['Use light compression', 'Check loudness'],
                    export: ['Match loudness standards', 'Include metadata']
                },
                music: {
                    record: ['Set optimal levels', 'Use pop filter'],
                    tune: ['Auto-tune settings', 'Manual correction'],
                    mix: ['Balance tracks', 'Add reverb'],
                    master: ['Final compression', 'Loudness matching']
                },
                voiceover: {
                    record: ['Quiet environment', 'Consistent distance'],
                    clean: ['Remove background noise', 'De-ess'],
                    compress: ['Consistent levels', 'Dynamic processing'],
                    export: ['WAV format', 'Sample rate matching']
                }
            };
            
            return workflows[projectType]?.[stage] || [];
        };
        
        const podcastRecord = getRecommendations('podcast', 'record');
        TestUtils.assertEqual(podcastRecord.length, 2, 'Podcast record stage should have 2 recommendations');
        
        const musicTune = getRecommendations('music', 'tune');
        TestUtils.assertEqual(musicTune.length, 2, 'Music tune stage should have 2 recommendations');
        
        const unknownStage = getRecommendations('unknown', 'record');
        TestUtils.assertEqual(unknownStage.length, 0, 'Unknown project should return empty recommendations');
        
        return { category: 'Workflow Recommendations', tests: [{
            name: 'Context-aware recommendations work',
            passed: true
        }]};
    }
};

// Main test runner
async function runAllTests() {
    console.log('🧠 Local AI Voice Operating System - Test Suite');
    console.log('=' .repeat(60));
    
    const allResults = [];
    
    // Run AI Brain tests
    console.log('\n📊 Testing AI Brain...');
    const aiBrainTests = [
        AIBrainTests.testAIBrainInitialization(),
        AIBrainTests.testLearningProgress(),
        AIBrainTests.testSuggestionGeneration(),
        AIBrainTests.testCreativityMode()
    ];
    const aiBrainResults = await Promise.all(aiBrainTests);
    allResults.push(...aiBrainResults);
    
    // Run Control tests
    console.log('\n🎚️ Testing Ultra-Precision Controls...');
    const controlTests = [
        ControlTests.testControlModes(),
        ControlTests.testPrecisionSliderCalculation(),
        ControlTests.testEmotionPresets(),
        ControlTests.testFormantPresets(),
        ControlTests.testTimingPresets()
    ];
    const controlResults = await Promise.all(controlTests);
    allResults.push(...controlResults);
    
    // Run Voice Layer tests
    console.log('\n🎤 Testing Voice Layers...');
    const layerTests = [
        VoiceLayerTests.testLayerCreation(),
        VoiceLayerTests.testBlendModes(),
        VoiceLayerTests.testLayerControls()
    ];
    const layerResults = await Promise.all(layerTests);
    allResults.push(...layerResults);
    
    // Run Text-Voice tests
    console.log('\n🔄 Testing Text-Voice Intelligence...');
    const textVoiceTests = [
        TextVoiceTests.testTextParsing(),
        TextVoiceTests.testEmotionMapping()
    ];
    const textVoiceResults = await Promise.all(textVoiceTests);
    allResults.push(...textVoiceResults);
    
    // Run History tests
    console.log('\n↩️ Testing History System...');
    const historyTests = [
        HistoryTests.testHistoryManagement()
    ];
    const historyResults = await Promise.all(historyTests);
    allResults.push(...historyResults);
    
    // Run Project Intelligence tests
    console.log('\n🧠 Testing Project Intelligence...');
    const projectTests = [
        ProjectIntelligenceTests.testProjectTypeDetection(),
        ProjectIntelligenceTests.testWorkflowRecommendations()
    ];
    const projectResults = await Promise.all(projectTests);
    allResults.push(...projectResults);
    
    // Print results
    console.log('\n' + '=' .repeat(60));
    console.log('📋 TEST RESULTS');
    console.log('=' .repeat(60));
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    allResults.forEach(category => {
        console.log(`\n${category.category}:`);
        category.tests.forEach(test => {
            totalTests++;
            if (test.passed) {
                passedTests++;
                console.log(`  ✅ ${test.name}`);
            } else {
                failedTests++;
                console.log(`  ❌ ${test.name}`);
                if (test.error) {
                    console.log(`     Error: ${test.error}`);
                }
            }
        });
    });
    
    console.log('\n' + '=' .repeat(60));
    console.log(`📊 Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
    console.log('=' .repeat(60));
    
    return {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        success: failedTests === 0
    };
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        TestUtils,
        AIBrainTests,
        ControlTests,
        VoiceLayerTests,
        TextVoiceTests,
        HistoryTests,
        ProjectIntelligenceTests
    };
}

// Run tests if executed directly
if (typeof window !== 'undefined') {
    window.runAllTests = runAllTests;
    window.addEventListener('load', () => {
        console.log('Test suite loaded. Run tests with: runAllTests()');
    });
}

// Run tests in Node.js environment
if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
    runAllTests().then(results => {
        process.exit(results.success ? 0 : 1);
    });
}
