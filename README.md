# CoordinationLens v1.1 - Experimental Research Prototype

## Current Status: TRL 3 (Analytical and Experimental Critical Function)

### What This Is

An experimental Chrome extension exploring semantic divergence detection between AI assistant responses using Jaccard similarity.

### What This Is NOT

- A production-ready tool
- A validated divergence detector
- An automated monitoring solution
- A definitive measure of AI coordination

## Actual Functionality (v1.1)

```
Current Implementation:
├── Manual copy/paste of AI responses
├── Jaccard similarity calculation (word-set overlap)
├── Visual feedback (particle animation)
├── JSON export of comparisons
└── Fixed threshold (0.3) for divergence detection
```

## Known Limitations

1. **No DOM Integration**: Cannot automatically capture AI responses
2. **Unvalidated Metrics**: Jaccard threshold chosen heuristically
3. **No Performance Optimization**: May lag with long responses
4. **Limited Scope**: Only compares two responses at a time
5. **No Persistence**: Results not saved between sessions

## Installation

```bash
git clone https://github.com/prestonleehorn/coordination-lens
cd coordination-lens/extension
# Load unpacked in Chrome developer mode
```

## Disclaimer

This tool provides experimental divergence detection only. Results should not be used for critical decisions without independent verification.

## License

MIT - Use at your own risk

## Contact

Preston Lee Horn - PLH Labs
