import OpenAI from 'openai';

// Initialize the OpenAI client with Moonshot's endpoint
const moonshot = new OpenAI({
  apiKey: process.env.MOONSHOT_API_KEY, // Your Moonshot API key
  baseURL: 'https://api.moonshot.ai/v1', // Moonshot's API base URL
});

export const moonshotAPI = moonshot;