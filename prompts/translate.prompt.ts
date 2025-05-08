import { definePrompt } from 'genkit';

export default definePrompt({
  name: 'translate',
  description: 'Translates text from one language to another',
  parameters: {
    text: {
      type: 'string',
      description: 'The text to translate',
    },
    sourceLanguage: {
      type: 'string',
      description: 'The source language code (optional, will be detected if not provided)',
      optional: true,
    },
    targetLanguage: {
      type: 'string',
      description: 'The target language code',
      defaultValue: 'en',
    },
  },
  prompt: ({ text, sourceLanguage, targetLanguage }) => {
    if (sourceLanguage) {
      return `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only respond with the translation, no additional text:
      
      "${text}"`;
    } else {
      return `Translate the following text to ${targetLanguage}. Only respond with the translation, no additional text:
      
      "${text}"`;
    }
  },
});