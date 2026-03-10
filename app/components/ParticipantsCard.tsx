"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Check, Loader2, LogIn } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  fetchWeeklyParticipants,
  joinWeeklyEvent,
  leaveWeeklyEvent,
  hasUserJoined,
  WeeklyParticipant,
  getNextResetTime,
} from "../../lib/participantsService";

export function ParticipantCounter() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [participants, setParticipants] = useState<WeeklyParticipant[]>([]);
  const [resetTime, setResetTime] = useState<Date | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status and get current user
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      setIsLoggedIn(!!token);
      setCurrentUser(username);
      
      // Reset joined status if not logged in
      if (!token) {
        setHasJoined(false);
      }
    };

    checkAuth();
    
    // Listen for storage events (other tabs)
    window.addEventListener("storage", checkAuth);
    
    // Listen for custom auth change events (same tab)
    window.addEventListener("authChange", checkAuth);
    
    // Check auth when window regains focus
    window.addEventListener("focus", checkAuth);
    
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", checkAuth);
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  // Load participants on mount and check for weekly reset
  const loadParticipants = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchWeeklyParticipants();
      setEventId(data.eventId);
      setCount(data.totalCount);
      setParticipants(data.participants);
      
      // Check if current user has joined (only if logged in)
      const user = localStorage.getItem("username");
      if (user) {
        setHasJoined(hasUserJoined(data.participants, user));
      }

      setResetTime(getNextResetTime());
    } catch (err) {
      console.error("[ParticipantCounter] Error loading participants:", err);
      toast.error("Failed to load participants");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParticipants();

    // Check for reset every minute
    const interval = setInterval(() => {
      loadParticipants();
    }, 60000);

    return () => clearInterval(interval);
  }, [loadParticipants]);

  // Calculate time until reset
  const getTimeUntilReset = (): string => {
    if (!resetTime) return "";
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();

    if (diff <= 0) return "Resetting...";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m until reset`;
    if (hours > 0) return `${hours}h ${minutes}m until reset`;
    return `${minutes}m until reset`;
  };

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleToggle = async () => {
    if (isProcessing) return;

    if (!isLoggedIn || !currentUser) {
      toast.error("Please log in to join the event");
      return;
    }

    if (!eventId) {
      toast.error("No upcoming event found to join.");
      return;
    }

    setIsProcessing(true);
    try {
      if (hasJoined) {
        // Leave event
        await leaveWeeklyEvent(eventId, currentUser);

        // Optimistic UI Update
        setParticipants((prev) => prev.filter((p) => p.userId !== currentUser));
        setCount((prev) => Math.max(0, prev - 1));
        setHasJoined(false);
        toast.success("You've left this week's game night");
      } else {
        // Join event
        await joinWeeklyEvent(eventId, currentUser);

        // Optimistic UI Update
        setParticipants((prev) => [
          ...prev,
          { userId: currentUser, userName: currentUser },
        ]);
        setCount((prev) => prev + 1);
        setHasJoined(true);
        toast.success("You've joined this week's game night!");
      }
    } catch (err) {
      console.error("[ParticipantCounter] Error toggling participation:", err);
      toast.error(hasJoined ? "Failed to leave event" : "Failed to join event");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-blue-400/40 shadow-xl backdrop-blur-xl"
      style={{
        background:
          "linear-gradient(135deg, hsla(199 89% 48% / 0.1) 0%, hsla(32 95% 55% / 0.1) 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none" />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 text-blue-200 mb-4">
          <Users className="h-5 w-5" />
          <span className="text-sm font-medium">Participants</span>
        </div>

        {/* Count Display */}
        <div className="flex items-end gap-4 mb-4">
          {isLoading ? (
            <Loader2
              className="h-12 w-12 animate-spin text-blue-400"
              role="status"
              aria-label="Loading"
            />
          ) : (
            <span className="text-6xl md:text-7xl font-display font-bold bg-linear-to-r from-blue-500 via-purple-400 to-purple-400 bg-clip-text text-transparent animate-counter-pulse">
              {count}
            </span>
          )}
          <span className="text-blue-200 pb-3">attending this week</span>
        </div>

        {/* Reset Timer */}
        {resetTime && (
          <div className="text-xs text-blue-200 mb-4">
            Resets every Tuesday 23:59 • {getTimeUntilReset()}
          </div>
        )}

        {/* Join/Leave/Login Button */}
        {!isLoggedIn ? (
          <button
            onClick={handleLoginClick}
            className="w-full md:w-auto px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-500 hover:to-slate-600"
          >
            <LogIn className="h-5 w-5" />
            Login to Join
          </button>
        ) : (
          <button
            onClick={handleToggle}
            disabled={isProcessing || isLoading || !eventId}
            className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${
              hasJoined
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {hasJoined ? "Leaving..." : "Joining..."}
              </>
            ) : hasJoined ? (
              <>
                <Check className="h-5 w-5" />
                Leave This Week
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Join This Week
              </>
            )}
          </button>
        )}

        {/* Participant List (collapsible) */}
        {participants.length > 0 && (
          <div className="mt-6 pt-4 border-t border-blue-400/20">
            <p className="text-sm text-blue-200 mb-2">
              {participants.length} participant
              {participants.length !== 1 ? "s" : ""}:
            </p>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {participants.map((participant, idx) => (
                <span
                  key={idx}
                  className={`text-xs px-2 py-1 rounded-full ${
                    currentUser && participant.userId === currentUser
                      ? "bg-blue-500/30 text-blue-200 border border-blue-400/40"
                      : "bg-slate-700/50 text-slate-300"
                  }`}
                >
                  {participant.userName}
                  {currentUser && participant.userId === currentUser && " (You)"}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
