import { Menu } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { DraggableBox, type BoxData } from "./DraggableBox";

interface BoxSidebarProps {
	availableBoxes: BoxData[];
}

export function BoxSidebar({ availableBoxes }: BoxSidebarProps) {
	const boxCategories = availableBoxes.reduce(
		(acc, box) => {
			if (!acc[box.type]) {
				acc[box.type] = [];
			}
			acc[box.type].push(box);
			return acc;
		},
		{} as Record<string, BoxData[]>,
	);

	return (
		<Sheet>
			<SheetTrigger className="fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
				<Menu size={20} />
			</SheetTrigger>
			<SheetContent side="left" className="w-80">
				<SheetHeader>
					<SheetTitle>Available Components</SheetTitle>
					<SheetDescription>
						Drag components from here to the grid. Each can be used only once.
					</SheetDescription>
				</SheetHeader>

				<div className="flex-1 overflow-y-auto px-4 pb-4">
					{Object.entries(boxCategories).map(([category, boxes]) => (
						<div key={category} className="mb-6">
							<h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
								{category}
							</h3>
							<div className="space-y-2">
								{boxes.map((box) => (
									<DraggableBox key={box.id} box={box} />
								))}
							</div>
						</div>
					))}

					{availableBoxes.length === 0 && (
						<div className="text-center text-muted-foreground py-8">
							All components have been used
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
