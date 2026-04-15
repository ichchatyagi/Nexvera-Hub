import {
  AiProvider,
  AiGenerateParams,
  AiResponse,
} from './ai-provider.interface';

export class StubAiProvider implements AiProvider {
  async generate(params: AiGenerateParams): Promise<AiResponse> {
    const { courseIdOrSlug } = params.context || {};

    return {
      reply: `[STUB MODE] I am your Nexvera Assistant. I see you're asking about "${params.messages[params.messages.length - 1].content}". 
      Currently, no AI provider (like OpenAI or Anthropic) is configured. 
      However, I can see you are in ${courseIdOrSlug ? `course ${courseIdOrSlug}` : 'your dashboard'}.`,
      suggested_actions: [
        { label: 'View Catalog', href: '/courses' },
        { label: 'My Dashboard', href: '/dashboard' },
      ],
    };
  }
}
