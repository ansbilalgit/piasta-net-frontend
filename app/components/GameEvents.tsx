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
            {gameEvents.map((event, idx) => {
              const game = games.find(g => g.id === event.gameId);
              const gameName = game ? game.name : `Game #${event.gameId}`;
              // Use event.id (GUID) as the identifier for deletion
              return (
                <div key={idx} className="flex-[1_1_300px] min-w-[280px] max-w-[360px] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 overflow-hidden">
                  {/* Card Header */}
                  <div className="px-5 py-4 bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border-b border-cyan-500/10">
                    <h3 className="text-lg font-bold text-white tracking-tight">{gameName}</h3>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    {/* Time Row */}
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-5 h-5 flex items-center justify-center text-cyan-400">🕐</span>
                      <span className="text-slate-400 font-medium">Start</span>
                      <span className="ml-auto text-slate-200 font-semibold">{event.startTime ? new Date(event.startTime).toLocaleString() : 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-5 h-5 flex items-center justify-center text-purple-400">🏁</span>
                      <span className="text-slate-400 font-medium">End</span>
                      <span className="ml-auto text-slate-200 font-semibold">{event.endTime ? new Date(event.endTime).toLocaleString() : 'N/A'}</span>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-3"></div>
                    
                    {/* Players Row */}
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-5 h-5 flex items-center justify-center text-emerald-400">👥</span>
                      <span className="text-slate-400 font-medium">Players</span>
                      <span className="ml-auto text-slate-200 font-semibold">{event.minNumberOfPlayers} - {event.maxNumberOfPlayers}</span>
                    </div>
                    
                    {/* Owner Row (if exists) */}
                    {event.ownerUserId && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="w-5 h-5 flex items-center justify-center text-amber-400">👤</span>
                        <span className="text-slate-400 font-medium">Host</span>
                        <span className="ml-auto text-slate-200 font-semibold truncate max-w-[150px]">{event.ownerUserId}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Card Footer */}
                  <div className="px-5 pb-5 flex justify-end">
                    <button
                      className="bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 flex items-center gap-2"
                      onClick={async () => {
                        const ok = await deleteGameEvent(event.id ?? '', event.ownerUserId ?? undefined);
                        if (ok) setGameEvents(gameEvents.filter((_, i) => i !== idx));
                        else alert('Failed to delete event');
                      }}
                    >
                      <span>🗑️</span> Delete
                    </button>
                  </div>
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
