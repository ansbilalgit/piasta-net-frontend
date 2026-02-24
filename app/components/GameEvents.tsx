"use client";
import type { Item } from "../../lib/types";
import type { components } from "../../openapi/types";

interface GameEventsProps {
  gameEvents: components["schemas"]["CreateGameEventDto"][];
  games: Item[];
  setGameEvents: React.Dispatch<React.SetStateAction<components["schemas"]["CreateGameEventDto"][]>>;
  deleteGameEvent: (eventId: number | string, ownerUserId?: string) => Promise<boolean>;
}

import { useState } from "react";

export default function GameEvents({ gameEvents, games, setGameEvents, deleteGameEvent }: GameEventsProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    game: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    minPlayers: "",
    maxPlayers: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };
    // If endDate is empty and startDate is set, set endDate to startDate
    if (!updatedForm.endDate && updatedForm.startDate) {
      updatedForm.endDate = updatedForm.startDate;
    }
    // Auto-set endTime if game and startTime are set
    if ((name === "game" || name === "startTime") && updatedForm.game && updatedForm.startTime) {
      const item = games.find(g => g.name === updatedForm.game);
      if (item) {
        const duration = typeof item.length === "number" ? item.length : 60;
        const [h, m] = updatedForm.startTime.split(":");
        let startDate = new Date(updatedForm.startDate || new Date());
        startDate.setHours(parseInt(h, 10));
        startDate.setMinutes(parseInt(m, 10));
        startDate.setSeconds(0);
        let endDate = new Date(startDate.getTime() + duration * 60000);
        updatedForm.endDate = updatedForm.startDate || new Date().toISOString().split("T")[0];
        updatedForm.endTime = endDate
          .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
          .padStart(5, "0");
      }
    }
    // Auto-set startTime if game and endTime are set
    if ((name === "game" || name === "endTime") && updatedForm.game && updatedForm.endTime) {
      const item = games.find(g => g.name === updatedForm.game);
      if (item) {
        const duration = typeof item.length === "number" ? item.length : 60;
        const [h, m] = updatedForm.endTime.split(":");
        let endDate = new Date(updatedForm.endDate || new Date());
        endDate.setHours(parseInt(h, 10));
        endDate.setMinutes(parseInt(m, 10));
        endDate.setSeconds(0);
        let startDate = new Date(endDate.getTime() - duration * 60000);
        updatedForm.startDate = updatedForm.endDate || new Date().toISOString().split("T")[0];
        updatedForm.startTime = startDate
          .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
          .padStart(5, "0");
      }
    }
    if (name === "game" && value) {
      const item = games.find(g => g.name === value);
      if (item) {
        if (!form.minPlayers && typeof item.minPlayers === "number") {
          updatedForm.minPlayers = String(item.minPlayers);
        }
        if (!form.maxPlayers && typeof item.maxPlayers === "number") {
          updatedForm.maxPlayers = String(item.maxPlayers);
        }
      }
    }
    setForm(updatedForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const game = games.find(g => g.name === form.game);
    if (!game) {
      alert("Game not found");
      return;
    }
    const startDateTime = `${form.startDate}T${form.startTime}`;
    const endDateTime = `${form.endDate || form.startDate}T${form.endTime}`;
    const payload = {
      gameId: game.id,
      startTime: new Date(startDateTime).toISOString(),
      endTime: new Date(endDateTime).toISOString(),
      minNumberOfPlayers: Number(form.minPlayers),
      maxNumberOfPlayers: Number(form.maxPlayers),
      ownerUserId: "John Doe", // Replace with actual user if available
    };
    console.log("[GameEvents] POST payload:", payload);
    try {
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
      const newEvent = await response.json();
      setGameEvents(prev => [newEvent, ...prev]);
      setOpen(false);
      setForm({ game: "", startDate: "", startTime: "", endDate: "", endTime: "", minPlayers: "", maxPlayers: "" });
    } catch (err) {
      alert("Error creating game event");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setForm({ game: "", startDate: "", startTime: "", endDate: "", endTime: "", minPlayers: "", maxPlayers: "" });
  };

  return (
    <>
      <button className="btn-cta" style={{ marginBottom: '1rem' }} onClick={() => setOpen(true)}>Create Game Event</button>
      {open && (
        <div className="game-event-dialog-overlay">
          <div className="game-event-dialog">
            <h2>Create Game Event</h2>
            <form onSubmit={handleSubmit}>
              {/* ...existing code... */}
              <label>
                Game:
                <select name="game" value={form.game} onChange={handleChange} required>
                  <option value="">Select a game</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </label>
              {/* ...existing code... */}
              <label>
                Start Date:
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  min={form.startDate || new Date().toISOString().split("T")[0]}
                  required
                />
              </label>
              {/* ...existing code... */}
              <label>
                Start Time:
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
              </label>
              <label>
                End Time:
                <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
              </label>
              {/* ...existing code... */}
              <label>
                Min Players:
                <input type="number" name="minPlayers" min={1} max={20} value={form.minPlayers} onChange={handleChange} required />
              </label>
              <label>
                Max Players:
                <input type="number" name="maxPlayers" min={form.minPlayers || 1} max={20} value={form.maxPlayers} onChange={handleChange} required />
              </label>
              <div className="dialog-actions">
                <button type="submit" className="btn-cta">Submit</button>
                <button type="button" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="next-card next-card-wide">
        <h4>Existing Game Events</h4>
        {gameEvents.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {gameEvents.slice(0, 5).map((event, idx) => {
              const game = games.find(g => g.id === event.gameId);
              const gameName = game ? game.name : `Game #${event.gameId}`;
              // Use event.id (GUID) as the identifier for deletion
              return (
                <div key={idx} style={{ flex: '1 1 300px', minWidth: '260px', maxWidth: '350px', borderRadius: '12px', background: '#333', padding: '1rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{gameName}</div>
                  <div>Start: {event.startTime}</div>
                  <div>End: {event.endTime}</div>
                  <div>Min Players: {event.minNumberOfPlayers}</div>
                  <div>Max Players: {event.maxNumberOfPlayers}</div>
                  {event.ownerUserId && <div>Owner: {event.ownerUserId}</div>}
                  <button
                    style={{ marginTop: '0.75rem', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}
                    onClick={async () => {
                      const ok = await deleteGameEvent(event.id ?? '', event.ownerUserId ?? undefined);
                      if (ok) setGameEvents(gameEvents.filter((_, i) => i !== idx));
                      else alert('Failed to delete event');
                    }}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div>No events found</div>
        )}
      </div>
    </>
  );
}
