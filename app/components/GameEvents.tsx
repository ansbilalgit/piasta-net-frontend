"use client";
import type { Item } from "../../lib/types";
import type { components } from "../../openapi/types";
import { toast, Toaster } from "react-hot-toast"; // Added Toast import
import { useState } from "react";

interface GameEventsProps {
  gameEvents: components["schemas"]["CreateGameEventDto"][];
  games: Item[];
  setGameEvents: React.Dispatch<React.SetStateAction<components["schemas"]["CreateGameEventDto"][]>>;
  deleteGameEvent: (eventId: number | string, ownerUserId?: string) => Promise<boolean>;
}

// Define a more complete type for game events that includes participants
// Extends from the DTO but overrides id to string (API returns GUID)
type GameEvent = Omit<components["schemas"]["CreateGameEventDto"], "id"> & {
  id?: string;
  participants?: string[];
};

export default function GameEvents({ gameEvents, games, setGameEvents, deleteGameEvent }: GameEventsProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GameEvent | null>(null);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<GameEvent | null>(null);
  const [currentUser] = useState("John Doe"); // Replace with actual auth user
  const [participantName, setParticipantName] = useState("");

  // Added processing state to prevent double-clicks
  const [isProcessing, setIsProcessing] = useState(false);

  const [form, setForm] = useState({
    game: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    minPlayers: "",
    maxPlayers: "",
  });

  const [editForm, setEditForm] = useState({
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
    if (!updatedForm.endDate && updatedForm.startDate) {
      updatedForm.endDate = updatedForm.startDate;
    }
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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const game = games.find(g => g.name === form.game);
    if (!game) {
      toast.error("Game not found");
      return;
    }

    setIsProcessing(true); // Start loading
    const startDateTime = `${form.startDate}T${form.startTime}`;
    const endDateTime = `${form.endDate || form.startDate}T${form.endTime}`;
    const payload = {
      gameId: game.id,
      startTime: new Date(startDateTime).toISOString(),
      endTime: new Date(endDateTime).toISOString(),
      minNumberOfPlayers: Number(form.minPlayers),
      maxNumberOfPlayers: Number(form.maxPlayers),
      ownerUserId: currentUser,
    };

    try {
      const response = await fetch("https://piasta-net-app.azurewebsites.net/api/GameEvents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create game event");
      const newEvent = await response.json();
      setGameEvents(prev => [newEvent, ...prev]);
      setOpen(false);
      setForm({ game: "", startDate: "", startTime: "", endDate: "", endTime: "", minPlayers: "", maxPlayers: "" });
      toast.success("Game event created successfully!"); // Success toast
    } catch (err) {
      toast.error("Error creating game event"); // Error toast
    } finally {
      setIsProcessing(false); // Stop loading
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.id) return;

    setIsProcessing(true); // Start loading
    const game = games.find(g => g.name === editForm.game);
    const startDateTime = `${editForm.startDate}T${editForm.startTime}`;
    const endDateTime = `${editForm.endDate || editForm.startDate}T${editForm.endTime}`;

    const payload = {
      gameEventId: editingEvent.id,
      gameId: game?.id || editingEvent.gameId,
      startTime: new Date(startDateTime).toISOString(),
      endTime: new Date(endDateTime).toISOString(),
      minNumberOfPlayers: Number(editForm.minPlayers),
      maxNumberOfPlayers: Number(editForm.maxPlayers),
      ownerUserId: editingEvent.ownerUserId,
    };

    try {
      const response = await fetch("https://piasta-net-app.azurewebsites.net/api/GameEvents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update game event");

      let updatedEvent = { ...editingEvent, ...payload };
      const text = await response.text();
      if (text) {
        try {
          updatedEvent = JSON.parse(text);
        } catch (e) {
          // Ignore JSON parse error if it's not JSON
        }
      }

      setGameEvents(prev => prev.map((ev, i) =>
        (ev as GameEvent).id === editingEvent.id ? updatedEvent as components["schemas"]["CreateGameEventDto"] : ev
      ));
      setEditOpen(false);
      setEditingEvent(null);
      toast.success("Event updated!"); // Success toast
    } catch (err) {
      toast.error("Error updating game event"); // Error toast
    } finally {
      setIsProcessing(false); // Stop loading
    }
  };

  const openEditDialog = (event: GameEvent) => {
    setEditingEvent(event);
    const game = games.find(g => g.id === event.gameId);

    const startDate = event.startTime ? new Date(event.startTime) : null;
    const endDate = event.endTime ? new Date(event.endTime) : null;

    setEditForm({
      game: game?.name || "",
      startDate: startDate ? startDate.toISOString().split("T")[0] : "",
      startTime: startDate ? startDate.toTimeString().slice(0, 5) : "",
      endDate: endDate ? endDate.toISOString().split("T")[0] : "",
      endTime: endDate ? endDate.toTimeString().slice(0, 5) : "",
      minPlayers: String(event.minNumberOfPlayers || ""),
      maxPlayers: String(event.maxNumberOfPlayers || ""),
    });
    setEditOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    setForm({ game: "", startDate: "", startTime: "", endDate: "", endTime: "", minPlayers: "", maxPlayers: "" });
  };

  const handleEditCancel = () => {
    setEditOpen(false);
    setEditingEvent(null);
  };

  // Add participant
  const addParticipant = async (eventId: string, userId: string) => {
    setIsProcessing(true); // Start loading
    try {
      const payload = {
        gameEventID: eventId,
        participantUserID: userId,
        requestingUserID: currentUser
      };
      console.log("[addParticipant] Sending payload:", payload);

      const response = await fetch("https://piasta-net-app.azurewebsites.net/api/GameEvents/add-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[addParticipant] Error response:", response.status, errorText);
        throw new Error(`Failed to join event: ${response.status} ${errorText}`);
      }

      toast.success(userId === currentUser ? "Successfully joined the event!" : `Added ${userId} to event!`);
      setParticipantsOpen(false);

      setGameEvents(prev => prev.map(event => {
        if ((event as GameEvent).id === eventId) {
          const ev = event as GameEvent;
          return {
            ...ev,
            participants: [...(ev.participants || []), userId]
          } as components["schemas"]["CreateGameEventDto"];
        }
        return event;
      }));

    } catch (err) {
      console.error("[addParticipant] Error:", err);
      toast.error(`Error joining event: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false); // Stop loading
    }
  };

  // Remove participant
  const removeParticipant = async (eventId: string, userId: string) => {
    setIsProcessing(true); // Start loading
    try {
      const payload = {
        gameEventID: eventId,
        participantUserID: userId,
        requestingUserID: currentUser
      };
      console.log("[removeParticipant] Sending payload:", payload);

      const response = await fetch("https://piasta-net-app.azurewebsites.net/api/GameEvents/remove-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[removeParticipant] Error response:", response.status, errorText);
        throw new Error(`Failed to leave event: ${response.status} ${errorText}`);
      }

      toast.success("Successfully left the event!");
      setParticipantsOpen(false);

      setGameEvents(prev => prev.map(event => {
        if ((event as GameEvent).id === eventId) {
          const ev = event as GameEvent;
          return {
            ...ev,
            participants: (ev.participants || []).filter(p => p !== userId)
          } as components["schemas"]["CreateGameEventDto"];
        }
        return event;
      }));

    } catch (err) {
      console.error("[removeParticipant] Error:", err);
      toast.error(`Error leaving event: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false); // Stop loading
    }
  };

  const openParticipantsDialog = (event: GameEvent) => {
    setViewingEvent(event);
    setParticipantsOpen(true);
  };

  const isEventOwner = (event: GameEvent) => event.ownerUserId === currentUser;
  const isParticipant = (event: GameEvent) => event.participants?.includes(currentUser);
  const availableSlots = (event: GameEvent) => {
    const max = event.maxNumberOfPlayers || 0;
    const current = event.participants?.length || 0;
    return max - current;
  };

  return (
    <>
      {/* Toaster Component renders the popups */}
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />

      <button className="btn-cta" style={{ marginBottom: '1rem' }} onClick={() => setOpen(true)}>Create Game Event</button>

      {/* Create Dialog */}
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
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required min={new Date().toISOString().split("T")[0]} />
              </label>
              <label>
                End Date:
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange} min={form.startDate || new Date().toISOString().split("T")[0]} required />
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
                <input type="number" name="minPlayers" min={1} max={20} value={form.minPlayers} onChange={handleChange} required />
              </label>
              <label>
                Max Players:
                <input type="number" name="maxPlayers" min={form.minPlayers || 1} max={20} value={form.maxPlayers} onChange={handleChange} required />
              </label>
              <div className="dialog-actions">
                {/* Disabled while loading */}
                <button type="submit" className={`btn-cta ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isProcessing}>
                  {isProcessing ? 'Submitting...' : 'Submit'}
                </button>
                <button type="button" onClick={handleCancel} disabled={isProcessing}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editOpen && editingEvent && (
        <div className="game-event-dialog-overlay">
          <div className="game-event-dialog">
            <h2>Edit Game Event</h2>
            <form onSubmit={handleUpdate}>
              <label>
                Game:
                <select name="game" value={editForm.game} onChange={handleEditChange} required>
                  <option value="">Select a game</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Start Date:
                <input type="date" name="startDate" value={editForm.startDate} onChange={handleEditChange} required />
              </label>
              <label>
                End Date:
                <input type="date" name="endDate" value={editForm.endDate} onChange={handleEditChange} required />
              </label>
              <label>
                Start Time:
                <input type="time" name="startTime" value={editForm.startTime} onChange={handleEditChange} required />
              </label>
              <label>
                End Time:
                <input type="time" name="endTime" value={editForm.endTime} onChange={handleEditChange} required />
              </label>
              <label>
                Min Players:
                <input type="number" name="minPlayers" min={1} max={20} value={editForm.minPlayers} onChange={handleEditChange} required />
              </label>
              <label>
                Max Players:
                <input type="number" name="maxPlayers" min={editForm.minPlayers || 1} max={20} value={editForm.maxPlayers} onChange={handleEditChange} required />
              </label>
              <div className="dialog-actions">
                {/* Disabled while loading */}
                <button type="submit" className={`btn-cta ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isProcessing}>
                  {isProcessing ? 'Updating...' : 'Update'}
                </button>
                <button type="button" onClick={handleEditCancel} disabled={isProcessing}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Dialog */}
      {participantsOpen && viewingEvent && (
        <div className="game-event-dialog-overlay">
          <div className="game-event-dialog">
            <h2>Event Participants</h2>
            <div className="mb-4">
              <p className="text-slate-300 mb-2">
                Slots: {viewingEvent.participants?.length || 0} / {viewingEvent.maxNumberOfPlayers}
                ({availableSlots(viewingEvent)} available)
              </p>

              {/* Participant List */}
              <div className="bg-slate-800 rounded-lg p-3 mb-4 max-h-48 overflow-y-auto">
                {viewingEvent.participants && viewingEvent.participants.length > 0 ? (
                  viewingEvent.participants.map((participant, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                      <span className="text-slate-200">{participant}</span>
                      {participant === viewingEvent.ownerUserId && (
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Host</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">No participants yet</p>
                )}
              </div>

              {/* Join/Leave Actions */}
              <div className="flex gap-3">
                {!isParticipant(viewingEvent) && availableSlots(viewingEvent) > 0 && (
                  <button
                    className={`flex-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg px-4 py-2 font-semibold transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-500/30'}`}
                    disabled={isProcessing}
                    onClick={() => viewingEvent.id && addParticipant(viewingEvent.id, currentUser)}
                  >
                    {isProcessing ? '⏳ Processing...' : '✋ Join Event'}
                  </button>
                )}
                {isParticipant(viewingEvent) && !isEventOwner(viewingEvent) && (
                  <button
                    className={`flex-1 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-lg px-4 py-2 font-semibold transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-500/30'}`}
                    disabled={isProcessing}
                    onClick={() => viewingEvent.id && removeParticipant(viewingEvent.id, currentUser)}
                  >
                    {isProcessing ? '⏳ Processing...' : '🚪 Leave Event'}
                  </button>
                )}
              </div>

              {/* Add Other Participant (for host) */}
              {isEventOwner(viewingEvent) && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Add participant by name:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      placeholder="Enter user name"
                      disabled={isProcessing}
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white disabled:opacity-50"
                    />
                    <button
                      className={`bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-lg px-4 py-2 font-semibold transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-500/30'}`}
                      disabled={isProcessing}
                      onClick={() => {
                        if (participantName.trim() && viewingEvent.id) {
                          addParticipant(viewingEvent.id, participantName.trim());
                          setParticipantName("");
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="dialog-actions">
              <button type="button" className="btn-cta" disabled={isProcessing} onClick={() => setParticipantsOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="next-card next-card-wide">
        <h4>Existing Game Events</h4>
        {gameEvents.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {gameEvents.map((event, idx) => {
              const game = games.find(g => g.id === event.gameId);
              const gameName = game ? game.name : `Game #${event.gameId}`;
              const eventData = event as GameEvent;
              const isOwner = isEventOwner(eventData);
              const hasSlots = availableSlots(eventData) > 0;

              return (
                <div key={idx} className="flex-[1_1_300px] min-w-[280px] max-w-[360px] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 overflow-hidden">
                  {/* Card Header */}
                  <div className="px-5 py-4 bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border-b border-cyan-500/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white tracking-tight">{gameName}</h3>
                      {isOwner && (
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">Host</span>
                      )}
                    </div>
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
                      <span className="ml-auto">
                        <span className={`font-semibold ${hasSlots ? 'text-emerald-400' : 'text-red-400'}`}>
                          {eventData.participants?.length || 0}
                        </span>
                        <span className="text-slate-400"> / {event.maxNumberOfPlayers}</span>
                        {hasSlots ? (
                          <span className="text-emerald-400 text-xs ml-1">({availableSlots(eventData)} open)</span>
                        ) : (
                          <span className="text-red-400 text-xs ml-1">(full)</span>
                        )}
                      </span>
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
                  <div className="px-5 pb-5 flex flex-wrap gap-2">
                    {/* View/Join Button */}
                    <button
                      className={`flex-1 bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-1 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-500/25 hover:text-cyan-300 hover:border-cyan-500/50'}`}
                      disabled={isProcessing}
                      onClick={() => openParticipantsDialog(eventData)}
                    >
                      <span>👥</span> {isParticipant(eventData) ? 'Manage' : 'Join'}
                    </button>

                    {/* Leave Button - visible if participant but not owner */}
                    {isParticipant(eventData) && !isOwner && (
                      <button
                        className={`bg-orange-500/15 text-orange-400 border border-orange-500/30 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 flex items-center gap-1 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-500/25 hover:text-orange-300 hover:border-orange-500/50'}`}
                        disabled={isProcessing}
                        onClick={async () => {
                          if (!eventData.id) return;
                          if (confirm('Are you sure you want to leave this event?')) {
                            await removeParticipant(eventData.id, currentUser);
                          }
                        }}
                      >
                        <span>🚪</span> Leave
                      </button>
                    )}

                    {/* Edit Button (owner only) */}
                    {isOwner && (
                      <button
                        className={`bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 flex items-center gap-1 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500/25 hover:text-blue-300 hover:border-blue-500/50'}`}
                        disabled={isProcessing}
                        onClick={() => openEditDialog(eventData)}
                      >
                        <span>✏️</span> Edit
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      className={`bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 flex items-center gap-1 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500/25 hover:text-red-300 hover:border-red-500/50'}`}
                      disabled={isProcessing}
                      onClick={async () => {
                        setIsProcessing(true);
                        const ok = await deleteGameEvent(event.id ?? '', event.ownerUserId ?? undefined);
                        if (ok) {
                          setGameEvents(prev => prev.filter(ev => ev.id !== event.id));
                          toast.success('Event deleted successfully');
                        } else {
                          toast.error('Failed to delete event');
                        }
                        setIsProcessing(false);
                      }}
                    >
                      <span>🗑️</span>
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
