export interface Prompt {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  order: number;
}

export interface PromptWallData {
  prompts: Prompt[];
}
