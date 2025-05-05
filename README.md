# Language Learning Hub

A web application to help you learn languages through vocabulary notes, translation, and tracking your learning history.

## Features

### 📝 Vocabulary Notes
- Save new words you're learning with detailed information
- Required fields: Word and Meaning
- Optional fields: Pronunciation, Part of Speech, Example, Tags
- View and delete your saved vocabulary notes
- Data is stored in MongoDB database

### 🌍 Translation
- Translate words or phrases
- Currently uses a mock translation function (simply reverses the text)
- Detects the "language" randomly for demonstration purposes
- In a real application, this would be connected to a translation API like Google Translate

### 🕒 Translation History
- View your translation history grouped by date
- Most recent translations appear at the top
- Delete individual translations or clear your entire history
- Data is stored in MongoDB database

## Technologies Used

- **Frontend Framework:** Next.js
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect)
- **Storage:** MongoDB (previously Browser Local Storage)

## Getting Started

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd langual-note
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following content:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```
   Replace `your_mongodb_connection_string` with your actual MongoDB connection string.

4. Test the database connection:
   ```bash
   npm run test-db
   # or
   yarn test-db
   ```
   This will verify that your application can connect to the MongoDB database, list all collections, and validate models against existing collections.

5. Run database migrations:
   ```bash
   npm run db:migrate
   # or
   yarn db:migrate
   ```
   This will create any missing collections in your MongoDB database based on your Mongoose models.

6. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
langual-note/
├── src/
│   ├── app/
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout component
│   │   ├── page.tsx          # Main page component
│   │   └── api/              # API routes
│   │       ├── translations/ # Translation API endpoints
│   │       └── vocabulary/   # Vocabulary API endpoints
│   ├── components/
│   │   ├── VocabularyNote.tsx    # Vocabulary notes component
│   │   ├── Translation.tsx       # Translation component
│   │   └── TranslationHistory.tsx # Translation history component
│   ├── lib/
│   │   └── mongodb/          # MongoDB integration
│   │       ├── connection.ts # Database connection setup
│   │       └── models/       # Mongoose models
│   │           ├── TranslationHistory.ts # Translation history model
│   │           └── VocabularyNote.ts     # Vocabulary note model
│   └── scripts/
│       └── test-db-connection.ts # Script to test database connection
├── public/                   # Static assets
├── .env.local                # Environment variables (not in version control)
├── package.json              # Project dependencies and scripts
└── README.md                 # Project documentation
```

## Implementation Details

- **MongoDB Database:** The application uses MongoDB to persist data between sessions
- **Responsive Design:** The UI is responsive and works on both desktop and mobile devices
- **Dark Mode Support:** The application supports both light and dark modes based on the user's system preferences

## Database Management

### Database Configuration

The application supports configuring the MongoDB database name in two ways:

1. **Via the connection URI in environment variables**
2. **Programmatically using the dbConnect function**

For detailed instructions, see the [Database Configuration Guide](docs/database-configuration.md).

### Connection Testing

The application includes a script to test the database connection:

```bash
npm run test-db
```

This script:
- Attempts to connect to the MongoDB database using the connection string in `.env.local`
- Displays connection details (host, database name)
- Lists all collections in the database
- Validates if collections for each Mongoose model exist in the database

### Database Migrations

The application includes a script to run database migrations:

```bash
npm run db:migrate
```

This script:
- Connects to the MongoDB database
- Checks if collections for each Mongoose model exist
- Creates collections for models that don't have corresponding collections
- Can be extended to handle schema changes (adding/modifying fields)

### Models

The application uses the following Mongoose models:

1. **TranslationHistory**
   - Stores translation history with original text, translated text, detected language, and timestamp

2. **VocabularyNote**
   - Stores vocabulary notes with word, meaning, pronunciation, part of speech, example, tags, and creation date

## Future Improvements

- **Real Translation API:** Replace the mock translation function with a real translation API
- **User Authentication:** Add login/signup functionality to save data to a user account
- **Additional Features:** Flashcards, quizzes, spaced repetition learning
- **UI/UX Improvements:** Add toast notifications, loading states, drag-and-drop functionality

## License

This project is open source and available under the [MIT License](LICENSE).
