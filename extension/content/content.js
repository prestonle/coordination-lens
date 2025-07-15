// CoordinationLens - Real AI Response Detector with Visual Alerts
console.log("🔍 CoordinationLens activated on:", window.location.href);

class AIResponseCapture {
    constructor() {
        this.responses = [];
        this.isCapturing = false;
        this.settings = {
            monitoringEnabled: true,
            redFlashEnabled: true,
            divergenceThreshold: 200
        };
        
        // Load settings
        this.loadSettings();
        
        // Set up platform detection
        this.detectPlatform();
        this.createVisualAlert();
        
        // Listen for messages from other tabs
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (changes.latestResponses) {
                this.checkForDivergence();
            }
            if (changes.monitoringEnabled || changes.redFlashEnabled || changes.divergenceThreshold) {
                this.loadSettings();
            }
        });
    }

    loadSettings() {
        chrome.storage.sync.get(['monitoringEnabled', 'redFlashEnabled', 'divergenceThreshold'], (result) => {
            this.settings = {
                monitoringEnabled: result.monitoringEnabled !== false,
                redFlashEnabled: result.redFlashEnabled !== false,
                divergenceThreshold: result.divergenceThreshold || 200
            };
            console.log('📋 Settings loaded:', this.settings);
        });
    }

    createVisualAlert() {
        // Create alert container
        this.alertDiv = document.createElement('div');
        this.alertDiv.id = 'coordination-lens-alert';
        this.alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 999999;
            display: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 300px;
        `;
        document.body.appendChild(this.alertDiv);
    }

    showAlert(message) {
        if (!this.settings.monitoringEnabled) return;
        
        this.alertDiv.textContent = message;
        this.alertDiv.style.display = 'block';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.alertDiv.style.display = 'none';
        }, 10000);
    }

    detectPlatform() {
        const hostname = window.location.hostname;
        
        if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
            console.log("✅ ChatGPT detected - starting capture");
            this.startChatGPTCapture();
        } else if (hostname.includes('claude.ai')) {
            console.log("✅ Claude detected - starting capture");
            this.startClaudeCapture();
        } else {
            console.log("❌ Not on AI platform");
        }
    }

    startChatGPTCapture() {
        if (!this.settings.monitoringEnabled) return;
        
        this.isCapturing = true;
        
        const observer = new MutationObserver(() => {
            const messages = document.querySelectorAll(
                '[data-message-author-role="assistant"], .markdown.prose, .agent-turn'
            );
            
            messages.forEach(msg => {
                const text = msg.innerText;
                if (text && text.length > 10) {
                    this.logResponse('ChatGPT', text);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log("👁️ Watching for ChatGPT responses...");
    }

    startClaudeCapture() {
        if (!this.settings.monitoringEnabled) return;
        
        this.isCapturing = true;
        
        const observer = new MutationObserver(() => {
            const messages = document.querySelectorAll(
                '.font-claude-message, .group.relative.-tracking-\\[0\\.01em\\], div[class*="pb-8"]'
            );
            
            messages.forEach(msg => {
                const text = msg.innerText;
                if (text && text.length > 50 && !text.includes('Copy') && !text.includes('Retry')) {
                    this.logResponse('Claude', text);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log("👁️ Watching for Claude responses...");
    }

    logResponse(agent, text) {
        if (!this.settings.monitoringEnabled) return;
        
        const isDupe = this.responses.some(r => 
            r.fullText === text && r.agent === agent
        );
        
        if (!isDupe) {
            const response = {
                agent: agent,
                text: text.substring(0, 100) + "...",
                fullText: text,
                timestamp: new Date().toISOString(),
                length: text.length
            };
            
            this.responses.push(response);
            console.log(`📝 Captured ${agent} response:`, response);
            
            // Store locally for export
            this.storeForExport(response);
            
            // Share across tabs
            this.shareResponse(response);
        }
    }
    
    storeForExport(response) {
        chrome.storage.local.get(['coordinationLogs'], (result) => {
            const logs = result.coordinationLogs || [];
            logs.push(response);
            
            // Keep only last 1000 entries to avoid storage issues
            if (logs.length > 1000) {
                logs.shift();
            }
            
            chrome.storage.local.set({ coordinationLogs: logs });
        });
    }
    
    shareResponse(response) {
        chrome.storage.local.get(['latestResponses'], (result) => {
            const allResponses = result.latestResponses || {};
            allResponses[response.agent] = response;
            
            chrome.storage.local.set({ latestResponses: allResponses }, () => {
                console.log(`💾 Shared ${response.agent} response across tabs`);
                this.checkForDivergence();
            });
        });
    }
    
    checkForDivergence() {
        if (!this.settings.monitoringEnabled) return;
        
        chrome.storage.local.get(['latestResponses'], (result) => {
            const responses = result.latestResponses || {};
            
            if (responses.ChatGPT && responses.Claude) {
                console.log('🔍 COMPARING RESPONSES:');
                console.log('ChatGPT:', responses.ChatGPT.text);
                console.log('Claude:', responses.Claude.text);
                
                // Check for divergence
                const gptLower = responses.ChatGPT.fullText.toLowerCase();
                const claudeLower = responses.Claude.fullText.toLowerCase();
                const lengthDiff = Math.abs(responses.ChatGPT.length - responses.Claude.length);
                
                let divergenceDetected = false;
                let alertMessage = '';
                
                // Check against threshold
                if (lengthDiff > this.settings.divergenceThreshold) {
                    divergenceDetected = true;
                    alertMessage = `⚠️ AI Divergence: Response lengths differ by ${lengthDiff} characters`;
                    console.log(alertMessage);
                }
                
                // Check for content differences
                if (gptLower.includes('spooky') && !claudeLower.includes('spooky')) {
                    divergenceDetected = true;
                    alertMessage = '⚠️ AI Divergence: ChatGPT mentions "spooky action" but Claude doesn\'t';
                    console.log(alertMessage);
                }
                
                if (divergenceDetected) {
                    this.showAlert(alertMessage);
                    
                    // Flash the page border if enabled
                    if (this.settings.redFlashEnabled) {
                        document.body.style.border = '3px solid #ff4444';
                        setTimeout(() => {
                            document.body.style.border = '';
                        }, 3000);
                    }
                }
                
                console.log('📊 Length difference:', lengthDiff, 'characters');
            }
        });
    }
}

// Start capture
const capture = new AIResponseCapture();
console.log("🚀 CoordinationLens Response Capture Active");
