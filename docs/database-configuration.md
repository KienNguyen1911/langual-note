# Database Configuration Guide

This guide explains how to configure the MongoDB database name for your application.

## Method 1: Modify the Connection URI in Environment Variables

You can specify the database name directly in the MongoDB connection URI in your `.env` or `.env.local` file.

The MongoDB connection URI format is:
```
mongodb+srv://<username>:<password>@<cluster-address>/<database-name>?<options>
```

To change the database name, edit your `.env` or `.env.local` file and modify the `MONGODB_URI` variable:

```
# Original URI without database name
MONGODB_URI=mongodb+srv://username:password@cluster-address/?retryWrites=true&w=majority

# Modified URI with database name
MONGODB_URI=mongodb+srv://username:password@cluster-address/my_database_name?retryWrites=true&w=majority
```

Note the addition of `/my_database_name` before the `?` character.

## Method 2: Use the dbConnect Function with a Database Name Parameter

The application's `dbConnect` function now accepts an optional database name parameter. This allows you to specify a database name programmatically without changing the environment variables.

Example usage:

```typescript
import dbConnect from '../lib/mongodb/connection';

// Connect to the default database (from MONGODB_URI)
const mongoose = await dbConnect();

// OR

// Connect to a custom database
const mongoose = await dbConnect('my_custom_database');
```

## Example Script

An example script is provided at `src/scripts/connect-custom-db.ts` that demonstrates how to connect to a custom database.

To run the example:

```bash
npx ts-node src/scripts/connect-custom-db.ts
```

## Checking Your Current Database

To check which database you're currently connected to, you can run the test connection script:

```bash
npx ts-node src/scripts/test-db-connection.ts
```

This will display information about your connection, including the database name.