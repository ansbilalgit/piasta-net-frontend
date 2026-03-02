"use client";

import { useEffect, useState } from "react";
import { SmilePlus } from "lucide-react";
import { EventCounter } from "./EventCounter";
import GameEvents from "./GameEvents";
import { fetchItems } from "../../lib/itemsService";
import { fetchGameEvents } from "../../lib/gameEventsService";
import type { Item } from "../../lib/types";
import type { components } from "../../openapi/types";

type GameEventDto = components["schemas"]["CreateGameEventDto"];

export function SeekingPlayersPanel() {
  const [games, setGames] = useState<Item[]>([]);
  const [gameEvents, setGameEvents] = useState<GameEventDto[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [loadedGames, loadedEvents] = await Promise.all([
          fetchItems(),
          fetchGameEvents(),
        ]);
        setGames(loadedGames);
        setGameEvents(loadedEvents);
      } catch {
        setGames([]);
        setGameEvents([]);
      }
    };

    load();
  }, []);

  const deleteGameEvent = async (eventId: number | string, ownerUserId?: string): Promise<boolean> => {
    try {
      const id = String(eventId);
      const query = ownerUserId ? `?ownerUserId=${encodeURIComponent(ownerUserId)}` : "";
      const response = await fetch(`https://piasta-net-app.azurewebsites.net/api/GameEvents/${id}${query}`, {
        method: "DELETE",
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  return (
    <section className="seeking-players-section">
      <div className="seeking-players-head">
        <EventCounter
          icon={<SmilePlus size={16} strokeWidth={2} />}
          label="Games Seeking Players"
          count={gameEvents.length}
        />

        <GameEvents
          gameEvents={gameEvents}
          games={games}
          setGameEvents={setGameEvents}
          deleteGameEvent={deleteGameEvent}
          showCreateButton
          showList={false}
        />
      </div>

      <div className="seeking-players-field">
        <GameEvents
          gameEvents={gameEvents}
          games={games}
          setGameEvents={setGameEvents}
          deleteGameEvent={deleteGameEvent}
          showCreateButton={false}
          showList
        />
      </div>
    </section>
  );
}
