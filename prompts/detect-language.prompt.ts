import { ai } from '@/app/ai-service/ai-instance';
import { z } from 'genkit';

export default ai.definePrompt({
  name: 'detect-language',
  input: {
    schema: z.object({
      text: z.string().describe('The text to analyze'),
    }),
  },
  output: {
    schema: z.string().describe('The detected language code (e.g., "en", "fr", "vi", "es", etc.)'),
  },
  prompt: `Detect the language of the following text and respond with only the language code (e.g., 'en', 'fr', 'vi', 'es', etc.):

  "{{{text}}}"`,
});
