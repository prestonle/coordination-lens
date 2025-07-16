# CoordinationLens Test Scenarios

## Test 1: Identical Responses
**Response 1:** "The capital of France is Paris."
**Response 2:** "The capital of France is Paris."
**Expected:** 0% divergence

## Test 2: Similar Content, Different Wording
**Response 1:** "Machine learning is a subset of artificial intelligence."
**Response 2:** "AI includes machine learning as one of its subfields."
**Expected:** ~20-30% divergence

## Test 3: Conflicting Advice
**Response 1:** "To learn programming, start with Python. It's beginner-friendly."
**Response 2:** "For programming beginners, JavaScript is better for immediate results."
**Expected:** ~70-80% divergence

## Test 4: Completely Different Topics
**Response 1:** "The weather today is sunny and warm."
**Response 2:** "Quantum computing uses qubits instead of bits."
**Expected:** ~95-100% divergence

## Test 5: Edge Cases
- Empty responses
- Very short responses (< 10 chars)
- Very long responses (> 5000 chars)
- Special characters and emojis
- Code snippets
