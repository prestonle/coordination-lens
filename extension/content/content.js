// CoordinationLens Content Script with Inline WebGL
console.log("CoordinationLens activated on:", window.location.href);
console.log("Trust decay constant λ = 0.15");

// Create overlay container
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
  background: #000;
  border: 2px solid #00ff00;
  border-radius: 8px;
  overflow: hidden;
`;
document.body.appendChild(overlay);

// Create canvas
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 300;
overlay.appendChild(canvas);

const ctx = canvas.getContext('2d');

// Simple particle system (no Three.js needed for now)
const particles = [];
for (let i = 0; i < 3; i++) {
  particles.push({
    x: 200 + (Math.random() - 0.5) * 200,
    y: 150 + (Math.random() - 0.5) * 100,
    trust: 1.0,
    id: i
  });
}

// Trust decay
let globalTrust = 1.0;

// Animation loop
function animate() {
  // Clear canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, 400, 300);
  
  // Draw connections
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
  
  // Draw particles
  particles.forEach((p, i) => {
    // Color based on trust
    if (globalTrust > 0.5) {
      ctx.fillStyle = '#00ff00'; // Green
    } else if (globalTrust > 0.2) {
      ctx.fillStyle = '#ffff00'; // Yellow  
    } else {
      ctx.fillStyle = '#ff0000'; // Red
    }
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Gentle movement
    p.x += Math.sin(Date.now() * 0.001 + i) * 0.5;
    p.y += Math.cos(Date.now() * 0.001 + i) * 0.3;
    
    // Keep in bounds
    if (p.x < 20) p.x = 20;
    if (p.x > 380) p.x = 380;
    if (p.y < 20) p.y = 20;
    if (p.y > 280) p.y = 280;
  });
  
  requestAnimationFrame(animate);
}

animate();

// Trust decay simulation
setInterval(() => {
  const deltaTime = 5;
  globalTrust = globalTrust * Math.exp(-0.15 * deltaTime);
  globalTrust = Math.max(globalTrust, 0.05);
  
  console.log(`Trust decayed to: ${globalTrust.toFixed(3)}`);
  
  // Update border color
  if (globalTrust > 0.5) {
    overlay.style.borderColor = '#00ff00';
  } else if (globalTrust > 0.2) {
    overlay.style.borderColor = '#ffff00';
  } else {
    overlay.style.borderColor = '#ff0000';
  }
}, 5000);

console.log("Canvas particle visualization active - 3 agents with trust connections");
