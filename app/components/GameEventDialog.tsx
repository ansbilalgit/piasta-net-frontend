"use client";
import React, { useState, useEffect } from "react";
import { fetchItems } from "../../lib/itemsService";

export default function GameEventDialog() {
  const [open, setOpen] = useState(false);
  const [games, setGames] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({
    game: "",
    startDate: "",
    startTime: "",
    endTime: "",
    minPlayers: 2,
    maxPlayers: 8,
  });

  useEffect(() => {
    async function loadGames() {
      try {
        const items = await fetchItems();
        setGames(items.map(({ id, name }) => ({ id, name })));
      } catch (err) {
        setGames([]);
      }
    }
    if (open && games.length === 0) loadGames();
  }, [open, games.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleClose();
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
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
              </label>
              <label>
                Start Time:
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
              </label>
              <label>
                End Time:
                <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
              </label>
              <label>
                Min Players:
                <input type="number" name="minPlayers" min={2} max={form.maxPlayers} value={form.minPlayers} onChange={handleChange} required />
              </label>
              <label>
                Max Players:
                <input type="number" name="maxPlayers" min={form.minPlayers} max={20} value={form.maxPlayers} onChange={handleChange} required />
              </label>
              <div className="dialog-actions">
                <button type="submit" className="btn-cta">Submit</button>
                <button type="button" onClick={handleClose}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}