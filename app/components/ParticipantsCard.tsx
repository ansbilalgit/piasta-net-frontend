
"use client"
import { useState } from 'react';
import { Users, Plus, Check } from 'lucide-react';

export function ParticipantCounter() {
    const [count, setCount] = useState(0);
    const [hasJoined, setHasJoined] = useState(false);

    const handleToggle = () => {
        if (hasJoined) {
            setCount((prev) => Math.max(0, prev - 1));
            setHasJoined(false);
        } else {
            setCount((prev) => prev + 1);
            setHasJoined(true);
        }
    };

    return (
        <div
            className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-blue-400/40 shadow-xl backdrop-blur-xl"
            style={{
                background: 'linear-gradient(135deg, hsla(199 89% 48% / 0.1) 0%, hsla(32 95% 55% / 0.1) 100%)'
            }}
        >
            <div className="absolute inset-0 pointer-events-none" />
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-blue-200 mb-4">
                    <Users className="h-5 w-5" />
                    <span className="text-sm font-medium">Participants</span>
                </div>

                <div className="flex items-end gap-4 mb-6">
                    <span className="text-6xl md:text-7xl font-display font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-counter-pulse">
                        {count}
                    </span>
                    <span className="text-blue-200 pb-3">attending this week</span>
                </div>

                <button
                    onClick={handleToggle}
                    className={`w-full md:w-auto px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${hasJoined ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'}`}
                >
                    {hasJoined ? (
                        <>
                            <Check className="h-5 w-5" />
                            Leave
                        </>
                    ) : (
                        <>
                            <Plus className="h-5 w-5" />
                            Join This Week
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
