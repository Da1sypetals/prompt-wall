export interface Prompt {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PromptWallData {
  prompts: Prompt[];
}

// Compose feature types
export type ComposeItemType = 'predefined' | 'custom';

export interface ComposeItem {
  id: string;           // 唯一标识（拖拽实例ID）
  type: ComposeItemType;
  promptId?: string;    // predefined 时关联原 prompt ID
  title?: string;       // predefined 时显示标题
  content: string;      // 内容（predefined 为原内容/custom 为用户输入）
}
