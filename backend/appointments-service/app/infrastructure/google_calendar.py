import os
import logging
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

SCOPES = ['https://www.googleapis.com/auth/calendar.events']

def get_calendar_service():
    """Build and return an authenticated Google Calendar service."""
    if not settings.GOOGLE_APPLICATION_CREDENTIALS:
        return None
    
    # Path to the service account JSON
    creds_path = settings.GOOGLE_APPLICATION_CREDENTIALS
    
    if not os.path.exists(creds_path):
        logger.warning(f"Google credentials file not found at {creds_path}")
        return None

    try:
        creds = service_account.Credentials.from_service_account_file(
            creds_path, scopes=SCOPES
        )
        service = build('calendar', 'v3', credentials=creds)
        return service
    except Exception as e:
        logger.error(f"Failed to initialize Google Calendar service: {e}")
        return None

def create_google_calendar_event(
    title: str,
    description: str,
    start_time: datetime,
    end_time: datetime,
    attendees: list[str] = None
):
    """
    Creates an event in Google Calendar and invites the attendees.
    Returns the event link if successful, None otherwise.
    """
    service = get_calendar_service()
    if not service:
        return None
        
    calendar_id = settings.GOOGLE_CALENDAR_ID
    
    attendees_list = [{"email": email} for email in (attendees or []) if email]
    
    event_body = {
        'summary': title,
        'description': description,
        'start': {
            'dateTime': start_time.isoformat(),
            'timeZone': 'America/Guayaquil', # Good default for Ecuador/local
        },
        'end': {
            'dateTime': end_time.isoformat(),
            'timeZone': 'America/Guayaquil',
        },
        'attendees': attendees_list,
        'reminders': {
            'useDefault': False,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 60},
            ],
        },
    }

    try:
        # insert handles sending emails to attendees automatically depending on sendUpdates
        event = service.events().insert(
            calendarId=calendar_id, 
            body=event_body,
            sendUpdates='all' # Send an email to all attendees
        ).execute()
        
        logger.info(f"Event created via Google API: {event.get('htmlLink')}")
        return event.get('htmlLink')
    except HttpError as error:
        logger.error(f"An error occurred calling Google Calendar API: {error}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return None
