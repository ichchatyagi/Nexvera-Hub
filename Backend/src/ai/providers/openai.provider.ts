import {
  AiProvider,
  AiGenerateParams,
  AiResponse,
} from './ai-provider.interface';
import axios from 'axios';

export class OpenAiProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = 'gpt-3.5-turbo',
  ) {}

  async generate(params: AiGenerateParams): Promise<AiResponse> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: [
            { role: 'system', content: params.system },
            ...params.messages,
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const reply = response.data.choices[0].message.content;

      // Basic heuristic to extract suggested actions if the model follows a specific format
      // Or we can just return default actions for now.
      return {
        reply,
        suggested_actions: this.deriveActions(reply, params.context),
      };
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error('AI provider failed to generate response');
    }
  }

  private deriveActions(
    reply: string,
    context: any,
  ): { label: string; href: string }[] {
    const actions: { label: string; href: string }[] = [];
    if (context?.course?.slug) {
      actions.push({
        label: 'Continue Reading',
        href: `/courses/${context.course.slug}`,
      });
    }
    return actions;
  }
}
