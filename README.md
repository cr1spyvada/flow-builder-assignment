# FlowForge Documentation

## Architecture Overview
FlowForge uses a centralized store (`Pinia`) to maintain the single source of truth for all nodes and edges. History is managed by taking deep clones of the state before each mutation, allowing for reliable undo/redo.

### State Shape
```typescript
interface WorkflowState {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  viewport: { x: number, y: number, zoom: number }
}
```

## How to use
1. **Build the Flow**: Drag components from the left sidebar onto the canvas.
2. **Connect**: Click and drag from the right handle of a node to the left handle of another.
3. **Configure**: Click on a node to open the right-side configuration panel.
4. **Test**: Use the bottom Run Preview bar to simulate the execution.
5. **Back up**: Use the "Backup to Local" button in the header to save your work.

## Running the App
```bash
npm install
npm run dev
```
