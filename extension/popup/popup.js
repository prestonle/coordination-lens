// popup.js - Settings management for CoordinationLens with error handling

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const settings = await loadSettings();
        applySettingsToUI(settings);
        
        // Add event listeners
        document.getElementById('saveBtn').addEventListener('click', saveSettings);
        document.getElementById('exportBtn').addEventListener('click', exportLogs);
        document.getElementById('clearBtn').addEventListener('click', clearLogs);
        document.getElementById('divergenceThreshold').addEventListener('input', updateThresholdDisplay);
    } catch (error) {
        console.error('Error initializing popup:', error);
        showStatus('Error loading settings', 'error');
    }
});

// Default settings
const defaultSettings = {
    monitoringEnabled: true,
    redFlashEnabled: true,
    divergenceThreshold: 200,
    exportFormat: 'both'
};

// Load settings from Chrome storage with error handling
async function loadSettings() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(defaultSettings, (items) => {
            if (chrome.runtime.lastError) {
                console.error('Error loading settings:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                resolve(items);
            }
        });
    });
}

// Apply settings to UI
function applySettingsToUI(settings) {
    document.getElementById('monitoringEnabled').checked = settings.monitoringEnabled;
    document.getElementById('redFlashEnabled').checked = settings.redFlashEnabled;
    document.getElementById('divergenceThreshold').value = settings.divergenceThreshold;
    document.getElementById('thresholdValue').textContent = settings.divergenceThreshold;
    document.getElementById('exportFormat').value = settings.exportFormat;
}

// Update threshold display
function updateThresholdDisplay(e) {
    document.getElementById('thresholdValue').textContent = e.target.value;
}

// Save settings with error handling
function saveSettings() {
    const settings = {
        monitoringEnabled: document.getElementById('monitoringEnabled').checked,
        redFlashEnabled: document.getElementById('redFlashEnabled').checked,
        divergenceThreshold: parseInt(document.getElementById('divergenceThreshold').value),
        exportFormat: document.getElementById('exportFormat').value
    };
    
    // Validate settings
    if (settings.divergenceThreshold < 50 || settings.divergenceThreshold > 1000) {
        showStatus('Invalid threshold value', 'error');
        return;
    }
    
    chrome.storage.sync.set(settings, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving settings:', chrome.runtime.lastError);
            showStatus('Error saving settings', 'error');
        } else {
            showStatus('✓ Settings saved');
        }
    });
}

// Export logs with error handling
async function exportLogs() {
    try {
        // Check if we have downloads permission
        const permissions = await chrome.permissions.contains({ permissions: ['downloads'] });
        if (!permissions) {
            showStatus('Downloads permission required', 'error');
            return;
        }
        
        // Get logs from storage
        chrome.storage.local.get(['coordinationLogs'], async (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error loading logs:', chrome.runtime.lastError);
                showStatus('Error loading logs', 'error');
                return;
            }
            
            const logs = result.coordinationLogs || [];
            const settings = await loadSettings();
            
            if (logs.length === 0) {
                showStatus('No logs to export', 'warning');
                return;
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            try {
                // Export based on format preference
                if (settings.exportFormat === 'json' || settings.exportFormat === 'both') {
                    await exportJSON(logs, timestamp);
                }
                
                if (settings.exportFormat === 'csv' || settings.exportFormat === 'both') {
                    await exportCSV(logs, timestamp);
                }
                
                showStatus(`✓ Exported ${logs.length} events`);
            } catch (error) {
                console.error('Export error:', error);
                showStatus('Export failed', 'error');
            }
        });
    } catch (error) {
        console.error('Export error:', error);
        showStatus('Export failed', 'error');
    }
}

// Clear logs with confirmation
function clearLogs() {
    if (confirm('Clear all coordination logs? This cannot be undone.')) {
        chrome.storage.local.remove(['coordinationLogs'], () => {
            if (chrome.runtime.lastError) {
                console.error('Error clearing logs:', chrome.runtime.lastError);
                showStatus('Error clearing logs', 'error');
            } else {
                showStatus('✓ Logs cleared');
            }
        });
    }
}

// Export as JSON with error handling
async function exportJSON(logs, timestamp) {
    return new Promise((resolve, reject) => {
        try {
            const exportData = {
                coordinationLensVersion: '1.0',
                exportTime: Date.now(),
                totalEvents: logs.length,
                events: logs
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            chrome.downloads.download({
                url: url,
                filename: `coordination-logs-${timestamp}.json`,
                saveAs: false
            }, (downloadId) => {
                URL.revokeObjectURL(url); // Clean up
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(downloadId);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Export as CSV with error handling
async function exportCSV(logs, timestamp) {
    return new Promise((resolve, reject) => {
        try {
            // CSV headers
            const headers = ['timestamp', 'type', 'agent', 'length', 'preview'];
            const rows = [headers];
            
            // Convert logs to CSV rows
            logs.forEach(log => {
                const row = [
                    new Date(log.timestamp).toISOString(),
                    log.type || 'response',
                    log.agent,
                    log.length,
                    (log.text || '').substring(0, 50).replace(/"/g, '""') // Escape quotes
                ];
                rows.push(row);
            });
            
            // Convert to CSV string
            const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            
            chrome.downloads.download({
                url: url,
                filename: `coordination-logs-${timestamp}.csv`,
                saveAs: false
            }, (downloadId) => {
                URL.revokeObjectURL(url); // Clean up
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(downloadId);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Show status message with different types
function showStatus(message, type = 'success') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    
    // Style based on type
    switch(type) {
        case 'warning':
            statusEl.style.background = '#fff3cd';
            statusEl.style.color = '#856404';
            statusEl.style.border = '1px solid #ffeaa7';
            break;
        case 'error':
            statusEl.style.background = '#f8d7da';
            statusEl.style.color = '#721c24';
            statusEl.style.border = '1px solid #f5c6cb';
            break;
        default:
            statusEl.style.background = '#d4edda';
            statusEl.style.color = '#155724';
            statusEl.style.border = '1px solid #c3e6cb';
    }
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}
