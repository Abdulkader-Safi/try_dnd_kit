import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { PlacedBox } from "./PlacedBox";
import type { BoxData } from "./DraggableBox";

interface GridSlot {
	id: string;
	box?: BoxData;
	isOccupiedByMultiCell?: boolean; // true if this slot is occupied by a multi-cell box but not the primary slot
}

interface GridDropZoneProps {
	gridSlots: GridSlot[];
	onRemoveBox: (boxId: string) => void;
	columns?: number;
}

function GridSlotComponent({
	slot,
	onRemoveBox,
}: { slot: GridSlot; onRemoveBox: (boxId: string) => void }) {
	const { isOver, setNodeRef } = useDroppable({
		id: slot.id,
		disabled: slot.isOccupiedByMultiCell || (slot.box && slot.box.size !== 'normal'), // Disable if occupied by multi-cell or has multi-cell box
	});

	// If this slot is occupied by a multi-cell box but not the primary slot, render invisible placeholder
	if (slot.isOccupiedByMultiCell && !slot.box) {
		return <div className="aspect-square" />; // Invisible placeholder to maintain grid structure
	}

	// If this slot has a multi-cell box, don't render the slot border/content (it will be rendered separately)
	if (slot.box && slot.box.size !== 'normal') {
		return <div className="aspect-square" />; // Invisible placeholder for multi-cell primary slot
	}

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"aspect-square border-2 border-dashed border-gray-300 rounded-lg p-2 transition-all",
				"hover:border-gray-400",
				isOver && "border-blue-500 bg-blue-50",
				slot.box && "border-solid border-gray-400",
			)}
		>
			{slot.box && slot.box.size === 'normal' ? (
				<PlacedBox box={slot.box} onRemove={onRemoveBox} />
			) : (
				<div className="h-full flex items-center justify-center text-sm text-gray-500">
					Drop here
				</div>
			)}
		</div>
	);
}

export function GridDropZone({
	gridSlots,
	onRemoveBox,
	columns = 4,
}: GridDropZoneProps) {
	const rows = Math.ceil(gridSlots.length / columns);
	
	return (
		<div className="flex-1 p-6">
			<div
				className="grid gap-4 h-full"
				style={{ 
					gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
					gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
				}}
			>
				{gridSlots.map((slot) => (
					<GridSlotComponent
						key={slot.id}
						slot={slot}
						onRemoveBox={onRemoveBox}
					/>
				))}
				
				{/* Render multi-cell boxes with proper grid positioning */}
				{gridSlots.map((slot) => {
					if (slot.box && slot.box.size === 'wide') {
						const slotIndex = parseInt(slot.id.replace('slot-', ''));
						const row = Math.floor(slotIndex / columns) + 1; // CSS Grid is 1-indexed
						const col = slotIndex % columns + 1; // CSS Grid is 1-indexed
						
						const gridRowStart = row;
						const gridColStart = col;
						const gridRowEnd = row + 1; // Wide boxes only span 1 row
						const gridColEnd = col + 2; // Wide boxes span 2 columns
							
						return (
							<div
								key={`multi-${slot.id}`}
								style={{
									gridRowStart,
									gridRowEnd,
									gridColumnStart: gridColStart,
									gridColumnEnd: gridColEnd,
									zIndex: 10
								}}
								className="relative"
							>
								<PlacedBox box={slot.box} onRemove={onRemoveBox} />
							</div>
						);
					}
					return null;
				})}
			</div>
		</div>
	);
}
