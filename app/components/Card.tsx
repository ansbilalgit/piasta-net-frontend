import { Users, Clock, Heart } from "lucide-react"

interface GameCardProps {
    title: string;
    category: string;
    description: string;
    players: string;
    duration: string;
    interested?: boolean;
    onInterestToggle?: () => void;
}

export function GameCard({
    title,
    category,
    description,
    players,
    duration,
    interested = false,
    onInterestToggle,
}: GameCardProps) {
    return (
        <div className="w-full max-w-sm bg-slate-900 rounded-2xl p-6 border border-slate-800">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-3">
                <h2 className="text-white text-2xl font-semibold">{title}</h2>
                <span className="flex items-center gap-1.5 bg-emerald-900/40 text-emerald-400 px-3 py-1.5 rounded-lg text-sm border border-emerald-700/50">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="flex-shrink-0"
                    >
                        <path
                            d="M8 2v12M2 8h12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                    {category}
                </span>
            </div>

            {/* Description */}
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                {description}
            </p>

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
                    className={`w-4 h-4 ${interested ? 'fill-red-500 text-red-500' : 'text-white'
                        }`}
                />
                <span>Always interested</span>
            </button>
        </div>
    );
}
