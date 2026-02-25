// See openapi/swagger-link.txt for the current OpenAPI (Swagger) definition for the GameEvents API
// Types can be generated automatically from the spec

import type { components } from "../openapi/types";

// Replace GameEventPayload with types from openapi/types.ts if desired:
// type GameEventPayload = components["schemas"]["CreateGameEventDto"];

export interface GameEventPayload {
  gameId: number;
  startTime: string;
  endTime: string;
  minNumberOfPlayers: number;
  maxNumberOfPlayers: number;
  ownerUserId: string;
}

export async function createGameEvent(payload: GameEventPayload): Promise<any> {
  console.log("Sending GameEvent payload:", payload);
  const response = await fetch("https://piasta-net-app.azurewebsites.net/api/GameEvents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to create game event");
  }
  const data = await response.json();
  if (data && data.id) {
    console.log("[GameEventService] Created GameEvent GUID:", data.id);
  } else {
    console.warn("[GameEventService] No GUID returned in response:", data);
  }
  return data;
}

export async function fetchGameEvents(): Promise<components["schemas"]["CreateGameEventDto"][]> {
  const url = "https://piasta-net-app.azurewebsites.net/api/GameEvents?upcomingOnly=true&pastOnly=false";
  console.log("[GameEventsService] GET:", url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error("[GameEventsService] GET failed:", response.status, response.statusText);
      throw new Error("Failed to fetch game events");
    }
    const data = await response.json();
    console.log("[GameEventsService] Response:", data);
    // Extract array from items property if present
    if (data && Array.isArray(data.items)) {
        return data.items;
    }
    // Fallback: if data itself is an array
    if (Array.isArray(data)) {
        return data;
    }
    // Otherwise, return empty array
    return [];
}
