import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { saveLocalTranslation } from '@/lib/localStorage';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent as DefaultSelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import React from 'react';
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

// Custom SelectContent for PiP window that uses PiP window's document
const createPipSelectContent = (pipWindow: Window) => {
  // Create custom scroll buttons that match the original ones
  const PipSelectScrollUpButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
  >(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  ));

  const PipSelectScrollDownButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
  >(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  ));

  // Create custom SelectContent that uses PiP window's document
  const PipSelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
  >(({ className, children, position = "popper", ...props }, ref) => {
    // Create a custom portal that renders into the PiP window's document
    const PipPortal = ({ children }: { children: React.ReactNode }) => {
      return createPortal(
        children,
        pipWindow.document.body
      );
    };

    return (
      <PipPortal>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            position === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            className
          )}
          position={position}
          {...props}
        >
          <PipSelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              "p-1",
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <PipSelectScrollDownButton />
        </SelectPrimitive.Content>
      </PipPortal>
    );
  });

  return PipSelectContent;
};

// Function to render shadcn UI components in PiP window
function renderShadcnInPip(
  pipWindow: Window, 
  translationResult: TranslationResult | null, 
  targetLanguage: string, 
  sourceLanguage: string | undefined,
  languages: { code: string; name: string }[],
  onTranslate: (text: string, targetLang: string, sourceLang?: string) => Promise<void>,
  onTranslationResultChange: (result: TranslationResult | null) => void
) {
  // 1. Create root div in PiP window
  const pipRootDiv = pipWindow.document.createElement('div');
  pipRootDiv.id = 'react-pip-root';
  pipWindow.document.body.appendChild(pipRootDiv);

  // 2. Create React root and render component
  const root = ReactDOM.createRoot(pipRootDiv);

  // Create a custom SelectContent component for the PiP window
  const PipSelectContent = createPipSelectContent(pipWindow);

  // Create a PiP component that will be rendered in the PiP window
  const PipComponent = () => {
    // State for the PiP window
    const [inputText, setInputText] = React.useState(translationResult?.originalText || '');
    const [selectedTargetLang, setSelectedTargetLang] = React.useState(targetLanguage);
    const [selectedSourceLang, setSelectedSourceLang] = React.useState(sourceLanguage || 'auto-detect');
    const [isTranslating, setIsTranslating] = React.useState(false);
    const [pipTranslationResult, setPipTranslationResult] = React.useState(translationResult);

    // Find language names for display
    const detectedLangName = pipTranslationResult 
      ? (languages.find(lang => lang.code === pipTranslationResult.detectedLanguage)?.name || pipTranslationResult.detectedLanguage)
      : '';
    const targetLangName = languages.find(lang => lang.code === selectedTargetLang)?.name || selectedTargetLang;

    // Handle translation in the PiP window
    const handlePipTranslate = async () => {
      if (!inputText.trim()) return;

      setIsTranslating(true);
      try {
        await onTranslate(
          inputText, 
          selectedTargetLang, 
          selectedSourceLang === 'auto-detect' ? undefined : selectedSourceLang
        );
        // The parent component will update translationResult, which will be passed to this component
        // on the next render. We don't need to update pipTranslationResult here.
      } catch (error) {
        console.error('Error translating in PiP:', error);
      } finally {
        setIsTranslating(false);
      }
    };

    // Update local state when props change
    React.useEffect(() => {
      setPipTranslationResult(translationResult);
    }, [translationResult]);

    // Register a callback to update the translation result from the parent component
    React.useEffect(() => {
      // Store the callback in the ref provided by the parent component
      onTranslationResultChange((result) => {
        setPipTranslationResult(result);
      });
    }, []);

    return (
      <div className="p-4 bg-background text-foreground">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>🌍 Translation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-row space-x-4 sm:space-y-0 sm:space-x-4">
                <div className="w-1/2">
                  <Label htmlFor="pipSourceLanguage" className="mb-1 block">Source Language:</Label>
                  <Select
                    value={selectedSourceLang}
                    onValueChange={setSelectedSourceLang}
                  >
                    <SelectTrigger id="pipSourceLanguage">
                      <SelectValue placeholder="Auto detect" />
                    </SelectTrigger>
                    <PipSelectContent>
                      <SelectItem value="auto-detect">Auto detect</SelectItem>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </PipSelectContent>
                  </Select>
                </div>

                <div className="w-1/2">
                  <Label htmlFor="pipTargetLanguage" className="mb-1 block">Target Language:</Label>
                  <Select
                    value={selectedTargetLang}
                    onValueChange={setSelectedTargetLang}
                  >
                    <SelectTrigger id="pipTargetLanguage">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <PipSelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </PipSelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Textarea
                  id="pipInputText"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                  placeholder="Enter text to translate..."
                />
              </div>

              <Button
                onClick={handlePipTranslate}
                disabled={!inputText.trim() || isTranslating}
                className="w-full"
              >
                {isTranslating ? 'Translating...' : 'Translate'}
              </Button>

              {pipTranslationResult && (
                <div className="space-y-4 mt-4 pt-4 border-t">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {selectedSourceLang && selectedSourceLang !== 'auto-detect' ? 'Source language: ' : 'Detected language: '}
                      <strong>
                        {selectedSourceLang && selectedSourceLang !== 'auto-detect'
                          ? languages.find(lang => lang.code === selectedSourceLang)?.name || selectedSourceLang
                          : detectedLangName}
                      </strong>
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Original Text:</h3>
                    <div className="p-3 bg-muted rounded-md">
                      {pipTranslationResult.originalText}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">
                      Translation ({targetLangName}):
                    </h3>
                    <div className="p-3 bg-muted rounded-md">
                      {pipTranslationResult.translatedText}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Powered by Google Translate API
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render the PiP component
  root.render(
    <React.StrictMode>
      <PipComponent />
    </React.StrictMode>
  );

  return root;
}

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
  const pipReactRootRef = useRef<any>(null);
  // Function to update translation result in PiP window
  const onTranslationResultChangeRef = useRef<(result: TranslationResult | null) => void>(() => {});

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

      // If we're using the React-based PiP window, update it through the callback
      if (pipReactRootRef.current && onTranslationResultChangeRef.current) {
        // This will update the translation result in the PiP window
        onTranslationResultChangeRef.current(savedTranslation);
      }
      // For backwards compatibility with the old HTML-based PiP window
      else if (pipResultDivRef.current && pipWindowRef.current) {
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

          // Clean up React root if it exists
          if (pipReactRootRef.current) {
            pipReactRootRef.current.unmount();
            pipReactRootRef.current = null;
          }

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

        // Import styles from the main window to the PiP window
        const importGlobalCSS = () => {
          try {
            // Copy all stylesheets from the main window to the PiP window
            Array.from(document.styleSheets).forEach(styleSheet => {
              try {
                // Skip if the stylesheet is from a different origin (CORS restriction)
                if (styleSheet.href && new URL(styleSheet.href).origin !== window.location.origin) {
                  return;
                }

                const rules = Array.from(styleSheet.cssRules || []);
                if (rules.length > 0) {
                  const style = document.createElement('style');
                  rules.forEach(rule => {
                    style.appendChild(document.createTextNode(rule.cssText));
                  });
                  pipWindow.document.head.appendChild(style);
                }
              } catch (e) {
                // CORS errors when accessing cssRules are expected for external stylesheets
                console.log('Could not access rules from stylesheet:', e);
              }
            });

            // Add a class to the document to enable dark mode if needed
            if (document.documentElement.classList.contains('dark')) {
              pipWindow.document.documentElement.classList.add('dark');
            }
          } catch (error) {
            console.error('Error importing styles:', error);
          }
        };

        // Import and apply globals.css
        importGlobalCSS();

        // Use the new renderShadcnInPip function to render React components in the PiP window
        const reactRoot = renderShadcnInPip(
          pipWindow,
          translationResult,
          targetLanguage,
          sourceLanguage,
          languages,
          handlePipTranslate,
          (callback) => {
            // Store the callback in the ref so it can be called from handlePipTranslate
            onTranslationResultChangeRef.current = callback;
          }
        );
        pipReactRootRef.current = reactRoot;

        // Set up event listener for when PiP window closes
        pipWindow.addEventListener('pagehide', () => {
          // Clean up React root
          if (pipReactRootRef.current) {
            pipReactRootRef.current.unmount();
            pipReactRootRef.current = null;
          }

          setIsPipActive(false);
          pipWindowRef.current = null;
          pipTextareaRef.current = null;
          pipResultDivRef.current = null;
        });

        setIsPipActive(true);
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
                <DefaultSelectContent>
                  <SelectItem value="auto-detect">Auto detect</SelectItem>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </DefaultSelectContent>
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
                <DefaultSelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </DefaultSelectContent>
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
              Powered by AI Translation
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
