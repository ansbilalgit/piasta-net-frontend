"use client";
import React, { useState, useEffect } from "react";
import { fetchItems } from "../../lib/itemsService";
import { createGameEvent } from "../../lib/gameEventsService";

import type { Item } from "../../lib/types";

export default function GameEventDialog() {
  const [open, setOpen] = useState(false);
  const [games, setGames] = useState<Item[]>([]);
  const [form, setForm] = useState({
    game: "",
    startDate: "",
    startTime: "",
    endTime: "",
    minPlayers: "",
    maxPlayers: "",
  });

  useEffect(() => {
    async function loadGames() {
      try {
        const items = await fetchItems();
        setGames(items);
      } catch (err) {
        setGames([]);
      }
    }
    if (open && games.length === 0) loadGames();
  }, [open, games.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    // Auto-set min/max players based on game
    if (name === "game" && value) {
      const item = games.find(g => g.name === value);
      if (item) {
        // Only set minPlayers if not already set
          if (!updatedForm.minPlayers) {
            if (typeof item.minPlayers === "number" && item.minPlayers > 0) {
              updatedForm.minPlayers = item.minPlayers;
            } else if (item.copies && item.copies > 0) {
              updatedForm.minPlayers = item.copies;
            } else {
              updatedForm.minPlayers = 2;
            }
        }
        // Only set maxPlayers if not already set
          if (!updatedForm.maxPlayers) {
            if (typeof item.maxPlayers === "number" && item.maxPlayers > 0) {
              updatedForm.maxPlayers = item.maxPlayers;
            } else if (item.copies && item.copies > 0) {
              updatedForm.maxPlayers = item.copies;
            } else {
              updatedForm.maxPlayers = 8;
            }
        }
      }
    }

    // If game and startTime are set, and endTime is empty, set endTime = startTime + game duration
    // Auto-set endTime if game and startTime are set, but endTime is empty
    if (
      ((name === "startTime" && updatedForm.game) || (name === "game" && updatedForm.startTime)) &&
      updatedForm.game && updatedForm.startTime && !updatedForm.endTime
    ) {
      const item = games.find(g => g.name === updatedForm.game);
      const duration = item && typeof item.length === "number" ? item.length : 60;
      const [h, m] = updatedForm.startTime.split(":");
      let startDate = new Date();
      startDate.setHours(parseInt(h, 10));
      startDate.setMinutes(parseInt(m, 10));
      startDate.setSeconds(0);
      let endDate = new Date(startDate.getTime() + duration * 60000);
      const endTime = endDate
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
        .padStart(5, "0");
      updatedForm.endTime = endTime;
    }
    setForm(updatedForm);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[GameEventDialog] Submit button clicked");
    console.log("[GameEventDialog] Current form state:", form);
    const game = games.find(g => g.name === form.game);
    if (!game) {
      console.error("[GameEventDialog] Game not found for:", form.game);
      alert("Game not found");
      return;
    }
    const startDateTime = `${form.startDate}T${form.startTime}`;
    const endDateTime = `${form.startDate}T${form.endTime}`;
    const payload = {
      gameId: game.id,
      startTime: new Date(startDateTime).toISOString(),
      endTime: new Date(endDateTime).toISOString(),
      minNumberOfPlayers: Number(form.minPlayers),
      maxNumberOfPlayers: Number(form.maxPlayers),
      ownerUserId: "John Doe",
    };
    console.log("[GameEventDialog] Payload to be sent:", payload);
    try {
      await createGameEvent(payload);
      console.log("[GameEventDialog] POST request sent successfully");
      handleClose();
    } catch (err) {
      console.error("[GameEventDialog] Failed to create game event", err);
      alert("Failed to create game event");
    }
  };

  return (
    <>
      <div className="create-game-event-container">
        <button className="btn-cta" onClick={handleOpen}>Create Game Event</button>
      </div>
      {open && (
        <div className="game-event-dialog-overlay">
          <div className="game-event-dialog">
            <h2>Create Game Event</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Game:
                <select name="game" value={form.game} onChange={handleChange} required>
                  <option value="">Select a game</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </label>
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
              <label className="dialog-label-flex">
                Start Time:
                <span className="input-x-wrapper">
                  <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
                  {form.startTime && (
                    <button
                      type="button"
                      className="input-x-reset"
                      onClick={() => handleChange({
                        target: { name: 'startTime', value: '' }
                      } as React.ChangeEvent<HTMLInputElement>)}
                      aria-label="Reset start time"
                    >
                      ×
                    </button>
                  )}
                </span>
              </label>
              <label className="dialog-label-flex">
                End Time:
                <span className="input-x-wrapper">
                  <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
                  {form.endTime && (
                    <button
                      type="button"
                      className="input-x-reset"
                      onClick={() => handleChange({
                        target: { name: 'endTime', value: '' }
                      } as React.ChangeEvent<HTMLInputElement>)}
                      aria-label="Reset end time"
                    >
                      ×
                    </button>
                  )}
                </span>
              </label>
              <label className="dialog-label-flex">
                Min Players:
                <span className="input-x-wrapper">
                  <input type="number" name="minPlayers" min={1} max={form.maxPlayers} value={form.minPlayers} onChange={handleChange} required />
                  {form.minPlayers && (
                    <button
                      type="button"
                      className="input-x-reset"
                      onClick={() => handleChange({
                        target: { name: 'minPlayers', value: '' }
                      } as React.ChangeEvent<HTMLInputElement>)}
                      aria-label="Reset min players"
                    >
                      ×
                    </button>
                  )}
                </span>
              </label>
              <label className="dialog-label-flex">
                Max Players:
                <span className="input-x-wrapper">
                  <input type="number" name="maxPlayers" min={form.minPlayers || 1} max={20} value={form.maxPlayers} onChange={handleChange} required />
                  {form.maxPlayers && (
                    <button
                      type="button"
                      className="input-x-reset"
                      onClick={() => handleChange({
                        target: { name: 'maxPlayers', value: '' }
                      } as React.ChangeEvent<HTMLInputElement>)}
                      aria-label="Reset max players"
                    >
                      ×
                    </button>
                  )}
                </span>
              </label>
              <div className="dialog-actions">
                <button type="submit" className="btn-cta">Submit</button>
                <button type="button" onClick={handleClose}>Cancel</button>
                <button
                  type="button"
                  className="dialog-reset-btn"
                  onClick={() => setForm({ game: '', startDate: '', startTime: '', endTime: '', minPlayers: '', maxPlayers: '' })}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}