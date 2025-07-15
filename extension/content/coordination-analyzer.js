// coordination-analyzer.js - Semantic similarity analyzer
class CoordinationAnalyzer {
  constructor() {
    this.cache = new Map();
  }

  tokenize(text) {
    if (this.cache.has(text)) return this.cache.get(text);
    
    const tokens = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2 && !this.isStopWord(token));
    
    const tokenSet = new Set(tokens);
    this.cache.set(text, tokenSet);
    return tokenSet;
  }

  isStopWord(word) {
    const stopWords = new Set([
      'the', 'and', 'for', 'that', 'this', 'with', 'from',
      'was', 'are', 'been', 'were', 'have', 'has', 'had',
      'but', 'not', 'can', 'will', 'would', 'could', 'should'
    ]);
    return stopWords.has(word);
  }

  calculateSimilarity(response1, response2) {
    const tokens1 = this.tokenize(response1);
    const tokens2 = this.tokenize(response2);
    
    if (tokens1.size === 0 || tokens2.size === 0) return 0;
    
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    
    return intersection.size / union.size;
  }

  detectDivergence(response1, response2) {
    const similarity = this.calculateSimilarity(response1, response2);
    const divergence = 1 - similarity;
    
    const tokens1 = this.tokenize(response1);
    const tokens2 = this.tokenize(response2);
    
    const unique1 = [...tokens1].filter(x => !tokens2.has(x));
    const unique2 = [...tokens2].filter(x => !tokens1.has(x));
    
    return {
      divergence: divergence,
      similarity: similarity,
      isSignificant: divergence > 0.3,
      uniqueToFirst: unique1.slice(0, 5),
      uniqueToSecond: unique2.slice(0, 5),
      recommendation: this.getRecommendation(divergence)
    };
  }

  getRecommendation(divergence) {
    if (divergence < 0.2) return "Responses are well-aligned";
    if (divergence < 0.4) return "Minor differences detected - verify key facts";
    if (divergence < 0.6) return "Significant divergence - request clarification";
    return "Major divergence - responses may be contradictory";
  }
}

window.CoordinationAnalyzer = CoordinationAnalyzer;
