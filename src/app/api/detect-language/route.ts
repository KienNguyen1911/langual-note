import { NextRequest, NextResponse } from 'next/server';
import { ai } from '../../ai-service/ai-instance';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Use the detect-language prompt to detect the language
    const detectLanguagePrompt = (await import('@/prompts/detect-language.prompt')).default;
    const detectedLanguage = await detectLanguagePrompt({ text });

    return NextResponse.json({
      detectedLanguage: detectedLanguage.trim()
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to detect language' },
      { status: 500 }
    );
  }
}
