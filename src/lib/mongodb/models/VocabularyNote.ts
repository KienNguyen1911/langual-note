import mongoose, { Schema, Document } from 'mongoose';

export interface IVocabularyNote extends Document {
  word: string;
  meaning: string;
  pronunciation?: string;
  partOfSpeech?: string;
  example?: string;
  tags?: string[];
  createdAt: Date;
  userId?: string;
}

const VocabularyNoteSchema: Schema = new Schema({
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  pronunciation: { type: String },
  partOfSpeech: { type: String },
  example: { type: String },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  userId: { type: String, index: true }
});

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.VocabularyNote || mongoose.model<IVocabularyNote>('VocabularyNote', VocabularyNoteSchema);
