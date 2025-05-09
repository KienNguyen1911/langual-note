import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { saveLocalTranslation } from '@/lib/localStorage';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TranslationResult {
  _id?: string;
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  timestamp: Date | number;
}

// Common languages with their codes
const languages = [
  { code: 'en', name: 'English' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'pt', name: 'Portuguese' },
];

// Function to call Google Translate API
const translateWithGoogleAPI = async (text: string, targetLanguage: string = 'en', sourceLanguage?: string): Promise<{ translatedText: string; detectedLanguage: string }> => {
  const response = await fetch('/api/google-translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, targetLanguage, sourceLanguage }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to translate text');
  }

  const data = await response.json();
  return {
    translatedText: data.translatedText,
    detectedLanguage: data.detectedLanguage
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
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [sourceLanguage, setSourceLanguage] = useState<string | undefined>(undefined);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
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
  const handlePipTranslate = async (pipText: string, pipTargetLanguage: string, pipSourceLanguage?: string) => {
    if (!pipText.trim()) return;

    try {
      // Call Google Translate API with the selected target language and source language (if specified)
      const { translatedText, detectedLanguage } = await translateWithGoogleAPI(pipText, pipTargetLanguage, pipSourceLanguage);

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
        // Find language names
        const detectedLangName = languages.find(lang => lang.code === savedTranslation.detectedLanguage)?.name || savedTranslation.detectedLanguage;
        const targetLangName = languages.find(lang => lang.code === targetLanguage)?.name || targetLanguage;

        // Determine what to show for source language
        let sourceLanguageDisplay = '';
        if (sourceLanguage) {
          const sourceLangName = languages.find(lang => lang.code === sourceLanguage)?.name || sourceLanguage;
          sourceLanguageDisplay = `<div style="width: 100%; box-sizing: border-box; overflow-wrap: break-word;">
            <span class="text-sm text-muted-foreground">
              Source language: <strong>${sourceLangName}</strong>
            </span>
          </div>`;
        } else {
          sourceLanguageDisplay = `<div style="width: 100%; box-sizing: border-box; overflow-wrap: break-word;">
            <span class="text-sm text-muted-foreground">
              Detected language: <strong>${detectedLangName}</strong>
            </span>
          </div>`;
        }

        pipResultDivRef.current.innerHTML = `
          ${sourceLanguageDisplay}
          <div class="space-y-2" style="width: 100%; box-sizing: border-box;">
            <h3 class="font-semibold">Original Text:</h3>
            <div class="p-3 bg-muted rounded-md" style="word-break: break-word; overflow-wrap: break-word; white-space: normal; max-width: 100%; box-sizing: border-box;">
              ${savedTranslation.originalText}
            </div>
          </div>
          <div class="space-y-2" style="width: 100%; box-sizing: border-box;">
            <h3 class="font-semibold">Translation (${targetLangName}):</h3>
            <div class="p-3 bg-muted rounded-md" style="word-break: break-word; overflow-wrap: break-word; white-space: normal; max-width: 100%; box-sizing: border-box;">
              ${savedTranslation.translatedText}
            </div>
          </div>
          <div class="text-xs text-muted-foreground mt-2" style="width: 100%; box-sizing: border-box; overflow-wrap: break-word;">
            Powered by Google Translate API
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

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium">Source Language:</label>
                </div>
                <select id="pipSourceLanguage" class="w-full p-2 border rounded-md">
                  <option value="">Auto detect</option>
                  ${languages.map(lang => `<option value="${lang.code}" ${lang.code === sourceLanguage ? 'selected' : ''}>${lang.name}</option>`).join('')}
                </select>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">Target Language:</label>
                <select id="pipTargetLanguage" class="w-full p-2 border rounded-md">
                  ${languages.map(lang => `<option value="${lang.code}" ${lang.code === targetLanguage ? 'selected' : ''}>${lang.name}</option>`).join('')}
                </select>
              </div>

              <div class="flex space-x-2">
                <button id="pipTranslateButton" class="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md">Translate</button>
              </div>
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

          // Get references to the PiP window elements
          pipTextareaRef.current = pipWindow.document.getElementById('pipTextarea') as HTMLTextAreaElement;
          const pipTranslateButton = pipWindow.document.getElementById('pipTranslateButton');
          const pipSourceLanguageSelect = pipWindow.document.getElementById('pipSourceLanguage') as HTMLSelectElement;
          const pipTargetLanguageSelect = pipWindow.document.getElementById('pipTargetLanguage') as HTMLSelectElement;


          // Add event listener to the translate button
          if (pipTranslateButton && pipTextareaRef.current && pipTargetLanguageSelect && pipSourceLanguageSelect) {
            pipTranslateButton.addEventListener('click', () => {
              if (pipTextareaRef.current) {
                const selectedTargetLanguage = pipTargetLanguageSelect.value;
                const selectedSourceLanguage = pipSourceLanguageSelect.value || undefined;
                handlePipTranslate(
                  pipTextareaRef.current.value, 
                  selectedTargetLanguage, 
                  selectedSourceLanguage === '' ? undefined : selectedSourceLanguage
                );
              }
            });
          }

          // If there's a translation result, show it in the PiP window
          if (translationResult) {
            // Find language names
            const detectedLangName = languages.find(lang => lang.code === translationResult.detectedLanguage)?.name || translationResult.detectedLanguage;
            const targetLangName = languages.find(lang => lang.code === targetLanguage)?.name || targetLanguage;

            resultDiv.innerHTML = `
              <div style="width: 100%; box-sizing: border-box; overflow-wrap: break-word;">
                <span class="text-sm text-muted-foreground">
                  Detected language: <strong>${detectedLangName}</strong>
                </span>
              </div>
              <div class="space-y-2" style="width: 100%; box-sizing: border-box;">
                <h3 class="font-semibold">Original Text:</h3>
                <div class="p-3 bg-muted rounded-md" style="word-break: break-word; overflow-wrap: break-word; white-space: normal; max-width: 100%; box-sizing: border-box;">
                  ${translationResult.originalText}
                </div>
              </div>
              <div class="space-y-2" style="width: 100%; box-sizing: border-box;">
                <h3 class="font-semibold">Translation (${targetLangName}):</h3>
                <div class="p-3 bg-muted rounded-md" style="word-break: break-word; overflow-wrap: break-word; white-space: normal; max-width: 100%; box-sizing: border-box;">
                  ${translationResult.translatedText}
                </div>
              </div>
              <div class="text-xs text-muted-foreground mt-2" style="width: 100%; box-sizing: border-box; overflow-wrap: break-word;">
                Powered by Google Translate API
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
    if (!inputText.trim()) {
      setError('Please enter text to translate.');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      // Call Google Translate API with the selected target language and source language (if specified)
      const { translatedText, detectedLanguage: resultDetectedLanguage } = await translateWithGoogleAPI(inputText, targetLanguage, sourceLanguage);

      const result: TranslationResult = {
        originalText: inputText,
        translatedText,
        detectedLanguage: resultDetectedLanguage,
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
      // Success message (would use toast if implemented)
      console.log('Translation Successful: The text has been translated.');
    } catch (err: any) {
      console.error('Translation error:', err);
      setError(err.message || 'Failed to translate text. Please try again later.');
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

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-1/2">
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="sourceLanguage">Source Language:</Label>
              </div>
              <Select
                value={sourceLanguage || 'auto-detect'}
                onValueChange={(value) => {
                  setSourceLanguage(value === 'auto-detect' ? undefined : value);
                  // Clear detected language when source language is manually selected
                  if (value !== 'auto-detect') {
                    setDetectedLanguage(null);
                  }
                }}
              >
                <SelectTrigger id="sourceLanguage">
                  <SelectValue placeholder="Auto detect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto-detect">Auto detect</SelectItem>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-1/2">
              <Label htmlFor="targetLanguage" className="mb-1 block">Target Language:</Label>
              <Select
                value={targetLanguage}
                onValueChange={setTargetLanguage}
              >
                <SelectTrigger id="targetLanguage">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Show detected language if auto-detect was used */}
          {detectedLanguage && !sourceLanguage ? (
            <div className="mt-2">
              <Label>Detected Language:</Label>
              <div className="p-2 bg-muted rounded-md mt-1">
                {languages.find(lang => lang.code === detectedLanguage)?.name || detectedLanguage}
              </div>
            </div>
          ) : null}

          <div className="flex space-x-2">
            <Button
              onClick={handleTranslate}
              disabled={!inputText.trim() || isTranslating}
              className="w-full"
            >
              {isTranslating ? 'Translating...' : 'Translate'}
            </Button>
          </div>

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
                Detected language: <strong>{languages.find(lang => lang.code === translationResult.detectedLanguage)?.name || translationResult.detectedLanguage}</strong>
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Original Text:</h3>
              <div className="p-3 bg-muted rounded-md">
                {translationResult.originalText}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">
                Translation ({languages.find(lang => lang.code === targetLanguage)?.name || targetLanguage}):
              </h3>
              <div className="p-3 bg-muted rounded-md">
                {translationResult.translatedText}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Powered by Google Translate API
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
