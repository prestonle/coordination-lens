// performance-utils.js - Performance optimization utilities

// 1. DEBOUNCING UTILITY
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 2. THROTTLE UTILITY
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 3. STORAGE MANAGER
class StorageManager {
  constructor() {
    this.STORAGE_LIMIT = 5242880; // 5MB Chrome limit
    this.SAFETY_BUFFER = 524288; // 500KB safety
  }

  async checkQuota() {
    return new Promise((resolve) => {
      chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
        const available = this.STORAGE_LIMIT - bytesInUse;
        resolve({
          used: bytesInUse,
          available: available,
          percentage: (bytesInUse / this.STORAGE_LIMIT) * 100,
          canStore: available > this.SAFETY_BUFFER
        });
      });
    });
  }

  async safeStore(key, data) {
    const quota = await this.checkQuota();
    
    if (!quota.canStore) {
      await this.cleanupOldData();
    }

    const dataSize = new Blob([JSON.stringify(data)]).size;
    
    if (dataSize > quota.available) {
      console.warn('Storage quota exceeded, data not saved');
      return { success: false, reason: 'quota_exceeded' };
    }

    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: data }, () => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, reason: chrome.runtime.lastError.message });
        } else {
          resolve({ success: true });
        }
      });
    });
  }

  async cleanupOldData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (items) => {
        const entries = Object.entries(items);
        const sorted = entries
          .filter(([key, value]) => value.timestamp)
          .sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        const toRemove = sorted.slice(0, Math.floor(sorted.length * 0.2));
        const keysToRemove = toRemove.map(([key]) => key);
        
        if (keysToRemove.length > 0) {
          chrome.storage.local.remove(keysToRemove, resolve);
        } else {
          resolve();
        }
      });
    });
  }
}

// 4. ERROR HANDLER
class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 50;
  }

  wrap(fn, context = 'unknown') {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.logError(error, context);
        return this.getSafeDefault(context);
      }
    };
  }

  logError(error, context) {
    const errorEntry = {
      message: error.message,
      context: context,
      timestamp: Date.now()
    };

    this.errors.push(errorEntry);
    
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    console.error(`[${context}] Error:`, error);
  }

  getSafeDefault(context) {
    const defaults = {
      'analysis': { divergence: 0, error: true },
      'storage': { success: false },
      'ui-update': null,
      'unknown': null
    };
    
    return defaults[context] || defaults['unknown'];
  }
}

// Export utilities
window.CoordinationUtils = {
  debounce,
  throttle,
  StorageManager,
  ErrorHandler
};
