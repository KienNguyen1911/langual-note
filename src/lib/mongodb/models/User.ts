import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  emailVerified?: Date;
  accounts?: {
    provider: string;
    providerAccountId: string;
    access_token?: string;
    expires_at?: number;
    refresh_token?: string;
    id_token?: string;
    token_type?: string;
    scope?: string;
    session_state?: string;
  }[];
  sessions?: {
    sessionToken: string;
    expires: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  emailVerified: { type: Date },
  accounts: [{
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true },
    access_token: { type: String },
    expires_at: { type: Number },
    refresh_token: { type: String },
    id_token: { type: String },
    token_type: { type: String },
    scope: { type: String },
    session_state: { type: String }
  }],
  sessions: [{
    sessionToken: { type: String, required: true },
    expires: { type: Date, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create compound index for provider and providerAccountId
UserSchema.index({ 'accounts.provider': 1, 'accounts.providerAccountId': 1 }, { unique: true, sparse: true });

// Create index for sessionToken
UserSchema.index({ 'sessions.sessionToken': 1 }, { unique: true, sparse: true });

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);