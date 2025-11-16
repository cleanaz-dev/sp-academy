export interface DeepgramTurnInfo {
  type: 'TurnInfo';
  request_id: string;
  sequence_id: number;
  event: 'Update' | 'StartOfTurn' | 'EagerEndOfTurn' | 'TurnResumed' | 'EndOfTurn';
  turn_index: number;
  audio_window_start: number;
  audio_window_end: number;
  transcript: string;
  words: Array<{
    word: string;
    confidence: number;
  }>;
  end_of_turn_confidence: number;
}

export interface DeepgramConnected {
  type: 'Connected';
  request_id: string;
  sequence_id: number;
}

export interface DeepgramError {
  type: 'Error';
  sequence_id: number;
  code: string;
  description: string;
}

export type DeepgramMessage = DeepgramTurnInfo | DeepgramConnected | DeepgramError;