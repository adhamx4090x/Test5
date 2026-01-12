/**
 * History Manager
 * Handles undo/redo functionality for transcript modifications
 */

class HistoryManager {
  constructor(options = {}) {
    this.maxHistorySize = options.maxHistorySize || 50;
    this.history = [];
    this.historyIndex = -1;
    this.currentState = null;
  }

  /**
   * Add a new state to history
   */
  add(action, data) {
    // If we're not at the end of history, remove all states after current index
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    const state = {
      action,
      data: this.deepClone(data),
      timestamp: Date.now()
    };

    this.history.push(state);
    this.historyIndex = this.history.length - 1;
    this.currentState = state;

    // Trim history if it exceeds max size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }

    return state;
  }

  /**
   * Get current state
   */
  getCurrent() {
    if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
      return this.history[this.historyIndex];
    }
    return null;
  }

  /**
   * Check if undo is available
   */
  canUndo() {
    return this.historyIndex > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Undo the last action
   */
  undo() {
    if (!this.canUndo()) {
      return null;
    }

    this.historyIndex--;
    this.currentState = this.history[this.historyIndex];
    
    return this.getCurrent();
  }

  /**
   * Redo the last undone action
   */
  redo() {
    if (!this.canRedo()) {
      return null;
    }

    this.historyIndex++;
    this.currentState = this.history[this.historyIndex];
    
    return this.getCurrent();
  }

  /**
   * Get all history entries
   */
  getAll() {
    return this.history;
  }

  /**
   * Get redo history (states after current index)
   */
  getRedoHistory() {
    if (this.historyIndex >= this.history.length - 1) {
      return [];
    }
    return this.history.slice(this.historyIndex + 1);
  }

  /**
   * Get undo history (states before current index)
   */
  getUndoHistory() {
    if (this.historyIndex <= 0) {
      return [];
    }
    return this.history.slice(0, this.historyIndex);
  }

  /**
   * Clear all history
   */
  clear() {
    this.history = [];
    this.historyIndex = -1;
    this.currentState = null;
  }

  /**
   * Get history statistics
   */
  getStats() {
    return {
      total: this.history.length,
      undoCount: this.historyIndex,
      redoCount: this.history.length - this.historyIndex - 1,
      maxSize: this.maxHistorySize
    };
  }

  /**
   * Deep clone an object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }

    if (typeof obj === 'object') {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }

    return obj;
  }

  /**
   * Export history to JSON
   */
  export() {
    return JSON.stringify({
      history: this.history,
      historyIndex: this.historyIndex
    }, null, 2);
  }

  /**
   * Import history from JSON
   */
  import(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      this.history = data.history;
      this.historyIndex = data.historyIndex;
      this.currentState = this.getCurrent();
      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  /**
   * Go to a specific state by index
   */
  goTo(index) {
    if (index >= 0 && index < this.history.length) {
      this.historyIndex = index;
      this.currentState = this.history[this.historyIndex];
      return this.currentState;
    }
    return null;
  }

  /**
   * Go to a specific state by timestamp
   */
  goToTimestamp(timestamp) {
    const index = this.history.findIndex(state => state.timestamp === timestamp);
    return this.goTo(index);
  }
}

module.exports = HistoryManager;
