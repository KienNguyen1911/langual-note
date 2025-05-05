import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  getLocalVocabularyNotes, 
  saveLocalVocabularyNote, 
  deleteLocalVocabularyNote, 
  clearLocalVocabularyNotes 
} from '@/lib/localStorage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VocabularyNoteItem {
  _id?: string;
  localId?: string;
  word: string;
  meaning: string;
  pronunciation?: string;
  partOfSpeech?: string;
  example?: string;
  tags?: string[];
  createdAt: string | Date;
}

export default function VocabularyNote() {
  const [notes, setNotes] = useState<VocabularyNoteItem[]>([]);
  const [newNote, setNewNote] = useState<Omit<VocabularyNoteItem, '_id' | 'createdAt'>>({
    word: '',
    meaning: '',
    pronunciation: '',
    partOfSpeech: '',
    example: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notes from MongoDB on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/vocabulary');
        if (!response.ok) {
          throw new Error('Failed to fetch vocabulary notes');
        }
        const data = await response.json();
        setNotes(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching vocabulary notes:', err);
        setError('Failed to load vocabulary notes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewNote(prev => ({ ...prev, [name]: value }));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setNewNote(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!newNote.word.trim() || !newNote.meaning.trim()) {
      alert('Word and meaning are required!');
      return;
    }

    try {
      const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        throw new Error('Failed to save vocabulary note');
      }

      const savedNote = await response.json();
      setNotes(prev => [savedNote, ...prev]);
      setError(null);

      // Reset form
      setNewNote({
        word: '',
        meaning: '',
        pronunciation: '',
        partOfSpeech: '',
        example: '',
        tags: [],
      });
    } catch (err) {
      console.error('Error saving vocabulary note:', err);
      setError('Failed to save vocabulary note. Please try again later.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/vocabulary?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete vocabulary note');
      }

      setNotes(prev => prev.filter(note => note._id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting vocabulary note:', err);
      setError('Failed to delete vocabulary note. Please try again later.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📝 Vocabulary Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="word">
                Word <span className="text-destructive">*</span>
              </Label>
              <Input
                id="word"
                name="word"
                value={newNote.word}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meaning">
                Meaning <span className="text-destructive">*</span>
              </Label>
              <Input
                id="meaning"
                name="meaning"
                value={newNote.meaning}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pronunciation">Pronunciation</Label>
              <Input
                id="pronunciation"
                name="pronunciation"
                value={newNote.pronunciation}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partOfSpeech">Part of Speech</Label>
              <Select
                name="partOfSpeech"
                value={newNote.partOfSpeech === "" ? "placeholder" : newNote.partOfSpeech}
                onValueChange={(value) => setNewNote(prev => ({ ...prev, partOfSpeech: value === "placeholder" ? "" : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder">Select...</SelectItem>
                  <SelectItem value="noun">Noun</SelectItem>
                  <SelectItem value="verb">Verb</SelectItem>
                  <SelectItem value="adjective">Adjective</SelectItem>
                  <SelectItem value="adverb">Adverb</SelectItem>
                  <SelectItem value="preposition">Preposition</SelectItem>
                  <SelectItem value="conjunction">Conjunction</SelectItem>
                  <SelectItem value="pronoun">Pronoun</SelectItem>
                  <SelectItem value="interjection">Interjection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="example">Example</Label>
            <Textarea
              id="example"
              name="example"
              value={newNote.example}
              onChange={handleInputChange}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex space-x-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={handleTagInputChange}
                placeholder="Add a tag"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="secondary"
              >
                Add
              </Button>
            </div>

            {newNote.tags && newNote.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newNote.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="flex items-center"
                  >
                    {tag}
                    <Button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 text-destructive hover:text-destructive/90"
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full md:w-auto"
          >
            Save Note
          </Button>
        </form>

        {error && (
          <div className="mt-6 p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">
            Your Notes ({isLoading ? '...' : notes.length})
          </h3>

          {isLoading ? (
            <p className="text-muted-foreground">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="text-muted-foreground">No notes yet. Add your first vocabulary note above!</p>
          ) : (
            <div className="space-y-4">
              {notes.map(note => (
                <div key={note._id} className="border p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold">{note.word}</h4>
                    <Button
                      onClick={() => handleDelete(note._id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/90"
                    >
                      Delete
                    </Button>
                  </div>

                  <p><strong>Meaning:</strong> {note.meaning}</p>

                  {note.pronunciation && (
                    <p><strong>Pronunciation:</strong> {note.pronunciation}</p>
                  )}

                  {note.partOfSpeech && (
                    <p><strong>Part of Speech:</strong> {note.partOfSpeech}</p>
                  )}

                  {note.example && (
                    <p><strong>Example:</strong> {note.example}</p>
                  )}

                  {note.tags && note.tags.length > 0 && (
                    <div className="mt-2">
                      <strong>Tags:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {note.tags.map(tag => (
                          <Badge 
                            key={tag} 
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
