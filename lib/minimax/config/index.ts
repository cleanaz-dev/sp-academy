import Anthropic from '@anthropic-ai/sdk';

export const miniMax = new Anthropic({
    apiKey: process.env['MINIMAX_API_KEY'],
})

export const MINIMAX_MODELS = {
    M2_5: 'MiniMax-M2.5',
    M2_5_LIGHTNING: 'MiniMax-M2.5-lightning',
    M2_1: 'MiniMax-M2.1',
    M2_1_LIGHTNING: 'MiniMax-M2.1-lightning',
    M2: 'MiniMax-M2',
} as const;

export type MiniMaxModel = typeof MINIMAX_MODELS[keyof typeof MINIMAX_MODELS];