import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found');
}

// Import models to ensure they're registered
import '../lib/mongodb/models/TranslationHistory';
import '../lib/mongodb/models/VocabularyNote';

async function testConnection() {
  try {
    console.log('Testing database connection...');

    // Get MongoDB URI from environment
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }

    // Connect directly to MongoDB
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });

    console.log('✅ Successfully connected to MongoDB!');
    console.log('Connection details:', {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      models: Object.keys(mongoose.models)
    });

    // Check database collections
    if (!mongoose.connection.db) {
      throw new Error('Database connection is not established');
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach((collection: { name: string }) => {
      console.log(`- ${collection.name}`);
    });

    // Validate models against collections
    console.log('\nValidating models against collections...');
    const modelNames = Object.keys(mongoose.models);
    for (const modelName of modelNames) {
      // Get the actual collection name used by Mongoose for this model
      const model = mongoose.models[modelName];
      const modelCollectionName = model.collection.name;

      const collectionExists = collections.some((c: { name: string }) => c.name === modelCollectionName);
      if (collectionExists) {
        console.log(`✅ Collection for model '${modelName}' exists as '${modelCollectionName}'`);
      } else {
        console.log(`⚠️ Collection for model '${modelName}' (expected as '${modelCollectionName}') does not exist yet`);
      }
    }

    await mongoose.connection.close();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
  }
}

testConnection();
