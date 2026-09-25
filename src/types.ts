export interface SavedCombination {
  id: string;
  numbers: number[]; // 6 unique numbers between 1 and 45, sorted
  createdAt: number; // millisecond timestamp
  label?: string; // e.g. "조합 #1"
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  status?: 'sending' | 'delivered' | 'error';
  contextNumbers?: number[];
  suggestedFollowUps?: string[];
}
