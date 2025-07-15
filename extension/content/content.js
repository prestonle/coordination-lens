// CoordinationLens - Real-time AI Coordination Monitoring
console.log('CoordinationLens activated on:', window.location.href);

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
        console.log('Loaded threshold:', divergenceThreshold);
    }
});

// Initialize coordination log
let coordinationLog = [];
let isMonitoring = true;

// Debouncing for performance
let debounceTimer;
function debouncedCompare() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(compareResponses, CONFIG.debounceDelay);
}

// Storage management with rotation
function addToLog(event) {
    coordinationLog.push(event);
    
    // Auto-archive when reaching limit
    if (coordinationLog.length >= CONFIG.maxStorageEvents) {
        const archiveData = {
            timestamp: new Date().toISOString(),
            events: coordinationLog
        };
        
        // Archive to local storage
        chrome.storage.local.set({
            [`archive_${Date.now()}`]: archiveData
        }, () => {
            console.log('CoordinationLens: Auto-archived 1000 events');
        });
        
        // Clear current log
        coordinationLog = [];
    }
    
    // Save to storage
    chrome.storage.local.set({
        coordinationLog: coordinationLog
    });
}

// Trust dynamics implementation
class TrustDynamics {
    constructor() {
        this.agents = [
            { id: 1, trust: 1.0, x: 150, y: 150, vx: 0, vy: 0, lastUpdate: Date.now() },
            { id: 2, trust: 1.0, x: 250, y: 150, vx: 0, vy: 0, lastUpdate: Date.now() },
            { id: 3, trust: 1.0, x: 200, y: 100, vx: 0, vy: 0, lastUpdate: Date.now() }
        ];
        this.patterns = [];
    }

    update() {
        const now = Date.now();
        
        this.agents.forEach(agent => {
            const deltaTime = (now - agent.lastUpdate) / 1000;
            agent.trust = agent.trust * Math.exp(-CONFIG.trustDecayLambda * deltaTime);
            agent.trust = Math.max(agent.trust, CONFIG.trustFloor);
            agent.lastUpdate = now;
        });

        this.detectPatterns();
    }

    detectPatterns() {
        const avgTrust = this.agents.reduce((sum, a) => sum + a.trust, 0) / this.agents.length;
        const trustVariance = this.agents.reduce((sum, a) => sum + Math.pow(a.trust - avgTrust, 2), 0) / this.agents.length;
        
        this.patterns = [];
        
        if (trustVariance > 0.3) {
            this.patterns.push({
                type: 'SEMANTIC_DRIFT',
                severity: 'warning',
                message: 'Agents diverging in semantic understanding'
            });
        }
        
        if (avgTrust < 0.3) {
            this.patterns.push({
                type: 'TRUST_COLLAPSE', 
                severity: 'critical',
                message: 'Critical trust degradation detected'
            });
        }
    }
}

const trustDynamics = new TrustDynamics();

// Create visual overlay
const overlay = document.createElement('div');
overlay.id = 'coordination-lens-overlay';
overlay.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: 400px;
    height: 300px;
    pointer-events: none;
    z-index: 99999;
    background: rgba(0, 0, 0, 0.1);
    border: 2px solid #00ff00;
    border-radius: 5px;
`;

// Canvas for visualization
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 300;
canvas.style.cssText = 'width: 100%; height: 100%;';
overlay.appendChild(canvas);

// Pattern display panel
const patternPanel = document.createElement('div');
patternPanel.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 10px;
    font-family: monospace;
    font-size: 12px;
    max-height: 100px;
    overflow-y: auto;
`;
overlay.appendChild(patternPanel);

document.body.appendChild(overlay);

const ctx = canvas.getContext('2d');

// Visualization update
function updateVisualization() {
    if (!isMonitoring) return;
    
    trustDynamics.update();
    
    // Clear canvas
    ctx.clearRect(0, 0, 400, 300);
    
    // Draw trust connections
    trustDynamics.agents.forEach((agent, i) => {
        trustDynamics.agents.slice(i + 1).forEach(other => {
            const avgTrust = (agent.trust + other.trust) / 2;
            ctx.strokeStyle = `rgba(0, 255, 0, ${avgTrust})`;
            ctx.lineWidth = avgTrust * 3;
            ctx.beginPath();
            ctx.moveTo(agent.x, agent.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
        });
    });
    
    // Draw agents
    trustDynamics.agents.forEach(agent => {
        const color = agent.trust > 0.5 ? '#00ff00' : agent.trust > 0.2 ? '#ffff00' : '#ff0000';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Update pattern display
    if (trustDynamics.patterns.length > 0) {
        const timestamp = new Date().toLocaleTimeString();
        trustDynamics.patterns.forEach(pattern => {
            const alert = document.createElement('div');
            alert.style.color = pattern.severity === 'critical' ? '#ff0000' : '#ffff00';
            alert.textContent = `[${timestamp}] ${pattern.type}: ${pattern.message}`;
            patternPanel.appendChild(alert);
            patternPanel.scrollTop = patternPanel.scrollHeight;
            
            addToLog({
                timestamp: Date.now(),
                type: 'pattern_detected',
                pattern: pattern
            });
        });
        
        // Flash border for critical alerts
        if (trustDynamics.patterns.some(p => p.severity === 'critical')) {
            overlay.style.borderColor = '#ff0000';
            setTimeout(() => {
                overlay.style.borderColor = '#00ff00';
            }, 500);
        }
    }
    
    requestAnimationFrame(updateVisualization);
}

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

// Compare responses with debouncing
function compareResponses() {
    if (!isMonitoring) return;
    
    const responses = findAIResponses();
    if (responses.length >= 2) {
        const contents = responses.map(r => r.textContent || '');
        const lengths = contents.map(c => c.length);
        const maxDiff = Math.max(...lengths) - Math.min(...lengths);
        
        if (maxDiff > divergenceThreshold) {
            console.warn(`CoordinationLens: Divergence detected! Difference: ${maxDiff} chars`);
            
            addToLog({
                timestamp: Date.now(),
                type: 'divergence_detected',
                difference: maxDiff,
                threshold: divergenceThreshold,
                url: window.location.href
            });
            
            // Visual alert
            overlay.style.borderColor = '#ff0000';
            overlay.style.borderWidth = '4px';
            setTimeout(() => {
                overlay.style.borderColor = '#00ff00';
                overlay.style.borderWidth = '2px';
            }, 2000);
        }
    }
}

// Monitor DOM changes with debouncing
const observer = new MutationObserver(() => {
    debouncedCompare();
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});

// Start visualization
updateVisualization();

// Periodic trust update
setInterval(() => {
    trustDynamics.update();
}, CONFIG.checkInterval);

// Listen for control messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleMonitoring') {
        isMonitoring = !isMonitoring;
        sendResponse({ monitoring: isMonitoring });
    } else if (request.action === 'exportLog') {
        sendResponse({ log: coordinationLog });
    }
});

console.log('CoordinationLens: Monitoring active with debouncing enabled');
console.log('CoordinationLens: Visualization overlay created');
