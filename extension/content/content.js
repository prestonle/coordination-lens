// CoordinationLens Content Script with Pattern Detection
console.log("CoordinationLens activated on:", window.location.href);
console.log("Trust decay constant λ = 0.15");
console.log("Pattern detection: ACTIVE");

// Create overlay container
const overlay = document.createElement('div');
overlay.id = 'coordination-lens-overlay';
overlay.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  width: 400px;
  height: 350px;
  pointer-events: none;
  z-index: 99999;
  background: #000;
  border: 2px solid #00ff00;
  border-radius: 8px;
  overflow: hidden;
  font-family: monospace;
`;
document.body.appendChild(overlay);

// Create canvas for visualization
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 280;
overlay.appendChild(canvas);

// Create pattern alert area
const alertArea = document.createElement('div');
alertArea.style.cssText = `
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(0,0,0,0.8);
  color: #0f0;
  padding: 5px;
  font-size: 11px;
  border-top: 1px solid #333;
`;
overlay.appendChild(alertArea);

const ctx = canvas.getContext('2d');

// Enhanced particles with semantic vectors
const particles = [];
for (let i = 0; i < 3; i++) {
  particles.push({
    x: 200 + (Math.random() - 0.5) * 200,
    y: 140 + (Math.random() - 0.5) * 100,
    trust: 1.0,
    id: i,
    // Semantic vector for drift detection
    semanticVector: [Math.random(), Math.random(), Math.random()],
    attention: { x: 200, y: 140 }, // What they're "looking at"
    velocity: { x: 0, y: 0 }
  });
}

// Pattern Detection System
class PatternDetector {
  constructor() {
    this.patterns = [];
    this.trustHistory = [];
    this.driftThreshold = 0.3;
    this.collapseThreshold = -0.3;
  }
  
  detectSemanticDrift(agents) {
    let maxDrift = 0;
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const drift = this.calculateVectorDistance(
          agents[i].semanticVector,
          agents[j].semanticVector
        );
        maxDrift = Math.max(maxDrift, drift);
      }
    }
    
    if (maxDrift > this.driftThreshold) {
      this.logPattern('SEMANTIC_DRIFT', maxDrift);
      return true;
    }
    return false;
  }
  
  detectTrustCollapse(currentTrust, history) {
    if (history.length < 2) return false;
    
    const recentTrust = history[history.length - 1];
    const changeRate = currentTrust - recentTrust;
    
    if (changeRate < this.collapseThreshold) {
      this.logPattern('TRUST_COLLAPSE', changeRate);
      return true;
    }
    return false;
  }
  
  detectAttentionDivergence(agents) {
    const centerX = agents.reduce((sum, a) => sum + a.attention.x, 0) / agents.length;
    const centerY = agents.reduce((sum, a) => sum + a.attention.y, 0) / agents.length;
    
    const avgDistance = agents.reduce((sum, a) => {
      const dx = a.attention.x - centerX;
      const dy = a.attention.y - centerY;
      return sum + Math.sqrt(dx * dx + dy * dy);
    }, 0) / agents.length;
    
    if (avgDistance > 100) {
      this.logPattern('ATTENTION_DIVERGENCE', avgDistance);
      return true;
    }
    return false;
  }
  
  detectRecovery(currentTrust, history) {
    if (history.length < 3) return false;
    
    const oldTrust = history[history.length - 3];
    if (currentTrust > oldTrust && currentTrust > 0.5) {
      this.logPattern('RECOVERY', currentTrust);
      return true;
    }
    return false;
  }
  
  calculateVectorDistance(v1, v2) {
    return Math.sqrt(
      v1.reduce((sum, val, i) => sum + Math.pow(val - v2[i], 2), 0)
    );
  }
  
  logPattern(type, value) {
    const pattern = {
      type,
      value,
      timestamp: Date.now(),
      trust: globalTrust
    };
    this.patterns.push(pattern);
    this.displayAlert(pattern);
    console.log(`Pattern detected: ${type} (value: ${value.toFixed(3)})`);
  }
  
  displayAlert(pattern) {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = 'margin: 2px 0;';
    
    let color = '#0f0';
    if (pattern.type === 'TRUST_COLLAPSE') color = '#f00';
    else if (pattern.type === 'SEMANTIC_DRIFT') color = '#ff0';
    else if (pattern.type === 'ATTENTION_DIVERGENCE') color = '#f90';
    else if (pattern.type === 'RECOVERY') color = '#0ff';
    
    alertDiv.innerHTML = `<span style="color:${color}">⚠️ ${pattern.type}</span> | Trust: ${pattern.trust.toFixed(3)} | ${new Date(pattern.timestamp).toLocaleTimeString()}`;
    
    alertArea.appendChild(alertDiv);
    if (alertArea.children.length > 4) {
      alertArea.removeChild(alertArea.firstChild);
    }
  }
}

const detector = new PatternDetector();
let globalTrust = 1.0;

// Animation loop with pattern detection
function animate() {
  // Clear canvas with fade effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, 400, 280);
  
  // Update particles
  particles.forEach((p, i) => {
    // Simulate semantic drift
    p.semanticVector = p.semanticVector.map(v => 
      v + (Math.random() - 0.5) * 0.01
    );
    
    // Simulate attention wandering
    p.attention.x += (Math.random() - 0.5) * 2;
    p.attention.y += (Math.random() - 0.5) * 2;
    
    // Apply trust-based forces
    particles.forEach((other, j) => {
      if (i !== j) {
        const dx = other.x - p.x;
        const dy = other.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          // Attraction/repulsion based on trust
          const force = globalTrust > 0.5 ? 0.1 : -0.05;
          p.velocity.x += (dx / distance) * force;
          p.velocity.y += (dy / distance) * force;
        }
      }
    });
    
    // Apply velocity with damping
    p.x += p.velocity.x;
    p.y += p.velocity.y;
    p.velocity.x *= 0.95;
    p.velocity.y *= 0.95;
    
    // Keep in bounds
    if (p.x < 20) p.x = 20;
    if (p.x > 380) p.x = 380;
    if (p.y < 20) p.y = 20;
    if (p.y > 260) p.y = 260;
  });
  
  // Draw connections with trust-based opacity
  ctx.strokeStyle = `rgba(0, 255, 0, ${globalTrust * 0.5})`;
  ctx.lineWidth = 2;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(particles[j].x, particles[j].y);
      ctx.stroke();
    }
  }
  
  // Draw particles with trust-based color
  particles.forEach((p) => {
    if (globalTrust > 0.5) {
      ctx.fillStyle = '#00ff00';
    } else if (globalTrust > 0.2) {
      ctx.fillStyle = '#ffff00';
    } else {
      ctx.fillStyle = '#ff0000';
    }
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw attention indicator
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.attention.x, p.attention.y);
    ctx.stroke();
  });
  
  // Run pattern detection
  detector.detectSemanticDrift(particles);
  detector.detectAttentionDivergence(particles);
  detector.detectTrustCollapse(globalTrust, detector.trustHistory);
  detector.detectRecovery(globalTrust, detector.trustHistory);
  
  requestAnimationFrame(animate);
}

animate();

// Trust decay simulation with history
setInterval(() => {
  const deltaTime = 5;
  detector.trustHistory.push(globalTrust);
  if (detector.trustHistory.length > 10) {
    detector.trustHistory.shift();
  }
  
  globalTrust = globalTrust * Math.exp(-0.15 * deltaTime);
  globalTrust = Math.max(globalTrust, 0.05);
  
  console.log(`Trust decayed to: ${globalTrust.toFixed(3)}`);
  
  // Update border color based on patterns
  if (detector.patterns.some(p => p.type === 'TRUST_COLLAPSE' && Date.now() - p.timestamp < 5000)) {
    overlay.style.borderColor = '#ff0000';
    overlay.style.borderWidth = '4px';
  } else if (globalTrust > 0.5) {
    overlay.style.borderColor = '#00ff00';
    overlay.style.borderWidth = '2px';
  } else if (globalTrust > 0.2) {
    overlay.style.borderColor = '#ffff00';
    overlay.style.borderWidth = '2px';
  } else {
    overlay.style.borderColor = '#ff0000';
    overlay.style.borderWidth = '2px';
  }
}, 5000);

console.log("Pattern detection system active - monitoring for coordination failures");
