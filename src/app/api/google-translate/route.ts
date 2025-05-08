import { NextRequest, NextResponse } from 'next/server';
import { translateText } from '../../ai-service/flows/translate-text';
import { ai } from '../../ai-service/ai-instance';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage = 'en', sourceLanguage } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Detect language if sourceLanguage is not provided
    let detectedLanguage = sourceLanguage;
    if (!sourceLanguage) {
      try {
        // Use the detect-language prompt to detect the language
        const detectLanguagePrompt = (await import('@/prompts/detect-language.prompt')).default;
        // The updated prompt returns a string directly
        const languageCode = await detectLanguagePrompt({ text });
        detectedLanguage = languageCode ? languageCode.trim() : "auto";
      } catch (error) {
        console.error('Language detection error:', error);
        // If language detection fails, proceed with translation without it
        detectedLanguage = "auto";
      }
    }

    const result = await translateText({
      text,
      targetLanguage
    });

    // Add detected language to the response
    return NextResponse.json({
      translatedText: result.translatedText,
      detectedLanguage: detectedLanguage
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}
