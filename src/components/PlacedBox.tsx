import { X } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { BoxData } from "./DraggableBox";

interface PlacedBoxProps {
	box: BoxData;
	onRemove: (boxId: string) => void;
}

export function PlacedBox({ box, onRemove }: PlacedBoxProps) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: box.id,
	});

	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
			}
		: undefined;

	const getSizeClasses = () => {
		// Grid positioning is now handled by parent container
		return 'w-full h-full';
	};

	const getSizeIndicator = () => {
		switch (box.size) {
			case 'wide':
				return '↔️';
			default:
				return '';
		}
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"p-4 rounded-lg border-2 relative group transition-all select-none h-full",
				"hover:shadow-md",
				getSizeClasses(),
				isDragging && "opacity-50 shadow-lg",
				box.color,
			)}
		>
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					onRemove(box.id);
				}}
				className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
				style={{ pointerEvents: 'auto' }}
			>
				<X size={12} />
			</button>
			<div 
				{...listeners}
				{...attributes}
				className="text-sm font-medium text-center flex flex-col items-center justify-center h-full gap-1 cursor-grab active:cursor-grabbing"
			>
				<span>{box.label}</span>
				{getSizeIndicator() && (
					<span className="text-xs opacity-70">{getSizeIndicator()}</span>
				)}
			</div>
		</div>
	);
}
