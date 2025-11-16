//lib/deepgram/services/sst-service.ts

import { deepgramAPI } from '../client';

export interface DeepgramTokenResponse {
  token: string;
  expiresAt: number;
}

export interface STTConfig {
  model?: string;
  language?: string;
  encoding?: string;
  sampleRate?: number;
}

/**
 * Creates a temporary token for client-side Deepgram connections
 * Token expires in 30 seconds
 */
export async function createTemporaryToken(): Promise<DeepgramTokenResponse> {
  try {
    const { result, error } = await deepgramAPI.auth.grantToken({
      // 30 seconds TTL (default)
      expirationSeconds: 30,
    });

    if (error) {
      throw new Error(`Failed to create token: ${error.message}`);
    }

    return {
      token: result.access_token,
      expiresAt: Date.now() + 30000, // 30 seconds from now
    };
  } catch (error) {
    console.error('Error creating Deepgram token:', error);
    throw error;
  }
}

/**
 * Get WebSocket URL with parameters
 */
export function getSTTWebSocketUrl(config: STTConfig = {}): string {
  const params = new URLSearchParams({
    model: config.model || 'flux-general-en',
    encoding: config.encoding || 'linear16',
    sample_rate: String(config.sampleRate || 16000),
  });

  if (config.language) {
    params.append('language', config.language);
  }

  return `wss://api.deepgram.com/v2/listen?${params}`;
}