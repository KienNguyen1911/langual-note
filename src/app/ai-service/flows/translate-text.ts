'use server';
/**
 * @fileOverview A text translation AI agent.
 *
 * - translateText - A function that translates text from one language to another.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/app/ai-service/ai-instance';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguage: z.string().describe('The target language for translation.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {
    schema: z.object({
      text: z.string().describe('The text to translate.'),
      targetLanguage: z.string().describe('The target language for translation.'),
    }),
  },
  output: {
    schema: z.object({
      translatedText: z.string().describe('The translated text.'),
    }),
  },
  prompt: `Translate the following text into {{{targetLanguage}}}:\n\n{{{text}}}`,
});

const translateTextFlow = ai.defineFlow<
    typeof TranslateTextInputSchema,
    typeof TranslateTextOutputSchema
>(
    {
      name: 'translateTextFlow',
      inputSchema: TranslateTextInputSchema,
      outputSchema: TranslateTextOutputSchema,
    },
    async input => {
      const {output} = await prompt(input);
      return output!;
    }
);
