// popup.js - Settings management for CoordinationLens

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', async () => {
    const settings = await loadSettings();
    applySettingsToUI(settings);
    
    // Add event listeners
    document.getElementById('saveBtn').addEventListener('click', saveSettings);
    document.getElementById('exportBtn').addEventListener('click', exportLogs);
    document.getElementById('divergenceThreshold').addEventListener('input', updateThresholdDisplay);
});

// Default settings
const defaultSettings = {
    monitoringEnabled: true,
    redFlashEnabled: true,
    divergenceThreshold: 200,
    exportFormat: 'both'
};

// Load settings from Chrome storage
async function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(defaultSettings, (items) => {
            resolve(items);
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

// Save settings
function saveSettings() {
    const settings = {
        monitoringEnabled: document.getElementById('monitoringEnabled').checked,
        redFlashEnabled: document.getElementById('redFlashEnabled').checked,
        divergenceThreshold: parseInt(document.getElementById('divergenceThreshold').value),
        exportFormat: document.getElementById('exportFormat').value
    };
    
    chrome.storage.sync.set(settings, () => {
        showStatus('✓ Settings saved');
    });
}

// Export logs
async function exportLogs() {
    // Get logs from storage
    chrome.storage.local.get(['coordinationLogs'], async (result) => {
        const logs = result.coordinationLogs || [];
        const settings = await loadSettings();
        
        if (logs.length === 0) {
            showStatus('No logs to export', 'warning');
            return;
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Export based on format preference
        if (settings.exportFormat === 'json' || settings.exportFormat === 'both') {
            exportJSON(logs, timestamp);
        }
        
        if (settings.exportFormat === 'csv' || settings.exportFormat === 'both') {
            exportCSV(logs, timestamp);
        }
        
        showStatus(`✓ Exported ${logs.length} events`);
    });
}

// Export as JSON
function exportJSON(logs, timestamp) {
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
        filename: `coordination-logs-${timestamp}.json`
    });
}

// Export as CSV
function exportCSV(logs, timestamp) {
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
        filename: `coordination-logs-${timestamp}.csv`
    });
}

// Show status message
function showStatus(message, type = 'success') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    
    if (type === 'warning') {
        statusEl.style.background = '#fff3cd';
        statusEl.style.color = '#856404';
        statusEl.style.border = '1px solid #ffeaa7';
    }
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}
