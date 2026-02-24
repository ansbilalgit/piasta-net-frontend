import type { ReactNode } from "react";

type EventCounterProps = {
	icon: ReactNode;
	label: string;
	count: number | string;
};

export function EventCounter({ icon, label, count }: EventCounterProps) {
	return (
		<div className="event-counter">
			<div className="event-counter-left">
				<span className="event-counter-icon">{icon}</span>
				<span className="event-counter-label">{label}</span>
			</div>
			<span className="event-counter-badge">{count}</span>
		</div>
	);
}
