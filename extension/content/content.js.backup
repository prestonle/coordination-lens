// CoordinationLens - Real-time AI Coordination Monitoring
console.log('%c🔍 CoordinationLens v0.1.0', 'color: #00ff00; font-weight: bold; font-size: 16px');
console.log('%cMaking AI coordination failures visible for the first time', 'color: #40c0cb; font-style: italic');
console.log('Research-grade trust dynamics monitoring (λ=0.15) by Preston Lee Horn');
console.log('GitHub: https://github.com/prestonle/coordination-lens');

// Configuration
const CONFIG = {
    checkInterval: 5000,
    trustDecayLambda: 0.15,
    trustFloor: 0.05,
    recoveryThreshold: 0.09,
    defaultThreshold: 200,
    maxStorageEvents: 1000,
    debounceDelay: 300
};

// Get threshold from storage
let divergenceThreshold = CONFIG.defaultThreshold;
chrome.storage.sync.get(['threshold'], (result) => {
    if (result.threshold) {
        divergenceThreshold = result.threshold;
        console.log(`Custom threshold loaded: ${divergenceThreshold} characters`);
    }
});

// Initialize coordination log
let coordinationLog = [];
let isMonitoring = true;

console.log('%c✅ Trust dynamics engine initialized', 'color: #00ff00');
console.log('Monitoring for coordination drift between AI agents...');

// Debouncing for performance
let debounceTimer;
function debouncedCompare() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(compareResponses, CONFIG.debounceDelay);
}

// Storage management with rotation
function addToLog(event) {
    coordinationLog.push(event);
    
    if (coordinationLog.length >= CONFIG.maxStorageEvents) {
        const archiveData = {
            timestamp: new Date().toISOString(),
            events: coordinationLog
        };
        
        chrome.storage.local.set({
            [`archive_${Date.now()}`]: archiveData
        }, () => {
            console.log('%c📦 Auto-archived 1000 coordination events', 'color: #ffff00');
            console.log('Data preserved for research analysis');
        });
        
        coordinationLog = [];
    }
    
    chrome.storage.local.set({
        coordinationLog: coordinationLog
    });
}

// Trust dynamics implementation
class TrustDynamics {
    constructor() {
        this.trustLevel = 1.0;
        this.hasDetectedDivergence = false;
        this.divergenceCount = 0;
        this.lastUpdate = Date.now();
    }

    update() {
        const now = Date.now();
        
        if (this.hasDetectedDivergence) {
            const deltaTime = (now - this.lastUpdate) / 1000;
            this.trustLevel = this.trustLevel * Math.exp(-CONFIG.trustDecayLambda * deltaTime);
            this.trustLevel = Math.max(this.trustLevel, CONFIG.trustFloor);
            this.lastUpdate = now;
        }
    }

    triggerDivergence(severity = 1) {
        this.hasDetectedDivergence = true;
        this.divergenceCount++;
        
        console.log('%c⚠️  COORDINATION DRIFT DETECTED', 'color: #ff8800; font-weight: bold');
        console.log(`Divergence #${this.divergenceCount} - Severity: ${severity}/10`);
        
        const trustHit = Math.max(0.7, 1 - (severity * 0.1));
        this.trustLevel = Math.max(this.trustLevel * trustHit, CONFIG.trustFloor);
        this.lastUpdate = Date.now();
    }

    getStatus() {
        if (!this.hasDetectedDivergence) return { text: 'OK', color: '#00ff00', level: 'healthy' };
        if (this.trustLevel > 0.7) return { text: 'OK', color: '#00ff00', level: 'good' };
        if (this.trustLevel > 0.4) return { text: 'WARN', color: '#ffff00', level: 'degrading' };
        return { text: 'CRIT', color: '#ff0000', level: 'critical' };
    }
}

const trustDynamics = new TrustDynamics();

// Create ONLY the battery meter UI (no canvas!)
const indicator = document.createElement('div');
indicator.id = 'coordination-lens-indicator';
indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 180px;
    height: 40px;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(0, 255, 0, 0.5);
    border-radius: 20px;
    padding: 5px;
    z-index: 99999;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: monospace;
    font-size: 12px;
    color: #00ff00;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

// Status text
const statusText = document.createElement('span');
statusText.id = 'coord-status';
statusText.textContent = 'OK';
statusText.style.cssText = 'font-weight: bold; width: 35px; text-align: center;';

// Battery-style trust bar
const trustBar = document.createElement('div');
trustBar.style.cssText = `
    flex: 1;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    padding: 2px;
    position: relative;
    overflow: hidden;
`;

const trustFill = document.createElement('div');
trustFill.id = 'trust-fill';
trustFill.style.cssText = `
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #00ff00 0%, #00dd00 100%);
    transition: all 0.5s ease;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
`;

// Battery segments effect
const segments = document.createElement('div');
segments.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: repeating-linear-gradient(
        90deg,
        transparent,
        transparent 18px,
        rgba(0, 0, 0, 0.1) 18px,
        rgba(0, 0, 0, 0.1) 20px
    );
    border-radius: 8px;
`;
trustFill.appendChild(segments);

trustBar.appendChild(trustFill);
indicator.appendChild(statusText);
indicator.appendChild(trustBar);

// Alerts tooltip
const tooltip = document.createElement('div');
tooltip.id = 'coord-tooltip';
tooltip.style.cssText = `
    position: fixed;
    bottom: 70px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 10px;
    font-family: monospace;
    font-size: 11px;
    color: #fff;
    display: none;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
`;

document.body.appendChild(indicator);
document.body.appendChild(tooltip);

// Hover effects
indicator.addEventListener('mouseenter', () => {
    tooltip.style.display = 'block';
    tooltip.innerHTML = `
        <div style="color: #40c0cb; font-weight: bold;">CoordinationLens v0.1.0</div>
        <div style="margin-top: 5px;">Trust Level: ${(trustDynamics.trustLevel * 100).toFixed(1)}%</div>
        <div>Divergences: ${trustDynamics.divergenceCount}</div>
        <div style="margin-top: 5px; color: #888;">Click to export data</div>
    `;
});

indicator.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
});

// Click to export
indicator.addEventListener('click', () => {
    console.log(`Trust level: ${(trustDynamics.trustLevel * 100).toFixed(1)}%`);
    console.log(`Total divergences detected: ${trustDynamics.divergenceCount}`);
    console.log('Use extension popup to export full data');
});

console.log('Compact trust meter ready - hover for details');

// Update battery meter display
function updateTrustMeter() {
    trustDynamics.update();
    const status = trustDynamics.getStatus();
    const percentage = trustDynamics.trustLevel * 100;
    
    // Update text and color
    statusText.textContent = status.text;
    statusText.style.color = status.color;
    
    // Update battery fill
    trustFill.style.width = percentage + '%';
    
    // Change fill color based on level
    if (percentage > 70) {
        trustFill.style.background = 'linear-gradient(90deg, #00ff00 0%, #00dd00 100%)';
        indicator.style.borderColor = 'rgba(0, 255, 0, 0.5)';
    } else if (percentage > 40) {
        trustFill.style.background = 'linear-gradient(90deg, #ffff00 0%, #dddd00 100%)';
        indicator.style.borderColor = 'rgba(255, 255, 0, 0.5)';
    } else {
        trustFill.style.background = 'linear-gradient(90deg, #ff0000 0%, #dd0000 100%)';
        indicator.style.borderColor = 'rgba(255, 0, 0, 0.5)';
        indicator.style.animation = 'pulse 2s infinite';
    }
}

// Add pulse animation for critical state
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); }
        50% { box-shadow: 0 2px 20px rgba(255, 0, 0, 0.5); }
        100% { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); }
    }
`;
document.head.appendChild(style);

// AI response detection
function findAIResponses() {
    const selectors = {
        chatgpt: '[data-message-author-role="assistant"]',
        claude: '.assistant-message',
        generic: '.markdown, .response-content, .ai-response'
    };
    
    let responses = [];
    Object.values(selectors).forEach(selector => {
        const elements = document.querySelectorAll(selector);
        responses = responses.concat(Array.from(elements));
    });
    
    return responses;
}

// Compare responses
function compareResponses() {
    if (!isMonitoring) return;
    
    const responses = findAIResponses();
    if (responses.length >= 2) {
        const contents = responses.map(r => r.textContent || '');
        const lengths = contents.map(c => c.length);
        const maxDiff = Math.max(...lengths) - Math.min(...lengths);
        
        if (maxDiff > divergenceThreshold) {
            console.log('%c🎯 AI DIVERGENCE DETECTED', 'color: #ff8800; font-weight: bold; font-size: 14px');
            console.log(`Character difference: ${maxDiff} (threshold: ${divergenceThreshold})`);
            console.log('Export data for analysis - Use popup');
            
            addToLog({
                timestamp: Date.now(),
                type: 'divergence_detected',
                difference: maxDiff,
                threshold: divergenceThreshold,
                url: window.location.href
            });
            
            const severity = Math.min(10, Math.floor(maxDiff / divergenceThreshold));
            trustDynamics.triggerDivergence(severity);
            
            // Flash indicator
            indicator.style.borderColor = '#ff0000';
            indicator.style.borderWidth = '2px';
            setTimeout(() => {
                indicator.style.borderWidth = '1px';
                updateTrustMeter();
            }, 2000);
        }
    }
}

// Monitor DOM changes
const observer = new MutationObserver(() => {
    debouncedCompare();
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});

// Update loop
setInterval(() => {
    updateTrustMeter();
}, 1000);

// Initial update
updateTrustMeter();

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleMonitoring') {
        isMonitoring = !isMonitoring;
        sendResponse({ monitoring: isMonitoring });
    } else if (request.action === 'exportLog') {
        sendResponse({ log: coordinationLog });
    }
});

console.log('%c📊 CoordinationLens ready', 'color: #40c0cb; font-weight: bold');
console.log(`• ${coordinationLog.length} events logged`);
console.log('• Export formats: JSON, CSV');
console.log('%c💡 Hover over trust meter for details', 'color: #ffff00');
