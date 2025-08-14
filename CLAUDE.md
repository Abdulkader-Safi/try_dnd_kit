# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React drag-and-drop interface builder built with TypeScript, Vite, and @dnd-kit. The application allows users to drag UI components from a sidebar into a 2-column grid layout with 16:9 aspect ratio slots. It's designed as a visual layout tool where each component can be placed, repositioned, and removed from the grid.

## Development Commands

- **Start development server**: `npm run dev` or `bun dev`
- **Build for production**: `npm run build` or `bun run build`
- **Lint code**: `npm run lint` or `bun run lint`
- **Preview production build**: `npm run preview` or `bun run preview`

## Architecture Overview

### Core State Management
- **App.tsx**: Central state management with `availableBoxes` (sidebar components) and `gridSlots` (grid state)
- **Grid Configuration**: 2-column layout with 16 total slots (8 rows × 2 columns), each slot maintains 16:9 aspect ratio
- **Drag & Drop Logic**: Handles moving components from sidebar to grid and between grid positions

### Key Component Structure

**DraggableBox** (`src/components/DraggableBox.tsx`)
- Represents draggable UI components in the sidebar
- Uses `useDraggable` hook from @dnd-kit/core
- `BoxData` interface defines component structure: `id`, `type`, `label`, `color`, `size`

**GridDropZone** (`src/components/GridDropZone.tsx`) 
- 2-column grid container with aspect-video slots
- Each slot uses `useDroppable` hook for drop target functionality
- Renders `GridSlotComponent` for individual drop zones

**PlacedBox** (`src/components/PlacedBox.tsx`)
- Represents components placed in the grid
- Includes remove functionality and maintains draggable behavior within grid

**BoxSidebar** (`src/components/BoxSidebar.tsx`)
- Organizes available components by category (Layout, UI, Forms, Data)
- Uses shadcn/ui Sheet component for responsive sidebar

### Data Flow
1. Components start in `availableBoxes` array (sidebar)
2. Drag from sidebar moves component to `gridSlots` array and removes from sidebar
3. Drag within grid updates slot positions
4. Remove button returns component to sidebar

### Technology Stack
- **React 19** with TypeScript for component architecture
- **@dnd-kit** for drag-and-drop functionality (collision detection, drag overlays)
- **Tailwind CSS v4** for styling with aspect-video utilities
- **shadcn/ui** components (configured in `components.json`)
- **Vite** for build tooling with path aliases (`@/` → `src/`)

### Important Patterns
- All components use 16:9 aspect ratio (`aspect-video` class)
- Grid defaults to 2 columns but accepts `columns` prop
- Color coding: Layout (blue), UI (green), Forms (orange), Data (purple)
- Components are "consumed" when placed (removed from sidebar) and restored when removed from grid