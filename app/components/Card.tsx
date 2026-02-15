// app/components/Card.tsx
"use client";

import { useState } from "react";
import { Users, Clock, Heart, X } from "lucide-react"; // <-- Added 'X' icon for the close button

interface GameCardProps {
    title: string;
    category: string;
    description: string;
    players: string;
    duration: string;
    thumbnail?: string;
    interested?: boolean;
    onInterestToggle?: () => void;
}

export function GameCard({
    title,
    category,
    description,
    players,
    duration,
    thumbnail,
    interested = false,
    onInterestToggle,
}: GameCardProps) {
    // 1. State to control the pop-up window
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 2. Logic to shorten the text just for the card view
    const MAX_LENGTH = 150;
    const isLongDescription = description.length > MAX_LENGTH;
    const displayDescription = isLongDescription
        ? description.substring(0, MAX_LENGTH) + "..."
        : description;

    return (
        <>
            {/* The Main Card */}
            <div className="w-full bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col h-full">

                {/* Thumbnail Image Section */}
                {thumbnail && (
                    <div className="w-full h-48 mb-5 rounded-xl overflow-hidden bg-slate-800/50 flex-shrink-0">
                        <img
                            src={thumbnail}
                            alt={`${title} cover`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Header Section */}
                <div className="flex items-start justify-between mb-3">
                    <h2 className="text-white text-2xl font-semibold">{title}</h2>
                    <span className="flex items-center gap-1.5 bg-emerald-900/40 text-emerald-400 px-3 py-1.5 rounded-lg text-sm border border-emerald-700/50 flex-shrink-0 ml-2">
                        {category}
                    </span>
                </div>

                {/* Description with "Read more" button */}
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                    {displayDescription}
                    {isLongDescription && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-blue-400 hover:text-blue-300 ml-2 font-medium transition-colors"
                        >
                            Read more
                        </button>
                    )}
                </p>

                {/* Bottom Section (Pinned to bottom using mt-auto) */}
                <div className="mt-auto">
                    {/* Metadata */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span>{players}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Clock className="w-4 h-4 text-orange-400" />
                            <span>{duration}</span>
                        </div>
                    </div>

                    {/* Interest Button */}
                    <button
                        onClick={onInterestToggle}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-white py-3 rounded-xl border border-slate-700 transition-colors"
                    >
                        <Heart
                            className={`w-4 h-4 ${interested ? 'fill-red-500 text-red-500' : 'text-white'}`}
                        />
                        <span>Always interested</span>
                    </button>
                </div>
            </div>

            {/* THE POP-UP MODAL (Z-Axis overlay) */}
            {isModalOpen && (
                <div
                    // This darkens the background and puts the modal on top (z-50)
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setIsModalOpen(false)} // Clicking the dark background closes it
                >
                    <div
                        // The actual window box
                        className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col relative shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // Prevents clicks inside the window from closing it
                    >
                        {/* Close Button (X icon) */}
                        <button
                            className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-3xl font-bold text-white mb-6 pr-8">{title}</h2>

                        {/* whitespace-pre-wrap makes sure that the new lines (\n) 
                            we added in page.tsx are rendered as actual paragraphs! 
                        */}
                        <div className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap">
                            {description}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}