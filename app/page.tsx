"use client";
import { fetchGameEvents } from "../lib/gameEventsService";
import { fetchItems } from "../lib/itemsService";
import type { Item } from "../lib/types";
import type { components } from "../openapi/types";
// Delete endpoint
async function deleteGameEvent(eventId: number | string, ownerUserId?: string) {
  try {
    const url = `https://piasta-net-app.azurewebsites.net/api/GameEvents/${eventId}` + (ownerUserId ? `?ownerUserId=${encodeURIComponent(ownerUserId)}` : '');
    console.log('[GameEventCard] DELETE:', url);
    const res = await fetch(url, {
      method: 'DELETE',
    });
    console.log('[GameEventCard] DELETE response:', res.status, res.statusText);
    return res.ok;
  } catch (err) {
    console.error('[GameEventCard] DELETE error:', err);
    return false;
  }
}
import GameEventDialog from "./components/GameEventDialog";
import GameEvents from "./components/GameEvents";
import { useEffect, useState } from "react";
import { ParticipantCounter } from "./components/ParticipantsCard";

export default function HomePage() {
  const [gameEvents, setGameEvents] = useState<components["schemas"]["CreateGameEventDto"][]>([]);
  const [games, setGames] = useState<Item[]>([]);

  useEffect(() => {
    async function loadGameEvents() {
      try {
        const events = await fetchGameEvents();
        setGameEvents(events);
      } catch (err) {
        setGameEvents([]);
      }
    }
    async function loadGames() {
      try {
        const items = await fetchItems();
        setGames(items);
      } catch (err) {
        setGames([]);
      }
    }
    loadGameEvents();
    loadGames();
  }, []);

  return (
    <div className="site-container">
      <section className="hero">
        <div className="kicker">Game Design &amp; Technology</div>
        <h1 className="hero-title">Game Night Hub</h1>
        <p className="hero-sub">Your gateway to epic gaming sessions at GU</p>
        <a href="/games" className="btn-cta">Browse Games →</a>
      </section>

      <section className="next-game">
        <h3>Next Game Night — Every Tuesday</h3>
        <div className="next-card">
          <ParticipantCounter />
        </div>  
      </section>
      <GameEvents
        gameEvents={gameEvents}
        games={games}
        setGameEvents={setGameEvents}
        deleteGameEvent={deleteGameEvent}
      />
    </div>
  );
}