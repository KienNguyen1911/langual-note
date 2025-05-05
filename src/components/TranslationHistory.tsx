import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  getLocalTranslations, 
  deleteLocalTranslation, 
  clearLocalTranslations 
} from '@/lib/localStorage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TranslationResult {
  _id?: string;
  localId?: string;
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  timestamp: string | number | Date;
}

interface GroupedTranslations {
  [date: string]: TranslationResult[];
}

export default function TranslationHistory() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<TranslationResult[]>([]);
  const [groupedHistory, setGroupedHistory] = useState<GroupedTranslations>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load history from MongoDB or localStorage based on authentication status
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);

        // If user is authenticated, fetch from API
        if (status === 'authenticated') {
          const response = await fetch('/api/translations');
          if (!response.ok) {
            throw new Error('Failed to fetch translation history');
          }
          const data = await response.json();
          setHistory(data);
        } 
        // If user is not authenticated, get from localStorage
        else if (status === 'unauthenticated') {
          const localTranslations = getLocalTranslations();
          setHistory(localTranslations);
        }
        // If still loading auth status, wait
        else {
          // Don't set history yet, wait for auth status to resolve
          return;
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching translation history:', err);
        setError('Failed to load translation history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [status]);

  // Group translations by date whenever history changes
  useEffect(() => {
    const grouped = history.reduce<GroupedTranslations>((acc, item) => {
      const date = new Date(item.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    // Sort dates in descending order (newest first)
    const sortedGrouped: GroupedTranslations = {};
    Object.keys(grouped)
      .sort((a, b) => {
        const dateA = new Date(a).getTime();
        const dateB = new Date(b).getTime();
        return dateB - dateA;
      })
      .forEach(date => {
        sortedGrouped[date] = grouped[date];
      });

    setGroupedHistory(sortedGrouped);
  }, [history]);

  const handleDeleteItem = async (item: TranslationResult) => {
    try {
      // If item has _id, it's from the database
      if (item._id && status === 'authenticated') {
        const response = await fetch(`/api/translations?id=${item._id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete translation');
        }

        setHistory(prev => prev.filter(i => i._id !== item._id));
      } 
      // If item has localId, it's from localStorage
      else if (item.localId) {
        const success = deleteLocalTranslation(item.localId);
        if (!success) {
          throw new Error('Failed to delete translation from local storage');
        }

        setHistory(prev => prev.filter(i => i.localId !== item.localId));
      }

      setError(null);
    } catch (err) {
      console.error('Error deleting translation:', err);
      setError('Failed to delete translation. Please try again later.');
    }
  };

  const handleClearAll = async () => {
    try {
      // If authenticated, clear from database
      if (status === 'authenticated') {
        const response = await fetch('/api/translations?clearAll=true', {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to clear translation history');
        }
      } 
      // Otherwise, clear from localStorage
      else {
        clearLocalTranslations();
      }

      setHistory([]);
      setGroupedHistory({});
      setError(null);
    } catch (err) {
      console.error('Error clearing translation history:', err);
      setError('Failed to clear translation history. Please try again later.');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>🕒 Translation History</CardTitle>

        {!isLoading && history.length > 0 && (
          <Button
            onClick={handleClearAll}
            variant="ghost"
            className="text-destructive hover:text-destructive/90 text-sm"
          >
            Clear All
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-muted-foreground">Loading translation history...</p>
        ) : history.length === 0 ? (
          <p className="text-muted-foreground">No translation history yet. Translate something to see it here!</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedHistory).map(([date, translations]) => (
              <div key={date} className="border-t pt-4">
                <h3 className="font-semibold mb-2">{date}</h3>

                <div className="space-y-3">
                  {translations.map((item) => (
                    <div key={item._id || item.localId} className="p-3 bg-muted rounded-md relative">
                      <Button
                        onClick={() => handleDeleteItem(item)}
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-destructive hover:text-destructive/90"
                        aria-label="Delete"
                      >
                        ×
                      </Button>

                      <div className="mb-1 text-sm text-muted-foreground">
                        <span>
                          {new Date(item.timestamp).toLocaleTimeString()} • {item.detectedLanguage}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Original:</div>
                          <div className="text-sm break-words">{item.originalText}</div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Translation:</div>
                          <div className="text-sm break-words">{item.translatedText}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
