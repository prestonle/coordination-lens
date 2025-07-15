// CoordinationLens Content Script with Data Export
console.log("CoordinationLens activated on:", window.location.href);
console.log("Trust decay constant λ = 0.15");

// Create data storage
let coordinationData = {
  startTime: Date.now(),
  url: window.location.href,
  trustDecayConstant: 0.15,
  events: []
};

// Log initial state
coordinationData.events.push({
  timestamp: Date.now(),
  type: "initialization",
  trust: 1.0,
  message: "CoordinationLens initialized"
});

// Simulate trust decay over time (every 5 seconds)
let currentTrust = 1.0;
setInterval(() => {
  const deltaTime = 5; // 5 seconds
  currentTrust = currentTrust * Math.exp(-0.15 * deltaTime);
  currentTrust = Math.max(currentTrust, 0.05); // stability floor
  
  coordinationData.events.push({
    timestamp: Date.now(),
    type: "trust_decay",
    trust: currentTrust,
    deltaTime: deltaTime
  });
  
  console.log(`Trust decayed to: ${currentTrust.toFixed(3)}`);
}, 5000);

// Add keyboard shortcut to export data (Ctrl+Shift+L)
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === "L") {
    console.log("=== COORDINATIONLENS DATA EXPORT ===");
    console.log(JSON.stringify(coordinationData, null, 2));
    console.log("=== END EXPORT ===");
    
    // Also copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(coordinationData, null, 2))
      .then(() => {
        alert("CoordinationLens data copied to clipboard!");
      })
      .catch(() => {
        console.log("Failed to copy to clipboard. Check console for data.");
      });
  }
});

console.log("Press Ctrl+Shift+L to export coordination data");
