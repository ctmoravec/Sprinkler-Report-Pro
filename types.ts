
export interface SprinklerData {
  property: string;
  reportDate: string;
  category: string;
  sectionLabel: string;
  deviceType: string;
  location: string;
  issueDescription: string;
  quantity: string;
  actionRequired: string;
  resultMark: string;
  inspectorNotes: string;
  photoLinks: string;
  sourceFile: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
}
