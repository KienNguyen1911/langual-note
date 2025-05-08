import { ai } from '@/app/ai-service/ai-instance';
import { z } from 'genkit';

// Define a flow to ensure proper handling of language detection
const detectLanguagePromptDef = ai.definePrompt({
  name: 'detect-language-prompt',
  input: {
    schema: z.object({
      text: z.string().describe('The text to analyze'),
    }),
  },
  output: {
    schema: z.object({
      languageCode: z.string().describe('The detected language code (e.g., "en", "fr", "vi", "es", etc.)'),
    }),
  },
  prompt: `Detect the language of the following text and respond with only the language code (e.g., 'en', 'fr', 'vi', 'es', etc.):

"{{{text}}}"

Your response must be a valid language code like "en", "fr", "es", "de", "it", "pt", "ru", "zh", "ja", "ko", etc.
Do not include any explanations or additional text, just the language code.`,
});

// Create a flow that wraps the prompt and ensures proper output handling
const detectLanguageFlow = ai.defineFlow(
  {
    name: 'detect-language-flow',
    inputSchema: z.object({
      text: z.string().describe('The text to analyze'),
    }),
    outputSchema: z.string().describe('The detected language code (e.g., "en", "fr", "vi", "es", etc.)'),
  },
  async (input) => {
    try {
      const { output } = await detectLanguagePromptDef(input);
      // Return the language code or default to "en" if not available
      return output?.languageCode || "en";
    } catch (error) {
      console.error('Error detecting language:', error);
      // Return a default language code if there's an error
      return "en";
    }
  }
);

export default detectLanguageFlow;
