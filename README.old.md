# CoordinationLens

A Chrome extension that detects and visualizes coordination differences between AI responses in real-time.

## Current Status: Working Prototype

- ✅ Captures responses from ChatGPT and Claude
- ✅ Compares responses across browser tabs
- ✅ Detects divergence in content and length
- ✅ Shows visual alerts when AIs disagree
- 🚧 Trust dynamics visualization (in progress)
- 🚧 Advanced pattern detection (planned)

## What It Does

CoordinationLens monitors AI conversations and alerts you when different AIs give significantly different answers to the same question. This helps identify potential coordination failures or disagreements between AI systems.

## Technical Details

- Chrome Extension (Manifest V3)
- Real-time response capture using DOM observation
- Cross-tab communication via Chrome Storage API
- Visual alerts for divergence detection

## Installation

1. Clone this repository
2. Open Chrome Extensions (chrome://extensions/)
3. Enable Developer Mode
4. Click "Load unpacked" and select the `extension` folder

## Research Purpose

This is a research prototype exploring AI coordination monitoring. Not intended for production use.

Part of PROJECT_SUBSTRATE - investigating coordination as fundamental substrate of intelligence.

## Version 1.1 (Coming Soon)
- ✨ **Semantic Similarity**: Replaced character count with Jaccard word analysis
- 🎯 **Real Divergence Detection**: Catches actual disagreements, not just length differences
- 💡 **Actionable Insights**: Recommendations based on divergence levels
