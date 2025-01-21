// lib/groq.js

import Groq from 'groq-sdk'; // Import the Groq SDK

// Initialize the Groq client with your API key
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY, // API key stored in environment variables
});

export const getAIResponse = async (message, history) => {
  // Prepare the messages for the request, including the conversation history
  const messages = [
    {
      role: 'system',
      content: 'You are a French tutor that will converse and help users speak and gain confidence in their French speaking skills.',
    },
    ...history.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    {
      role: 'user',
      content: message,
    },
  ];

  try {
    // Make the API request using Groq's chat completion method
    const chatCompletion = await client.chat.completions.create({
      messages: messages, // Pass the messages as the conversation context
      model: 'llama3-8b-8192',
      tools: {
        calculatorTool,
        improveTranslationTool,
      }
    });

    // Return the AI's response (ensure you're extracting the message correctly)
    return chatCompletion.choices[0].message.content;

  } catch (error) {
    console.error('Error with Groq SDK:', error);
    throw new Error('Failed to communicate with Groq');
  }
};


// Define the calculator tool
const calculatorTool = {
  name: 'calculator',
  state: {
    input: 'Add two numbers: ',
    variables: []
  },
  steps: [
    {
      name: 'Take user input',
      prompt_template: 'What are the two numbers you want to add?',
      action: 'user_input',
      parameters: {
        type: 'text'
      }
    },
    {
      name: 'Add numbers',
      action: 'add',
      parameters: {
        num1: 'number',
        num2: 'number'
      }
    }
  ]
};

const improveTranslationTool = {
  name: 'improve-translation',
  state: {
    input: 'Translate sentence: ',
    variables: []
  },
  steps: [
    {
      name: 'Extract sentence',
      prompt_template: 'What sentence do you want to translate?',
      action: 'extract-sentence',
      parameters: {
        type: 'text'
      }
    },
    {
      name: 'Send to API',
      action: 'send-to-api',
      parameters: {
        apiEndpoint: 'https://api.example.com/translate',
        sentence: 'sentence'
      }
    },
    {
      name: 'Update translation',
      action: 'update-translation',
      parameters: {
        translation: 'response'
      }
    }
  ]
};