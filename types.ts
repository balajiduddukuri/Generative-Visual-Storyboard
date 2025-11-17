
export interface Scene {
  description: string;
  imageUrl?: string;
  error?: boolean;
  isGenerating?: boolean;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
}
