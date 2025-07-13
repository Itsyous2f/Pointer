import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

interface LocalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  color: string;
  googleEventId?: string;
  isGoogleEvent?: boolean;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  colorId?: string;
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    return data.access_token || null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}

async function getGoogleCalendarEvents(accessToken: string): Promise<GoogleCalendarEvent[]> {
  try {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), 1);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${oneMonthAgo.toISOString()}&` +
      `timeMax=${oneYearFromNow.toISOString()}&` +
      `singleEvents=true&` +
      `orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error);
    throw error;
  }
}

async function createGoogleCalendarEvent(accessToken: string, event: LocalEvent): Promise<string | null> {
  try {
    const startDate = new Date(`${event.date}T${event.time || '00:00:00'}`);
    const endDate = new Date(startDate.getTime() + (event.time ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)); // 1 hour or 1 day

    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create Google Calendar event: ${response.status}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Failed to create Google Calendar event:', error);
    return null;
  }
}

async function updateGoogleCalendarEvent(accessToken: string, googleEventId: string, event: LocalEvent): Promise<boolean> {
  try {
    const startDate = new Date(`${event.date}T${event.time || '00:00:00'}`);
    const endDate = new Date(startDate.getTime() + (event.time ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000));

    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Failed to update Google Calendar event:', error);
    return false;
  }
}

async function deleteGoogleCalendarEvent(accessToken: string, googleEventId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Failed to delete Google Calendar event:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('google_access_token')?.value;
    const refreshToken = request.cookies.get('google_refresh_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token found. Please reconnect to Google Calendar.' },
        { status: 401 }
      );
    }

    const { events: localEvents } = await request.json();

    // Try to get Google Calendar events
    let googleEvents: GoogleCalendarEvent[] = [];
    let currentAccessToken = accessToken;

    try {
      googleEvents = await getGoogleCalendarEvents(currentAccessToken);
    } catch (error) {
      // If access token is expired, try to refresh it
      if (refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken);
        if (newAccessToken) {
          currentAccessToken = newAccessToken;
          googleEvents = await getGoogleCalendarEvents(currentAccessToken);
        } else {
          return NextResponse.json(
            { error: 'Failed to refresh access token. Please reconnect to Google Calendar.' },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Access token expired and no refresh token available. Please reconnect to Google Calendar.' },
          { status: 401 }
        );
      }
    }

    // Convert Google events to local format
    const googleEventsMap = new Map<string, LocalEvent>();
    googleEvents.forEach((googleEvent) => {
      const startDate = googleEvent.start.dateTime 
        ? new Date(googleEvent.start.dateTime)
        : new Date(googleEvent.start.date!);
      
      const localEvent: LocalEvent = {
        id: `google_${googleEvent.id}`,
        title: googleEvent.summary,
        description: googleEvent.description || '',
        date: startDate.toISOString().split('T')[0],
        time: googleEvent.start.dateTime ? startDate.toTimeString().slice(0, 5) : '',
        color: googleEvent.colorId ? `bg-blue-500` : 'bg-blue-500', // Default color mapping
        googleEventId: googleEvent.id,
        isGoogleEvent: true,
      };
      
      googleEventsMap.set(googleEvent.id, localEvent);
    });

    // Merge local and Google events
    const mergedEvents: LocalEvent[] = [];
    const processedGoogleIds = new Set<string>();

    // Add all local events
    localEvents.forEach((localEvent: LocalEvent) => {
      if (localEvent.googleEventId) {
        processedGoogleIds.add(localEvent.googleEventId);
      }
      mergedEvents.push(localEvent);
    });

    // Add Google events that don't exist locally
    googleEvents.forEach((googleEvent) => {
      if (!processedGoogleIds.has(googleEvent.id)) {
        const startDate = googleEvent.start.dateTime 
          ? new Date(googleEvent.start.dateTime)
          : new Date(googleEvent.start.date!);
        
        const localEvent: LocalEvent = {
          id: `google_${googleEvent.id}`,
          title: googleEvent.summary,
          description: googleEvent.description || '',
          date: startDate.toISOString().split('T')[0],
          time: googleEvent.start.dateTime ? startDate.toTimeString().slice(0, 5) : '',
          color: googleEvent.colorId ? `bg-blue-500` : 'bg-blue-500',
          googleEventId: googleEvent.id,
          isGoogleEvent: true,
        };
        
        mergedEvents.push(localEvent);
      }
    });

    // Sync local events to Google Calendar (for events without googleEventId)
    const syncPromises: Promise<void>[] = [];
    
    localEvents.forEach((localEvent: LocalEvent) => {
      if (!localEvent.googleEventId && !localEvent.isGoogleEvent) {
        syncPromises.push(
          createGoogleCalendarEvent(currentAccessToken, localEvent)
            .then((googleEventId) => {
              if (googleEventId) {
                const eventIndex = mergedEvents.findIndex(e => e.id === localEvent.id);
                if (eventIndex !== -1) {
                  mergedEvents[eventIndex].googleEventId = googleEventId;
                }
              }
            })
        );
      }
    });

    await Promise.all(syncPromises);

    return NextResponse.json({
      success: true,
      events: mergedEvents,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Google Calendar' },
      { status: 500 }
    );
  }
} 