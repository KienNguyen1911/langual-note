import { ITranslationHistory } from './mongodb/models/TranslationHistory';
import { IVocabularyNote } from './mongodb/models/VocabularyNote';

// Keys for localStorage
const TRANSLATION_HISTORY_KEY = 'translation_history';
const VOCABULARY_NOTES_KEY = 'vocabulary_notes';

// Type for items stored in localStorage
type LocalStorageTranslation = {
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  timestamp: Date | number;
  _id?: string;
  localId: string;
  [key: string]: any;
};

type LocalStorageVocabulary = Omit<IVocabularyNote, '_id' | 'userId'> & {
  _id?: string;
  localId: string;
};

// Generate a unique ID for local items
const generateLocalId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
};

// Translation History Functions
export const getLocalTranslations = (): LocalStorageTranslation[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(TRANSLATION_HISTORY_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error parsing local translations:', error);
    return [];
  }
};

export const saveLocalTranslation = (translation: { 
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  timestamp: Date | number;
  [key: string]: any;
}): LocalStorageTranslation => {
  const localTranslations = getLocalTranslations();

  const newTranslation: LocalStorageTranslation = {
    ...translation,
    localId: generateLocalId()
  };

  localTranslations.unshift(newTranslation);
  localStorage.setItem(TRANSLATION_HISTORY_KEY, JSON.stringify(localTranslations));

  return newTranslation;
};

export const deleteLocalTranslation = (localId: string): boolean => {
  const localTranslations = getLocalTranslations();
  const filteredTranslations = localTranslations.filter(t => t.localId !== localId);

  if (filteredTranslations.length === localTranslations.length) {
    return false; // Nothing was deleted
  }

  localStorage.setItem(TRANSLATION_HISTORY_KEY, JSON.stringify(filteredTranslations));
  return true;
};

export const clearLocalTranslations = (): void => {
  localStorage.setItem(TRANSLATION_HISTORY_KEY, JSON.stringify([]));
};

// Vocabulary Note Functions
export const getLocalVocabularyNotes = (): LocalStorageVocabulary[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(VOCABULARY_NOTES_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error parsing local vocabulary notes:', error);
    return [];
  }
};

export const saveLocalVocabularyNote = (note: Omit<IVocabularyNote, '_id' | 'userId'>): LocalStorageVocabulary => {
  const localNotes = getLocalVocabularyNotes();

  const newNote: LocalStorageVocabulary = {
    ...note,
    localId: generateLocalId()
  };

  localNotes.unshift(newNote);
  localStorage.setItem(VOCABULARY_NOTES_KEY, JSON.stringify(localNotes));

  return newNote;
};

export const deleteLocalVocabularyNote = (localId: string): boolean => {
  const localNotes = getLocalVocabularyNotes();
  const filteredNotes = localNotes.filter(n => n.localId !== localId);

  if (filteredNotes.length === localNotes.length) {
    return false; // Nothing was deleted
  }

  localStorage.setItem(VOCABULARY_NOTES_KEY, JSON.stringify(filteredNotes));
  return true;
};

export const clearLocalVocabularyNotes = (): void => {
  localStorage.setItem(VOCABULARY_NOTES_KEY, JSON.stringify([]));
};

// Sync local data with user account
export const syncLocalDataWithUser = async (userId: string): Promise<void> => {
  // Sync translations
  const localTranslations = getLocalTranslations();
  if (localTranslations.length > 0) {
    try {
      // Upload each local translation to the server with the user ID
      for (const translation of localTranslations) {
        const { localId, ...translationData } = translation;
        await fetch('/api/translations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...translationData,
            userId
          }),
        });
      }

      // Clear local translations after successful sync
      clearLocalTranslations();
    } catch (error) {
      console.error('Error syncing translations:', error);
    }
  }

  // Sync vocabulary notes
  const localNotes = getLocalVocabularyNotes();
  if (localNotes.length > 0) {
    try {
      // Upload each local note to the server with the user ID
      for (const note of localNotes) {
        const { localId, ...noteData } = note;
        await fetch('/api/vocabulary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...noteData,
            userId
          }),
        });
      }

      // Clear local notes after successful sync
      clearLocalVocabularyNotes();
    } catch (error) {
      console.error('Error syncing vocabulary notes:', error);
    }
  }
};
