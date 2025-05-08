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
    const detectedLanguage = await ai.run('detect-language', {
      text,
    });

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