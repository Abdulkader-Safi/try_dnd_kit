import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

export interface BoxData {
	id: string;
	type: string;
	label: string;
	color: string;
	size: "normal" | "wide"; // normal = 1 column, wide = 2 columns
}

interface DraggableBoxProps {
	box: BoxData;
	disabled?: boolean;
}

export function DraggableBox({ box, disabled = false }: DraggableBoxProps) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: box.id,
			disabled,
		});

	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
			}
		: undefined;

	const getSizeClasses = () => {
		switch (box.size) {
			case "wide":
				return "aspect-[2/1]"; // 2:1 aspect ratio for wide boxes
			default:
				return "aspect-video"; // 16:9 for normal boxes
		}
	};

	const getSizeIndicator = () => {
		switch (box.size) {
			case "wide":
				return "↔️"; // horizontal arrow for wide boxes
			default:
				return "";
		}
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className={cn(
				"p-4 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all",
				"hover:shadow-md select-none",
				getSizeClasses(),
				isDragging && "opacity-50 shadow-lg",
				disabled && "opacity-50 cursor-not-allowed",
				box.color,
			)}
		>
			<div className="text-sm font-medium text-center flex flex-col items-center gap-1">
				<span>{box.label}</span>
				{getSizeIndicator() && (
					<span className="text-xs opacity-70">{getSizeIndicator()}</span>
				)}
			</div>
		</div>
	);
}
