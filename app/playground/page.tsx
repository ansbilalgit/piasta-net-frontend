// app/playground/page.tsx
import { GameCard } from "@/app/components/Card";

export default function Playground() {
    return (
        <div className="p-10 flex flex-col gap-5 items-start">
            <h1>Component Playground</h1>
            <GameCard
                title="7 Wonders"
                category="Board Games"
                description="Lead an ancient civilization to greatness through card drafting."
                players="2-7 Players"
                duration="45 min"
            />
        </div>
    );
}