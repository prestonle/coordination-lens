// CoordinationLens - Real AI Response Detector with Cross-Tab Comparison
console.log("🔍 CoordinationLens activated on:", window.location.href);

class AIResponseCapture {
    constructor() {
        this.responses = [];
        this.isCapturing = false;
        this.detectPlatform();
        
        // Listen for messages from other tabs
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (changes.latestResponses) {
                this.checkForDivergence();
            }
        });
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
            
            // Store in Chrome storage for cross-tab access
            this.shareResponse(response);
        }
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
        chrome.storage.local.get(['latestResponses'], (result) => {
            const responses = result.latestResponses || {};
            
            if (responses.ChatGPT && responses.Claude) {
                console.log('🔍 COMPARING RESPONSES:');
                console.log('ChatGPT:', responses.ChatGPT.text);
                console.log('Claude:', responses.Claude.text);
                
                // Simple divergence check - do they mention different key concepts?
                const gptLower = responses.ChatGPT.fullText.toLowerCase();
                const claudeLower = responses.Claude.fullText.toLowerCase();
                
                // Check for significant differences
                if (gptLower.includes('spooky') && !claudeLower.includes('spooky')) {
                    console.log('⚠️ DIVERGENCE DETECTED: ChatGPT mentions "spooky action" but Claude doesn\'t');
                }
                
                if (Math.abs(responses.ChatGPT.length - responses.Claude.length) > 200) {
                    console.log('⚠️ DIVERGENCE DETECTED: Response lengths differ significantly');
                }
                
                console.log('📊 Length difference:', Math.abs(responses.ChatGPT.length - responses.Claude.length), 'characters');
            }
        });
    }
}

// Start capture
const capture = new AIResponseCapture();
console.log("🚀 CoordinationLens Response Capture Active");
