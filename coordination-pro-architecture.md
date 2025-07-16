# CoordinationLens Pro - Multi-Model Architecture

## Core Features:
1. **Unified Query Interface**
   - Single prompt → Multiple models
   - Parallel API calls
   - Real-time response streaming

2. **Live Coordination Analysis**
   - Jaccard similarity between all pairs
   - Semantic clustering of responses
   - Disagreement highlighting
   - Consensus identification

3. **Advanced Visualizations**
   - Force-directed graph of model relationships
   - Heatmap of pairwise similarities
   - Timeline of response arrivals
   - Token usage and cost tracking

## Technical Stack:
- Frontend: React with real-time updates
- Backend: Node.js with WebSocket support
- APIs: OpenAI, Anthropic, Google, Perplexity, X.ai
- Storage: IndexedDB for history
- Analysis: Your CoordinationAnalyzer + embeddings

## API Management:
- Secure key storage (encrypted)
- Rate limiting per service
- Cost estimation before query
- Fallback handling

## MVP Features (Week 1):
- 5 model simultaneous query
- Basic divergence scoring
- Export comparison report
- Response history

## Revenue Model:
- Free tier: 10 queries/day with own API keys
- Pro tier: Unlimited with analytics (/mo)
- Team tier: Shared workspaces (/mo)
