import { ai } from '@/app/ai-service/ai-instance';
import { z } from 'genkit';

export default ai.definePrompt({
  name: 'translate',
  input: {
    schema: z.object({
      text: z.string().describe('The text to translate'),
      sourceLanguage: z.string().optional().describe('The source language code (optional, will be detected if not provided)'),
      targetLanguage: z.string().default('en').describe('The target language code'),
    }),
  },
  output: {
    schema: z.string().describe('The translated text'),
  },
  prompt: `{{#if sourceLanguage}}Translate the following text from {{{sourceLanguage}}} to {{{targetLanguage}}}. Only respond with the translation, no additional text:

      "{{{text}}}"{{else}}Translate the following text to {{{targetLanguage}}}. Only respond with the translation, no additional text:

      "{{{text}}}"{{/if}}`,
});
