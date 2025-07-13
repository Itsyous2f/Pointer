// Ollama Configuration for Speed vs Quality Trade-offs

export const OLLAMA_CONFIG = {
  // Fast models (prioritize speed)
  fast: {
    model: 'qwen2.5:0.5b', // Extremely fast, small model
    options: {
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      num_predict: 512,
      repeat_penalty: 1.1,
      seed: 42,
      num_ctx: 2048, // Smaller context window
      num_thread: 4, // Use fewer threads for faster response
    }
  },
  
  // Balanced models (good speed + quality)
  balanced: {
    model: 'llama3.1:8b', // Medium size
    options: {
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      num_predict: 1024,
      repeat_penalty: 1.1,
      seed: 42,
      num_ctx: 4096,
      num_thread: 8,
    }
  },
  
  // Quality models (prioritize quality)
  quality: {
    model: 'llama3.1:8b', // Full model
    options: {
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      num_predict: 2048,
      repeat_penalty: 1.1,
      seed: 42,
      num_ctx: 8192,
      num_thread: 12,
    }
  }
};

// Current mode - change this to switch between speed modes
export const CURRENT_MODE: 'fast' | 'balanced' | 'quality' = 'fast';

export function getOllamaConfig() {
  return OLLAMA_CONFIG[CURRENT_MODE];
}

// Alternative fast models you can try:
export const FAST_MODELS = [
  'llama3.1:1b',      // Fastest, smallest
  'llama3.1:3b',      // Fast, small
  'llama3.1:8b',      // Balanced
  'llama3.1:latest',  // Full quality
  'mistral:7b',       // Alternative fast model
  'phi3:mini',        // Very fast, small
  'qwen2.5:0.5b',     // Extremely fast
]; 