/**
 * Configuration Management Module
 * Handles application configuration loading, validation, and updates
 */

class ConfigManager {
  constructor(options = {}) {
    this.configPath = options.configPath || './config/default.json';
    this.userConfigPath = options.userConfigPath || './config/user.json';
    this.environment = options.environment || 'development';
    this.config = null;
    this.listeners = new Map();
  }

  /**
   * Initialize configuration manager
   */
  async initialize() {
    try {
      const [defaultConfig, userConfig] = await Promise.all([
        this.loadConfig(this.configPath),
        this.loadConfig(this.userConfigPath).catch(() => ({}))
      ]);

      this.config = this.mergeConfigs(defaultConfig, userConfig);
      this.applyEnvironmentOverrides();
      await this.validateConfig();
      
      return this.config;
    } catch (error) {
      console.error('Failed to initialize configuration:', error);
      throw error;
    }
  }

  /**
   * Load configuration from file
   */
  async loadConfig(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load config from ${path}: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError') {
        // Node.js environment - use require
        try {
          return require(path);
        } catch {
          return {};
        }
      }
      throw error;
    }
  }

  /**
   * Merge default and user configurations
   */
  mergeConfigs(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };
    
    for (const key in userConfig) {
      if (typeof userConfig[key] === 'object' && userConfig[key] !== null && !Array.isArray(userConfig[key])) {
        merged[key] = this.mergeConfigs(merged[key] || {}, userConfig[key]);
      } else {
        merged[key] = userConfig[key];
      }
    }
    
    return merged;
  }

  /**
   * Apply environment-specific overrides
   */
  applyEnvironmentOverrides() {
    const envConfig = this.loadEnvConfig();
    
    for (const key in envConfig) {
      this.setNestedValue(this.config, key, envConfig[key]);
    }
  }

  /**
   * Load environment variable configuration
   */
  loadEnvConfig() {
    const envMappings = {
      'voice.recognition.threshold': 'VOICE_RECOGNITION_THRESHOLD',
      'voice.recognition.language': 'VOICE_LANGUAGE',
      'ui.theme': 'UI_THEME',
      'audio.inputDevice': 'AUDIO_INPUT_DEVICE',
      'audio.outputDevice': 'AUDIO_OUTPUT_DEVICE',
      'performance.maxWorkers': 'MAX_WORKERS',
      'logging.level': 'LOG_LEVEL'
    };

    const config = {};
    
    for (const [configPath, envVar] of Object.entries(envMappings)) {
      const value = process.env[envVar];
      if (value !== undefined) {
        this.setNestedValue(config, configPath, this.parseEnvValue(value));
      }
    }
    
    return config;
  }

  /**
   * Parse environment variable value
   */
  parseEnvValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^-?\d+$/.test(value)) return parseInt(value, 10);
    if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
    return value;
  }

  /**
   * Set nested configuration value
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  /**
   * Validate configuration
   */
  async validateConfig() {
    const requiredPaths = [
      'app.name',
      'app.version',
      'voice.recognition.enabled',
      'audio.input.sampleRate'
    ];

    const errors = [];
    
    for (const path of requiredPaths) {
      const value = this.get(path);
      if (value === undefined || value === null) {
        errors.push(`Missing required configuration: ${path}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
  }

  /**
   * Get configuration value by path
   */
  get(path, defaultValue = undefined) {
    const keys = path.split('.');
    let current = this.config;
    
    for (const key of keys) {
      if (current === undefined || current === null) {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current !== undefined ? current : defaultValue;
  }

  /**
   * Set configuration value
   */
  async set(path, value) {
    this.setNestedValue(this.config, path, value);
    await this.notifyListeners(path, value);
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(path, callback) {
    const listenerId = `${path}-${Date.now()}-${Math.random()}`;
    this.listeners.set(listenerId, { path, callback });
    return () => this.listeners.delete(listenerId);
  }

  /**
   * Notify listeners of configuration changes
   */
  async notifyListeners(path, value) {
    for (const [, listener] of this.listeners) {
      if (listener.path === path || path.startsWith(listener.path + '.')) {
        await listener.callback(path, value);
      }
    }
  }

  /**
   * Save current configuration
   */
  async save() {
    try {
      const userConfig = this.extractUserOverrides();
      const response = await fetch(this.userConfigPath, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userConfig, null, 2)
      });

      if (!response.ok) {
        throw new Error(`Failed to save config: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error;
    }
  }

  /**
   * Extract user overrides from current configuration
   */
  extractUserOverrides() {
    const defaultConfig = require(this.configPath);
    const userConfig = {};
    
    for (const key in this.config) {
      if (JSON.stringify(this.config[key]) !== JSON.stringify(defaultConfig[key])) {
        userConfig[key] = this.config[key];
      }
    }
    
    return userConfig;
  }

  /**
   * Reset configuration to defaults
   */
  async reset() {
    this.config = await this.loadConfig(this.configPath);
    await this.notifyListeners('*', this.config);
  }

  /**
   * Export configuration
   */
  export() {
    return JSON.stringify(this.config, null, 2);
  }
}

module.exports = ConfigManager;
