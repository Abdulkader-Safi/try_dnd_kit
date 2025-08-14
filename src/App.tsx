import { useState } from "react";
import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	closestCenter,
} from "@dnd-kit/core";
import { BoxSidebar } from "./components/BoxSidebar";
import { GridDropZone } from "./components/GridDropZone";
import { DraggableBox } from "./components/DraggableBox";
import type { BoxData } from "./components/DraggableBox";

const INITIAL_BOXES: BoxData[] = [
	{
		id: "header-1",
		type: "Layout",
		label: "Header",
		color: "bg-blue-100 border-blue-300",
		size: "normal",
	},
	{
		id: "nav-1",
		type: "Layout",
		label: "Navigation",
		color: "bg-blue-100 border-blue-300",
		size: "normal",
	},
	{
		id: "hero-1",
		type: "Layout",
		label: "Hero Section",
		color: "bg-blue-100 border-blue-300",
		size: "wide",
	},
	{
		id: "footer-1",
		type: "Layout",
		label: "Footer",
		color: "bg-blue-100 border-blue-300",
		size: "normal",
	},
	{
		id: "button-1",
		type: "UI",
		label: "Button",
		color: "bg-green-100 border-green-300",
		size: "normal",
	},
	{
		id: "input-1",
		type: "UI",
		label: "Text Input",
		color: "bg-green-100 border-green-300",
		size: "normal",
	},
	{
		id: "card-1",
		type: "UI",
		label: "Card",
		color: "bg-green-100 border-green-300",
		size: "normal",
	},
	{
		id: "modal-1",
		type: "UI",
		label: "Modal",
		color: "bg-green-100 border-green-300",
		size: "normal",
	},
	{
		id: "chart-1",
		type: "Data",
		label: "Chart",
		color: "bg-purple-100 border-purple-300",
		size: "wide",
	},
	{
		id: "table-1",
		type: "Data",
		label: "Data Table",
		color: "bg-purple-100 border-purple-300",
		size: "normal",
	},
	{
		id: "form-1",
		type: "Forms",
		label: "Contact Form",
		color: "bg-orange-100 border-orange-300",
		size: "normal",
	},
	{
		id: "search-1",
		type: "Forms",
		label: "Search Bar",
		color: "bg-orange-100 border-orange-300",
		size: "normal",
	},
];

const GRID_SIZE = 18; // 6x3 grid (6 rows × 3 columns)

interface GridSlot {
	id: string;
	box?: BoxData;
	isOccupiedByMultiColumn?: boolean; // true if this slot is occupied by a multi-column box but not the primary slot
}

// Utility functions for multi-column placement
const getSlotIndex = (slotId: string): number => {
	return Number.parseInt(slotId.replace("slot-", ""));
};

const getSlotPosition = (
	index: number,
	columns = 3,
): { row: number; col: number } => {
	return {
		row: Math.floor(index / columns),
		col: index % columns,
	};
};

const getSlotId = (row: number, col: number, columns = 3): string => {
	return `slot-${row * columns + col}`;
};

const canPlaceBox = (
	slotId: string,
	boxSize: BoxData["size"],
	gridSlots: GridSlot[],
	columns = 3,
): boolean => {
	const slotIndex = getSlotIndex(slotId);
	const position = getSlotPosition(slotIndex, columns);

	// Check if the primary slot is available
	const primarySlot = gridSlots.find((slot) => slot.id === slotId);
	if (primarySlot?.box || primarySlot?.isOccupiedByMultiColumn) {
		return false;
	}

	if (boxSize === "wide") {
		// Check if there's space for 2 columns
		if (position.col >= columns - 1) return false; // Not enough space to the right
		const rightSlotId = getSlotId(position.row, position.col + 1, columns);
		const rightSlot = gridSlots.find((slot) => slot.id === rightSlotId);
		return !rightSlot?.box && !rightSlot?.isOccupiedByMultiColumn;
	}

	return true; // normal boxes only need 1 slot
};

const getOccupiedSlots = (
	slotId: string,
	boxSize: BoxData["size"],
	columns = 3,
): string[] => {
	const slots = [slotId];
	const slotIndex = getSlotIndex(slotId);
	const position = getSlotPosition(slotIndex, columns);

	if (boxSize === "wide") {
		slots.push(getSlotId(position.row, position.col + 1, columns));
	}

	return slots;
};

function App() {
	const [availableBoxes, setAvailableBoxes] =
		useState<BoxData[]>(INITIAL_BOXES);
	const [gridSlots, setGridSlots] = useState<GridSlot[]>(() =>
		Array.from({ length: GRID_SIZE }, (_, i) => ({
			id: `slot-${i}`,
		})),
	);
	const [activeBox, setActiveBox] = useState<BoxData | null>(null);

	const handleDragStart = (event: DragStartEvent) => {
		// Check if dragging from available boxes
		const draggedBox = availableBoxes.find((box) => box.id === event.active.id);
		if (draggedBox) {
			setActiveBox(draggedBox);
			return;
		}

		// Check if dragging from grid slots
		const draggedFromGrid = gridSlots.find(
			(slot) => slot.box?.id === event.active.id,
		);
		if (draggedFromGrid?.box) {
			setActiveBox(draggedFromGrid.box);
			
			// If dragging a wide box, temporarily clear its occupied slots
			if (draggedFromGrid.box.size === "wide") {
				const occupiedSlots = getOccupiedSlots(draggedFromGrid.id, draggedFromGrid.box.size, 3);
				setGridSlots((prev) =>
					prev.map((slot) => {
						if (occupiedSlots.includes(slot.id)) {
							return { ...slot, box: undefined, isOccupiedByMultiColumn: false };
						}
						return slot;
					}),
				);
			}
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		const originalActiveBox = activeBox;
		setActiveBox(null);

		// Find if we were dragging from the grid
		const draggedFromGrid = gridSlots.find(
			(slot) => slot.box?.id === active.id,
		);

		// If no valid drop target or not over anything, restore the box if it was from grid
		if (!over || !active) {
			if (draggedFromGrid?.box && originalActiveBox) {
				// Restore the box to its original position
				const occupiedSlots = getOccupiedSlots(draggedFromGrid.id, originalActiveBox.size, 3);
				setGridSlots((prev) =>
					prev.map((slot) => {
						if (slot.id === draggedFromGrid.id) {
							return { ...slot, box: originalActiveBox, isOccupiedByMultiColumn: false };
						}
						if (occupiedSlots.includes(slot.id) && slot.id !== draggedFromGrid.id && originalActiveBox.size === "wide") {
							return { ...slot, box: undefined, isOccupiedByMultiColumn: true };
						}
						return slot;
					}),
				);
			}
			return;
		}

		const draggedFromSidebar = availableBoxes.find(
			(box) => box.id === active.id,
		);
		const targetSlotId = over.id as string;

		// Only allow dropping on grid slots
		if (!targetSlotId.startsWith("slot-")) {
			// Restore box if it was dragged from grid
			if (draggedFromGrid?.box && originalActiveBox) {
				const occupiedSlots = getOccupiedSlots(draggedFromGrid.id, originalActiveBox.size, 3);
				setGridSlots((prev) =>
					prev.map((slot) => {
						if (slot.id === draggedFromGrid.id) {
							return { ...slot, box: originalActiveBox, isOccupiedByMultiColumn: false };
						}
						if (occupiedSlots.includes(slot.id) && slot.id !== draggedFromGrid.id && originalActiveBox.size === "wide") {
							return { ...slot, box: undefined, isOccupiedByMultiColumn: true };
						}
						return slot;
					}),
				);
			}
			return;
		}

		// Case 1: Dragging from sidebar to grid
		if (draggedFromSidebar && !draggedFromGrid) {
			// Check if we can place the box at the target location
			if (!canPlaceBox(targetSlotId, draggedFromSidebar.size, gridSlots, 3))
				return;

			// Get all slots that will be occupied by this box
			const occupiedSlots = getOccupiedSlots(
				targetSlotId,
				draggedFromSidebar.size,
				3,
			);

			// Remove box from available boxes (one-time use)
			setAvailableBoxes((prev) =>
				prev.filter((box) => box.id !== draggedFromSidebar.id),
			);

			// Place the box and mark occupied slots
			setGridSlots((prev) =>
				prev.map((slot) => {
					if (slot.id === targetSlotId) {
						// Primary slot gets the box
						return {
							...slot,
							box: draggedFromSidebar,
							isOccupiedByMultiColumn: false,
						};
					}
					if (occupiedSlots.includes(slot.id) && slot.id !== targetSlotId) {
						// Secondary slots are marked as occupied
						return { ...slot, box: undefined, isOccupiedByMultiColumn: true };
					}
					return slot;
				}),
			);
		}

		// Case 2: Dragging from one grid slot to another
		if (draggedFromGrid?.box && !draggedFromSidebar) {
			// Don't allow dropping on the same slot
			if (draggedFromGrid.id === targetSlotId) return;

			const draggedBox = draggedFromGrid.box;

			// Get slots that will be vacated
			const oldOccupiedSlots = getOccupiedSlots(
				draggedFromGrid.id,
				draggedBox.size,
				3,
			);

			// Create a temporary grid state with old position cleared for collision detection
			const tempGridSlots = gridSlots.map((slot) => {
				if (oldOccupiedSlots.includes(slot.id)) {
					return { ...slot, box: undefined, isOccupiedByMultiColumn: false };
				}
				return slot;
			});

			// Check if we can place the box at the target location (using temp grid state)
			if (!canPlaceBox(targetSlotId, draggedBox.size, tempGridSlots, 3)) {
				// Restore the box to its original position
				if (originalActiveBox) {
					const occupiedSlots = getOccupiedSlots(draggedFromGrid.id, originalActiveBox.size, 3);
					setGridSlots((prev) =>
						prev.map((slot) => {
							if (slot.id === draggedFromGrid.id) {
								return { ...slot, box: originalActiveBox, isOccupiedByMultiColumn: false };
							}
							if (occupiedSlots.includes(slot.id) && slot.id !== draggedFromGrid.id && originalActiveBox.size === "wide") {
								return { ...slot, box: undefined, isOccupiedByMultiColumn: true };
							}
							return slot;
						}),
					);
				}
				return;
			}

			const newOccupiedSlots = getOccupiedSlots(targetSlotId, draggedBox.size, 3);

			setGridSlots((prev) =>
				prev.map((slot) => {
					// Clear old position
					if (oldOccupiedSlots.includes(slot.id)) {
						return { ...slot, box: undefined, isOccupiedByMultiColumn: false };
					}
					// Set new position
					if (slot.id === targetSlotId) {
						return { ...slot, box: draggedBox, isOccupiedByMultiColumn: false };
					}
					if (newOccupiedSlots.includes(slot.id) && slot.id !== targetSlotId) {
						return { ...slot, box: undefined, isOccupiedByMultiColumn: true };
					}
					return slot;
				}),
			);
		}
	};

	const handleRemoveBox = (boxId: string) => {
		// Find the box in the grid
		const gridSlot = gridSlots.find((slot) => slot.box?.id === boxId);
		if (!gridSlot?.box) return;

		const boxToReturn = gridSlot.box;

		// Get all slots occupied by this box
		const occupiedSlots = getOccupiedSlots(gridSlot.id, boxToReturn.size, 3);

		// Clear all occupied slots
		setGridSlots((prev) =>
			prev.map((slot) => {
				if (occupiedSlots.includes(slot.id)) {
					return { ...slot, box: undefined, isOccupiedByMultiColumn: false };
				}
				return slot;
			}),
		);

		// Return to available boxes
		setAvailableBoxes((prev) => [...prev, boxToReturn]);
	};

	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className="min-h-screen bg-gray-50 flex">
				<BoxSidebar availableBoxes={availableBoxes} />
				<GridDropZone
					gridSlots={gridSlots}
					onRemoveBox={handleRemoveBox}
					columns={3}
				/>

				<DragOverlay>
					{activeBox ? <DraggableBox box={activeBox} /> : null}
				</DragOverlay>
			</div>
		</DndContext>
	);
}

export default App;
