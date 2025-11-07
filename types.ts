export type Page = 'chat' | 'settings';

export interface Settings {
  theme: 'light' | 'dark';
  persona: string;
  context: string;
}

export interface CodeFile {
  id: string;
  filename: string;
  language: string;
  content: string;
  undoStack: string[];
  redoStack: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  // The conversational text part of the message.
  textContent: string;
  // An array of IDs linking to any code files generated in this turn.
  codeFileIds: string[];
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}
