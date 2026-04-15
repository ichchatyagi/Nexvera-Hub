export interface AiGenerateParams {
  system: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  context?: any;
}

export interface AiResponse {
  reply: string;
  suggested_actions?: { label: string; href: string }[];
}

export interface AiProvider {
  generate(params: AiGenerateParams): Promise<AiResponse>;
}
