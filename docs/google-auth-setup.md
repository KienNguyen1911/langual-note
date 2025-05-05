# Google Authentication Setup Guide

This guide explains how to set up Google OAuth authentication for the Language Learning Hub application.

## Prerequisites

1. A Google account
2. Access to the [Google Cloud Console](https://console.cloud.google.com/)

## Steps to Set Up Google OAuth

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a name for your project and click "Create"
5. Select your new project from the project dropdown

### 2. Configure the OAuth Consent Screen

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Select "External" as the user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required information:
   - App name: "Language Learning Hub"
   - User support email: Your email address
   - Developer contact information: Your email address
5. Click "Save and Continue"
6. Skip the "Scopes" section by clicking "Save and Continue"
7. Add test users if you're still in testing mode
8. Click "Save and Continue"
9. Review your settings and click "Back to Dashboard"

### 3. Create OAuth Client ID

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Name: "Language Learning Hub Web Client"
5. Authorized JavaScript origins: Add `http://localhost:3000` (for development)
6. Authorized redirect URIs: Add `http://localhost:3000/api/auth/callback/google`
7. Click "Create"
8. Note your Client ID and Client Secret

### 4. Update Environment Variables

1. Open the `.env.local` file in the root of the project
2. Update the following variables with your Google OAuth credentials:
   ```
   GOOGLE_CLIENT_ID=your-client-id-from-google-cloud-console
   GOOGLE_CLIENT_SECRET=your-client-secret-from-google-cloud-console
   ```
3. Generate a random string for NEXTAUTH_SECRET (you can use a tool like [this one](https://generate-secret.vercel.app/32))
   ```
   NEXTAUTH_SECRET=your-generated-secret-key
   ```
4. Make sure NEXTAUTH_URL is set to your application's URL (for local development, it should be `http://localhost:3000`)

### 5. Run Database Migration

Before starting the application, run the database migration to create the User collection:

```bash
npm run db:migrate
```

### 6. Start the Application

```bash
npm run dev
```

## Testing Authentication

1. Visit `http://localhost:3000` in your browser
2. Click the "Sign in" button in the header
3. You should be redirected to the Google login page
4. After signing in with your Google account, you should be redirected back to the application
5. Your profile picture and name should appear in the header, along with a "Sign out" button

## Production Deployment

When deploying to production:

1. Add your production domain to the Authorized JavaScript origins and redirect URIs in the Google Cloud Console
2. Update the NEXTAUTH_URL in your production environment to match your production URL
3. Generate a new NEXTAUTH_SECRET for your production environment