"use client";
import type { Item } from "../../lib/types";
import type { components } from "../../openapi/types";
import { toast, Toaster } from "react-hot-toast";
import { Plus, UserPlus, LogIn } from 'lucide-react';
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface GameEventsProps {
  gameEvents: components["schemas"]["CreateGameEventDto"][];
  games: Item[];
  setGameEvents: React.Dispatch<React.SetStateAction<components["schemas"]["CreateGameEventDto"][]>>;
  deleteGameEvent: (eventId: number | string, ownerUserId?: string) => Promise<boolean>;
  showCreateButton?: boolean;
  showList?: boolean;
}

type GameEvent = Omit<components["schemas"]["CreateGameEventDto"], "id"> & {
  id?: string;
  participants?: string[];
};

// Helper functions to prevent Javascript Timezone shifting bugs
const getLocalYMD = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLocalHM = (d: Date = new Date()) => {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function GameEvents({
  gameEvents,
  games,
  setGameEvents,
  deleteGameEvent,
  showCreateButton = true,
  showList = true,
}: GameEventsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GameEvent | null>(null);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<GameEvent | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [participantName, setParticipantName] = useState("");
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

  // Check login status and listen for auth changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      setIsLoggedIn(!!token);
      setCurrentUser(username);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("authChange", checkAuth);
    window.addEventListener("focus", checkAuth);
    
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", checkAuth);
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  // Overlap protection logic
  const hasOverlap = useCallback((targetGameId: number, startStr: string, endStr: string, eventIdToIgnore?: string) => {
    const newStart = new Date(startStr).getTime();
    const newEnd = new Date(endStr).getTime();

    return gameEvents.some(event => {
      if (eventIdToIgnore && String(event.id) === String(eventIdToIgnore)) return false;
      if (event.gameId !== targetGameId) return false;
      if (!event.startTime || !event.endTime) return false;

      const existingStart = new Date(event.startTime).getTime();
      const existingEnd = new Date(event.endTime).getTime();

      return newStart < existingEnd && newEnd > existingStart;
    });
  }, [gameEvents]);

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
        let startDate = new Date(updatedForm.startDate || getLocalYMD());
        startDate.setHours(parseInt(h, 10));
        startDate.setMinutes(parseInt(m, 10));
        startDate.setSeconds(0);

        let endDate = new Date(startDate.getTime() + duration * 60000);
        updatedForm.endDate = updatedForm.startDate || getLocalYMD();
        updatedForm.endTime = getLocalHM(endDate);
      }
    }

    if ((name === "game" || name === "endTime") && updatedForm.game && updatedForm.endTime) {
      const item = games.find(g => g.name === updatedForm.game);
      if (item) {
        const duration = typeof item.length === "number" ? item.length : 60;
        const [h, m] = updatedForm.endTime.split(":");
        let endDate = new Date(updatedForm.endDate || getLocalYMD());
        endDate.setHours(parseInt(h, 10));
        endDate.setMinutes(parseInt(m, 10));
        endDate.setSeconds(0);

        let startDate = new Date(endDate.getTime() - duration * 60000);
        updatedForm.startDate = updatedForm.endDate || getLocalYMD();
        updatedForm.startTime = getLocalHM(startDate);
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
    
    if (!isLoggedIn || !currentUser) {
      toast.error("Please log in to create events");
      return;
    }

    const game = games.find(g => g.name === form.game);
    if (!game) {
      toast.error("Game not found");
      return;
    }

    const startDateTime = `${form.startDate}T${form.startTime}`;
    const endDateTime = `${form.endDate || form.startDate}T${form.endTime}`;

    if (hasOverlap(game.id, startDateTime, endDateTime)) {
      toast.error(`"${game.name}" is already scheduled during this time.`);
      return;
    }

    setIsProcessing(true);

    const payload = {
      gameId: game.id,
      startTime: `${startDateTime}:00`,
      endTime: `${endDateTime}:00`,
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
      
      // Add the creator as the first participant
      const eventWithCreator = {
        ...newEvent,
        participants: [currentUser]
      };
      
      // Also add the creator as a participant via the API
      if (newEvent.id) {
        try {
          await fetch("https://piasta-net-app.azurewebsites.net/api/GameEvents/add-participant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gameEventID: newEvent.id,
              participantUserID: currentUser,
              requestingUserID: currentUser
            }),
          });
        } catch (joinErr) {
          console.error("[GameEvents] Failed to auto-join event:", joinErr);
        }
      }
      
      setGameEvents(prev => [eventWithCreator, ...prev]);
      setOpen(false);
      setForm({ game: "", startDate: "", startTime: "", endDate: "", endTime: "", minPlayers: "", maxPlayers: "" });
      toast.success("Game event created successfully!");
    } catch (err) {
      toast.error("Error creating game event");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.id) return;
    
    if (!isLoggedIn || !currentUser) {
      toast.error("Please log in to edit events");
      return;
    }

    // Only allow editing own events
    if (editingEvent.ownerUserId !== currentUser) {
      toast.error("You can only edit your own events");
      return;
    }

    const game = games.find(g => g.name === editForm.game);
    const targetGameId = game?.id || editingEvent.gameId;
    if (targetGameId === undefined) return;

    const startDateTime = `${editForm.startDate}T${editForm.startTime}`;
    const endDateTime = `${editForm.endDate || editForm.startDate}T${editForm.endTime}`;

    if (hasOverlap(targetGameId, startDateTime, endDateTime, editingEvent.id)) {
      toast.error(`This game is already scheduled during this time.`);
      return;
    }

    setIsProcessing(true);

    const payload = {
      gameEventId: editingEvent.id,
      gameId: targetGameId,
      startTime: `${startDateTime}:00`,
      endTime: `${endDateTime}:00`,
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
        } catch (e) { }
      }

      setGameEvents(prev => prev.map((ev, i) =>
        (ev as GameEvent).id === editingEvent.id ? updatedEvent as components["schemas"]["CreateGameEventDto"] : ev
      ));
      setEditOpen(false);
      setEditingEvent(null);
      toast.success("Event updated!");
    } catch (err) {
      toast.error("Error updating game event");
    } finally {
      setIsProcessing(false);
    }
  };

  const openEditDialog = (event: GameEvent) => {
    // Only allow opening edit dialog for own events
    if (!isLoggedIn || !currentUser || event.ownerUserId !== currentUser) {
      toast.error("You can only edit your own events");
      return;
    }
    
    setEditingEvent(event);
    const game = games.find(g => g.id === event.gameId);

    setEditForm({
      game: game?.name || "",
      startDate: event.startTime ? event.startTime.substring(0, 10) : "",
      startTime: event.startTime ? event.startTime.substring(11, 16) : "",
      endDate: event.endTime ? event.endTime.substring(0, 10) : "",
      endTime: event.endTime ? event.endTime.substring(11, 16) : "",
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

  useEffect(() => {
    if (!open && !editOpen && !participantsOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCancel();
        handleEditCancel();
        setParticipantsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, editOpen, participantsOpen]);

  const addParticipant = async (eventId: string, userId: string) => {
    if (!isLoggedIn || !currentUser) {
      toast.error("Please log in to join events");
      return;
    }
    
    setIsProcessing(true);
    try {
      const payload = {
        gameEventID: eventId,
        participantUserID: userId,
        requestingUserID: currentUser
      };

      const response = await fetch("https://piasta-net-app.azurewebsites.net/api/GameEvents/add-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
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
      toast.error(`Error joining event: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeParticipant = async (eventId: string, userId: string) => {
    if (!isLoggedIn || !currentUser) {
      toast.error("Please log in to leave events");
      return;
    }
    
    setIsProcessing(true);
    try {
      const payload = {
        gameEventID: eventId,
        participantUserID: userId,
        requestingUserID: currentUser
      };

      const response = await fetch("https://piasta-net-app.azurewebsites.net/api/GameEvents/remove-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
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
      toast.error(`Error leaving event: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const openParticipantsDialog = (event: GameEvent) => {
    setViewingEvent(event);
    setParticipantsOpen(true);
  };

  const isEventOwner = (event: GameEvent) => isLoggedIn && currentUser !== null && event.ownerUserId === currentUser;
  const isParticipant = (event: GameEvent) => isLoggedIn && currentUser !== null && event.participants?.includes(currentUser);
  const availableSlots = (event: GameEvent) => {
    const max = event.maxNumberOfPlayers || 0;
    const current = event.participants?.length || 0;
    return max - current;
  };

  const handleDeleteEvent = async (event: GameEvent) => {
    if (!isLoggedIn || !currentUser) {
      toast.error("Please log in to delete events");
      return;
    }

    // Only allow deleting own events
    if (event.ownerUserId !== currentUser) {
      toast.error("You can only delete your own events");
      return;
    }

    setIsProcessing(true);
    const ok = await deleteGameEvent(event.id ?? '', event.ownerUserId ?? undefined);
    if (ok) {
      setGameEvents(prev => prev.filter(ev => ev.id !== event.id));
      toast.success('Event deleted successfully');
    } else {
      toast.error('Failed to delete event');
    }
    setIsProcessing(false);
  };

  const getTitleSizeClass = (title: string) => {
    if (title.length > 58) return "text-xs";
    if (title.length > 40) return "text-sm";
    if (title.length > 28) return "text-base";
    return "text-lg";
  };

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />

      {showCreateButton && (
        isLoggedIn ? (
          <button type="button" className="btn-cta game-events-create-btn" onClick={() => setOpen(true)} style={{ marginBottom: '1rem' }}>
            <Plus className="h-5 w-5 game-events-create-icon" />
            <span>Create Game Event</span>
          </button>
        ) : (
          <button type="button" className="btn-cta game-events-create-btn" onClick={() => router.push("/login")} style={{ marginBottom: '1rem' }}>
            <LogIn className="h-5 w-5 game-events-create-icon" />
            <span>Login to Create Event</span>
          </button>
        )
      )}

      {/* Create Dialog */}
      {open && (
        <div className="game-event-dialog-overlay" onClick={(event) => {
          if (event.target === event.currentTarget) handleCancel();
        }}>
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
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required min={getLocalYMD()} />
              </label>
              <label>
                End Date:
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange} min={form.startDate || getLocalYMD()} required />
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
        <div className="game-event-dialog-overlay" onClick={(event) => {
          if (event.target === event.currentTarget) handleEditCancel();
        }}>
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
        <div className="game-event-dialog-overlay" onClick={(event) => {
          if (event.target === event.currentTarget) setParticipantsOpen(false);
        }}>
          <div className="game-event-dialog">
            <h2>Event Participants</h2>
            <div className="mb-4">
              <p className="text-slate-300 mb-2">
                Slots: {viewingEvent.participants?.length || 0} / {viewingEvent.maxNumberOfPlayers}
                ({availableSlots(viewingEvent)} available)
              </p>

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

              <div className="flex gap-3">
                {!isParticipant(viewingEvent) && availableSlots(viewingEvent) > 0 && isLoggedIn && (
                  <button
                    className={`flex-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg px-4 py-2 font-semibold transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-500/30'}`}
                    disabled={isProcessing}
                    onClick={() => viewingEvent.id && currentUser && addParticipant(viewingEvent.id, currentUser)}
                  >
                    {isProcessing ? '⏳ Processing...' : '✋ Join Event'}
                  </button>
                )}
                {!isLoggedIn && availableSlots(viewingEvent) > 0 && (
                  <button
                    className={`flex-1 bg-slate-500/20 text-slate-400 border border-slate-500/40 rounded-lg px-4 py-2 font-semibold transition-colors hover:bg-slate-500/30`}
                    onClick={() => router.push("/login")}
                  >
                    Login to Join
                  </button>
                )}
                {isParticipant(viewingEvent) && !isEventOwner(viewingEvent) && (
                  <button
                    className={`flex-1 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-lg px-4 py-2 font-semibold transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-500/30'}`}
                    disabled={isProcessing}
                    onClick={() => viewingEvent.id && currentUser && removeParticipant(viewingEvent.id, currentUser)}
                  >
                    {isProcessing ? '⏳ Processing...' : '🚪 Leave Event'}
                  </button>
                )}
              </div>

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

      {/* Restored showList wrapper */}
      {showList && (
        <div className="game-events-panel">
          {gameEvents.length > 0 ? (
            <div className="game-events-grid">
              {gameEvents.map((event, idx) => {
                const game = games.find(g => g.id === event.gameId);
                const gameName = game ? game.name : `Game #${event.gameId}`;
                const eventData = event as GameEvent;
                const isOwner = isEventOwner(eventData);
                const hasSlots = availableSlots(eventData) > 0;

                return (
                  <div key={idx} className="w-full rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-[0_8px_20px_-6px_rgba(34,211,238,0.2)]">

                    {/* Card Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border-b border-cyan-500/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white tracking-tight">{gameName}</h3>

                          {hasSlots && (
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded text-xs font-medium">
                              <UserPlus size={14} className="animate-heartbeat text-amber-400" />
                              Looking for Players
                            </div>
                          )}

                        </div>
                        {isOwner && (
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full shrink-0">Host</span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3 flex-1">
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

                      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-3"></div>

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

                      {event.ownerUserId && (
                        <div className="flex items-center gap-3 text-sm">
                          <span className="w-5 h-5 flex items-center justify-center text-amber-400">👤</span>
                          <span className="text-slate-400 font-medium">Host</span>
                          <span className="ml-auto text-slate-200 font-semibold truncate max-w-[150px]">{event.ownerUserId}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="px-5 pb-5 mt-auto flex flex-wrap gap-2">
                      <button
                        className={`flex-1 bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-1 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-500/25 hover:text-cyan-300 hover:border-cyan-500/50'}`}
                        disabled={isProcessing}
                        onClick={() => openParticipantsDialog(eventData)}
                      >
                        <span>👥</span> {isParticipant(eventData) ? 'Manage' : 'Join'}
                      </button>

                      {isParticipant(eventData) && !isOwner && (
                        <button
                          className={`bg-orange-500/15 text-orange-400 border border-orange-500/30 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 flex items-center gap-1 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-500/25 hover:text-orange-300 hover:border-orange-500/50'}`}
                          disabled={isProcessing}
                          onClick={async () => {
                            if (!eventData.id || !currentUser) return;
                            await removeParticipant(eventData.id, currentUser);
                          }}
                        >
                          <span>🚪</span> Leave
                        </button>
                      )}

                      {isOwner && (
                        <button
                          className={`bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 flex items-center gap-1 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500/25 hover:text-blue-300 hover:border-blue-500/50'}`}
                          disabled={isProcessing}
                          onClick={() => openEditDialog(eventData)}
                        >
                          <span>✏️</span> Edit
                        </button>
                      )}

                      {isOwner && (
                        <button
                          className={`bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 flex items-center gap-1 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500/25 hover:text-red-300 hover:border-red-500/50'}`}
                          disabled={isProcessing}
                          onClick={() => handleDeleteEvent(eventData)}
                        >
                          <span>🗑️</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>No events found</div>
          )}
        </div>
      )}
    </>
  );
}
