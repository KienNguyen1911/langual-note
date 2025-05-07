import { useState, useRef, useEffect } from 'react';
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
  const [isPipSupported, setIsPipSupported] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const translationCardRef = useRef<HTMLDivElement>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const pipTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pipResultDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Check if Document Picture-in-Picture API is supported
    if ('documentPictureInPicture' in window) {
      setIsPipSupported(true);
    }
  }, []);

  // Function to handle translation in the PiP window
  const handlePipTranslate = async (pipText: string) => {
    if (!pipText.trim()) return;

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const { translatedText, detectedLanguage } = mockTranslate(pipText);

      const result: TranslationResult = {
        originalText: pipText,
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

      // Update the main component's state
      setTranslationResult(savedTranslation);

      // Update the PiP window with the translation result
      if (pipResultDivRef.current && pipWindowRef.current) {
        pipResultDivRef.current.innerHTML = `
          <div style="width: 100%; box-sizing: border-box; overflow-wrap: break-word;">
            <span class="text-sm text-muted-foreground">
              Detected language: <strong>${savedTranslation.detectedLanguage}</strong>
            </span>
          </div>
          <div class="space-y-2" style="width: 100%; box-sizing: border-box;">
            <h3 class="font-semibold">Original Text:</h3>
            <div class="p-3 bg-muted rounded-md" style="word-break: break-word; overflow-wrap: break-word; white-space: normal; max-width: 100%; box-sizing: border-box;">
              ${savedTranslation.originalText}
            </div>
          </div>
          <div class="space-y-2" style="width: 100%; box-sizing: border-box;">
            <h3 class="font-semibold">Translation:</h3>
            <div class="p-3 bg-muted rounded-md" style="word-break: break-word; overflow-wrap: break-word; white-space: normal; max-width: 100%; box-sizing: border-box;">
              ${savedTranslation.translatedText}
            </div>
          </div>
          <div class="text-xs text-muted-foreground mt-2" style="width: 100%; box-sizing: border-box; overflow-wrap: break-word;">
            Note: This is using a mock translation function.
          </div>
        `;
        pipResultDivRef.current.style.display = 'block';
      }
    } catch (err) {
      console.error('Error saving translation:', err);
      if (pipWindowRef.current) {
        const errorDiv = pipWindowRef.current.document.createElement('div');
        errorDiv.className = 'text-sm text-red-500 mt-2';
        errorDiv.textContent = 'Failed to save translation. Please try again later.';
        pipWindowRef.current.document.body.appendChild(errorDiv);
      }
    }
  };

  const togglePictureInPicture = async () => {
    if (!isPipSupported) return;

    try {
      if (isPipActive) {
        // Exit PiP mode
        if (document.exitPictureInPicture) {
          await document.exitPictureInPicture();
          setIsPipActive(false);
          pipWindowRef.current = null;
          pipTextareaRef.current = null;
          pipResultDivRef.current = null;
        }
      } else {
        // Enter PiP mode
        const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 380,
          height: 500
        });

        // Store reference to the PiP window
        pipWindowRef.current = pipWindow;

        // Clone the translation card content for PiP window
        if (translationCardRef.current) {
          const pipContent = document.createElement('div');
          pipContent.className = 'p-4 bg-background text-foreground';
          pipContent.style.width = '100%';
          pipContent.style.boxSizing = 'border-box';
          pipContent.style.overflowX = 'hidden';
          pipContent.innerHTML = `
            <h2 class="text-xl font-bold mb-4">🌍 Translation</h2>
            <div class="space-y-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Enter text to translate:</label>
                <textarea 
                  id="pipTextarea"
                  class="w-full min-h-[100px] p-2 border rounded-md" 
                  style="max-width: 100%; box-sizing: border-box; overflow-wrap: break-word;"
                  placeholder="Type or paste text here..."
                ></textarea>
              </div>
              <button id="pipTranslateButton" class="px-4 py-2 bg-primary text-primary-foreground rounded-md">Translate</button>
            </div>
          `;

          // Create a div for translation results
          const resultDiv = document.createElement('div');
          resultDiv.id = 'pipResultDiv';
          resultDiv.className = 'mt-4 space-y-4 border-t pt-4';
          resultDiv.style.display = 'none';
          resultDiv.style.width = '100%';
          resultDiv.style.maxWidth = '100%';
          resultDiv.style.boxSizing = 'border-box';
          resultDiv.style.overflowX = 'hidden';
          resultDiv.style.wordBreak = 'break-word';
          resultDiv.style.overflowWrap = 'break-word';
          pipContent.appendChild(resultDiv);

          // Store reference to the result div
          pipResultDivRef.current = resultDiv;

          // Add the content to the PiP window
          pipWindow.document.body.appendChild(pipContent);

          // Get reference to the textarea and translate button
          pipTextareaRef.current = pipWindow.document.getElementById('pipTextarea') as HTMLTextAreaElement;
          const pipTranslateButton = pipWindow.document.getElementById('pipTranslateButton');

          // Add event listener to the translate button
          if (pipTranslateButton && pipTextareaRef.current) {
            pipTranslateButton.addEventListener('click', () => {
              if (pipTextareaRef.current) {
                handlePipTranslate(pipTextareaRef.current.value);
              }
            });
          }

          // If there's a translation result, show it in the PiP window
          if (translationResult) {
            resultDiv.innerHTML = `
              <div style="width: 100%; box-sizing: border-box; overflow-wrap: break-word;">
                <span class="text-sm text-muted-foreground">
                  Detected language: <strong>${translationResult.detectedLanguage}</strong>
                </span>
              </div>
              <div class="space-y-2" style="width: 100%; box-sizing: border-box;">
                <h3 class="font-semibold">Original Text:</h3>
                <div class="p-3 bg-muted rounded-md" style="word-break: break-word; overflow-wrap: break-word; white-space: normal; max-width: 100%; box-sizing: border-box;">
                  ${translationResult.originalText}
                </div>
              </div>
              <div class="space-y-2" style="width: 100%; box-sizing: border-box;">
                <h3 class="font-semibold">Translation:</h3>
                <div class="p-3 bg-muted rounded-md" style="word-break: break-word; overflow-wrap: break-word; white-space: normal; max-width: 100%; box-sizing: border-box;">
                  ${translationResult.translatedText}
                </div>
              </div>
              <div class="text-xs text-muted-foreground mt-2" style="width: 100%; box-sizing: border-box; overflow-wrap: break-word;">
                Note: This is using a mock translation function.
              </div>
            `;
            resultDiv.style.display = 'block';

            // Pre-fill the textarea with the previous input
            if (pipTextareaRef.current) {
              pipTextareaRef.current.value = translationResult.originalText;
            }
          }

          // Add styles to the PiP window
          const styleElement = document.createElement('style');
          styleElement.textContent = `
            body {
              margin: 0;
              font-family: system-ui, sans-serif;
              background-color: white;
              color: black;
              overflow-x: hidden;
              max-width: 100%;
              box-sizing: border-box;
            }
            .bg-background { background-color: white; }
            .text-foreground { color: black; }
            .bg-primary { background-color: #0070f3; }
            .text-primary-foreground { color: white; }
            .bg-muted { background-color: #f5f5f5; }
            .text-muted-foreground { color: #666; }
            .text-red-500 { color: #ef4444; }
            .border { border: 1px solid #e5e5e5; }
            .rounded-md { border-radius: 0.375rem; }
            .p-3.bg-muted.rounded-md { 
              word-break: break-word; 
              overflow-wrap: break-word; 
              white-space: normal;
              max-width: 100%;
              box-sizing: border-box;
            }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .p-2 { padding: 0.5rem; }
            .p-3 { padding: 0.75rem; }
            .p-4 { padding: 1rem; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-4 { margin-top: 1rem; }
            .mb-4 { margin-bottom: 1rem; }
            .pt-4 { padding-top: 1rem; }
            .border-t { border-top: 1px solid #e5e5e5; }
            .min-h-\\[100px\\] { min-height: 100px; }
            .w-full { width: 100%; }
            .text-sm { font-size: 0.875rem; }
            .text-xs { font-size: 0.75rem; }
            .text-xl { font-size: 1.25rem; }
            .font-medium { font-weight: 500; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: 700; }
            button:hover { opacity: 0.9; }
            button:active { opacity: 0.8; }
          `;
          pipWindow.document.head.appendChild(styleElement);

          // Set up event listener for when PiP window closes
          pipWindow.addEventListener('pagehide', () => {
            setIsPipActive(false);
            pipWindowRef.current = null;
            pipTextareaRef.current = null;
            pipResultDivRef.current = null;
          });

          setIsPipActive(true);
        }
      }
    } catch (error) {
      console.error('Failed to toggle Picture-in-Picture mode:', error);
    }
  };

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
    <Card ref={translationCardRef}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>🌍 Translation</CardTitle>
        {isPipSupported && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={togglePictureInPicture}
            className="ml-auto"
          >
            {isPipActive ? 'Exit PiP' : 'Pop Out'}
          </Button>
        )}
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
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          {isPipSupported 
            ? "Use 'Pop Out' to keep the translator in a floating window that stays on top of other windows."
            : "Picture-in-Picture is not supported in your browser."}
        </p>
      </CardFooter>
    </Card>
  );
}
