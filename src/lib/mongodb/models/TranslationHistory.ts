import mongoose, { Schema, Document } from 'mongoose';

export interface ITranslationHistory extends Document {
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  timestamp: Date;
  userId?: string;
}

const TranslationHistorySchema: Schema = new Schema({
  originalText: { type: String, required: true },
  translatedText: { type: String, required: true },
  detectedLanguage: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: { type: String, index: true }
});

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.TranslationHistory || mongoose.model<ITranslationHistory>('TranslationHistory', TranslationHistorySchema);
