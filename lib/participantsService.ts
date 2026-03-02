// lib/participantsService.ts

export interface WeeklyParticipant {
  userId: string;
  userName: string;
}

export interface WeeklyParticipantsResponse {
  eventId: string | null;
  participants: WeeklyParticipant[];
  totalCount: number;
}

const API_BASE_URL = "https://piasta-net-app.azurewebsites.net/api/GameEvents";
const CURRENT_USER = "John Doe"; // Replace with actual auth user


/**
 * Get the NEXT reset time (Upcoming Tuesday at 23:59) for the UI countdown
 */
export function getNextResetTime(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // Sunday is 0, Monday is 1, Tuesday is 2...

  // Calculate days until the next Tuesday
  let daysUntilTuesday = (2 - dayOfWeek + 7) % 7;

  // If today is Tuesday but it's already exactly 23:59, point to next week
  if (dayOfWeek === 2 && now.getHours() === 23 && now.getMinutes() >= 59) {
    daysUntilTuesday = 7;
  }

  const resetTime = new Date(now);
  resetTime.setDate(now.getDate() + daysUntilTuesday);
  resetTime.setHours(23, 59, 0, 0);
  return resetTime;
}

/**
 * Fetch the closest upcoming Game Event from the real API
 */
export async function fetchWeeklyParticipants(): Promise<WeeklyParticipantsResponse> {
  try {
    const response = await fetch(API_BASE_URL);
    if (response.ok) {
      const data = await response.json();

      // Grab the first event from the list to act as the "Weekly" event
      const items = data.items || [];
      if (items.length > 0) {
        const upcomingEvent = items[0];

        // The API returns an array of strings ["John Doe"], so we map it 
        // to objects so we don't have to rewrite your UI component
        const participantsList: string[] = upcomingEvent.participants || [];
        const mappedParticipants = participantsList.map(p => ({
          userId: p,
          userName: p
        }));

        return {
          eventId: upcomingEvent.id,
          participants: mappedParticipants,
          totalCount: participantsList.length,
        };
      }
    }
  } catch (err) {
    console.error("[ParticipantsService] API fetch failed:", err);
  }

  return { eventId: null, participants: [], totalCount: 0 };
}

/**
 * Join event using the real add-participant endpoint
 */
export async function joinWeeklyEvent(eventId: string, userId: string = CURRENT_USER): Promise<void> {
  const payload = {
    gameEventID: eventId,
    participantUserID: userId,
    requestingUserID: CURRENT_USER
  };

  const response = await fetch(`${API_BASE_URL}/add-participant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to join event: ${errorText}`);
  }
}

/**
 * Leave event using the real remove-participant endpoint
 */
export async function leaveWeeklyEvent(eventId: string, userId: string = CURRENT_USER): Promise<void> {
  const payload = {
    gameEventID: eventId,
    participantUserID: userId,
    requestingUserID: CURRENT_USER
  };

  const response = await fetch(`${API_BASE_URL}/remove-participant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to leave event: ${errorText}`);
  }
}

/**
 * Check if user has joined
 */
export function hasUserJoined(participants: WeeklyParticipant[], userId: string = CURRENT_USER): boolean {
  return participants.some(p => p.userId === userId);
}