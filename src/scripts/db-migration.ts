// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import dbConnect from '../lib/mongodb/connection';
import mongoose from 'mongoose';

// Import models to ensure they're registered
import '../lib/mongodb/models/TranslationHistory';
import '../lib/mongodb/models/VocabularyNote';
import '../lib/mongodb/models/User';

async function runMigration() {
  try {
    console.log('Starting database migration...');
    const mongoose = await dbConnect();

    // Get all registered models
    const modelNames = Object.keys(mongoose.models);
    console.log(`Found ${modelNames.length} models to migrate`);

    // Get existing collections
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name.toLowerCase());

    // Process each model
    for (const modelName of modelNames) {
      const model = mongoose.models[modelName];
      const collectionName = model.collection.name.toLowerCase();

      if (collectionNames.includes(collectionName)) {
        console.log(`✅ Collection '${collectionName}' already exists`);

        // Here you could add code to update existing collection schema
        // For example, adding new fields with default values

      } else {
        console.log(`⚠️ Collection '${collectionName}' does not exist, creating...`);

        // Create a new document to initialize the collection
        try {
          // This will create the collection with the current schema
          if (!mongoose.connection.db) {
            throw new Error('Database connection not established');
          }
          await mongoose.connection.db.createCollection(collectionName);
          console.log(`✅ Created collection '${collectionName}'`);
        } catch (error) {
          console.error(`❌ Failed to create collection '${collectionName}':`, error);
        }
      }
    }

    console.log('\nMigration completed');
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
runMigration();
