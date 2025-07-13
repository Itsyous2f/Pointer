import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google-calendar/callback';

export async function GET() {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Google Calendar API not configured' },
      { status: 500 }
    );
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar')}&` +
    `access_type=offline&` +
    `prompt=consent`;

  return NextResponse.json({ authUrl });
} 