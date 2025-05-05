import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { saveLocalTranslation } from '@/lib/localStorage';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface TranslationResult {
  _id?: string;
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  timestamp: Date | number;
}

// Mock translation function as mentioned in the README
const mockTranslate = (text: string): { translatedText: string; detectedLanguage: string } => {
  // Simple mock implementation
  const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Russian', 'Arabic'];
  const detectedLanguage = languages[Math.floor(Math.random() * languages.length)];

  // Just reverse the text as a simple "translation" for demo purposes
  const translatedText = text.split('').reverse().join('');

  return {
    translatedText,
    detectedLanguage
  };
};

export default function Translation() {
  const { status } = useSession();
  const [inputText, setInputText] = useState('');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const { translatedText, detectedLanguage } = mockTranslate(inputText);

      const result: TranslationResult = {
        originalText: inputText,
        translatedText,
        detectedLanguage,
        timestamp: new Date()
      };

      let savedTranslation;

      // If user is authenticated, save to MongoDB
      if (status === 'authenticated') {
        // Save to translation history in MongoDB
        const response = await fetch('/api/translations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(result),
        });

        if (!response.ok) {
          throw new Error('Failed to save translation');
        }

        savedTranslation = await response.json();
      } 
      // If user is not authenticated, save to localStorage
      else {
        savedTranslation = saveLocalTranslation(result);
      }

      setTranslationResult(savedTranslation);
    } catch (err) {
      console.error('Error saving translation:', err);
      setError('Failed to save translation. Please try again later.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🌍 Translation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inputText">Enter text to translate:</Label>
            <Textarea
              id="inputText"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              placeholder="Type or paste text here..."
            />
          </div>

          <Button
            onClick={handleTranslate}
            disabled={!inputText.trim() || isTranslating}
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </Button>

          {error && (
            <div className="text-sm text-destructive mt-2">
              {error}
            </div>
          )}
        </div>
      </CardContent>

      {translationResult && (
        <CardContent className="border-t pt-6">
          <div className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">
                Detected language: <strong>{translationResult.detectedLanguage}</strong>
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Original Text:</h3>
              <div className="p-3 bg-muted rounded-md">
                {translationResult.originalText}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Translation:</h3>
              <div className="p-3 bg-muted rounded-md">
                {translationResult.translatedText}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Note: This is using a mock translation function. In a real application, this would be connected to a translation API.
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
