import OpenAI from 'openai';

// Initialize the OpenAI client with Moonshot's endpoint
export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, // Your Moonshot API key
  baseURL: 'https://api.groq.com/openai/v1', // Moonshot's API base URL
});


export const GROQ_MODELS = {
    LLAMA_3_3_70B: 'llama-3.3-70b-versatile',
    LLAMA_3_1_8B: 'llama-3.1-8b-instant',
    MIXTRAL_8X7B: 'mixtral-8x7b-32768',
    DEEPSEEK_R1: 'deepseek-r1-distill-llama-70b',
    GEMMA_2_9B: 'gemma2-9b-it',
} as const;