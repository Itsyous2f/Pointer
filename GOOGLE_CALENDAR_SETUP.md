# Google Calendar Integration Setup

This guide will help you set up Google Calendar integration for your calendar application.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "My Calendar App")
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In your Google Cloud project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on "Google Calendar API"
4. Click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: Your app name
   - User support email: Your email
   - Developer contact information: Your email
   - Save and continue through the steps

4. Create OAuth client ID:
   - Application type: Web application
   - Name: "Calendar App Web Client"
   - Authorized redirect URIs: 
     - For development: `http://localhost:3000/api/google-calendar/callback`
     - For production: `https://yourdomain.com/api/google-calendar/callback`
   - Click "Create"

5. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

Create a `.env.local` file in your project root and add:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback
```

For production, update the redirect URI to your domain.

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the Calendar tab
3. Click the settings icon in the sidebar
4. Click "Connect Google Calendar"
5. Follow the OAuth flow
6. You should see "Successfully connected to Google Calendar!"

## Features

Once connected, you can:

- **Sync Events**: Click "Sync Now" to sync events between your local calendar and Google Calendar
- **Bidirectional Sync**: Events created locally will be added to Google Calendar, and Google Calendar events will appear in your local calendar
- **Visual Indicators**: Google Calendar events are marked with an external link icon
- **Automatic Refresh**: Access tokens are automatically refreshed when needed

## Security Notes

- Never commit your `.env.local` file to version control
- The access tokens are stored in HTTP-only cookies for security
- Refresh tokens are used to automatically renew access when needed
- You can disconnect at any time using the "Disconnect" button

## Troubleshooting

### "Google Calendar API not configured"
- Make sure you've set up the environment variables correctly
- Restart your development server after adding environment variables

### "Failed to connect to Google Calendar"
- Check that your redirect URI matches exactly in Google Cloud Console
- Ensure the Google Calendar API is enabled
- Verify your OAuth consent screen is configured

### "Access token expired"
- The app should automatically refresh tokens
- If issues persist, try disconnecting and reconnecting

### Events not syncing
- Check that you have events in your Google Calendar
- Try clicking "Sync Now" manually
- Check the browser console for any error messages

## Production Deployment

For production deployment:

1. Update the redirect URI in Google Cloud Console to your production domain
2. Update the `GOOGLE_REDIRECT_URI` environment variable
3. Ensure your domain is added to authorized domains in OAuth consent screen
4. Consider implementing a proper database for token storage instead of cookies 