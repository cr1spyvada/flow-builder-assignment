import { defineStore } from 'pinia'
import { produce } from 'immer'
import type { WorkflowState, WorkflowNode, WorkflowEdge, NodeData } from '@/types/workflow'
import { v4 as uuidv4 } from 'uuid'
import { persistence } from '@/utils/persistence'

export const useWorkflowStore = defineStore('workflow', {
  state: () => ({
    nodes: [] as WorkflowNode[],
    edges: [] as WorkflowEdge[],
    viewport: { x: 0, y: 0, zoom: 1 },
    history: {
      past: [] as WorkflowState[],
      future: [] as WorkflowState[],
    },
    selectedNodeId: null as string | null,
    isSimulating: false,
  }),

  getters: {
    selectedCount(): number {
      const nodeCount = (this.nodes as any[]).filter((n) => n.selected).length
      const edgeCount = (this.edges as any[]).filter((e) => e.selected).length
      return nodeCount + edgeCount
    },
  },

  actions: {
    saveToHistory() {
      const currentState: WorkflowState = {
        nodes: JSON.parse(JSON.stringify(this.nodes)),
        edges: JSON.parse(JSON.stringify(this.edges)),
        viewport: { ...this.viewport },
      }
      this.history.past.push(currentState)
      if (this.history.past.length > 50) this.history.past.shift()
      this.history.future = []
    },

    undo() {
      if (this.history.past.length === 0) return

      const previous = this.history.past.pop()!
      const current: WorkflowState = {
        nodes: JSON.parse(JSON.stringify(this.nodes)),
        edges: JSON.parse(JSON.stringify(this.edges)),
        viewport: { ...this.viewport },
      }
      this.history.future.push(current)

      this.nodes = previous.nodes
      this.edges = previous.edges
      this.viewport = previous.viewport
    },

    redo() {
      if (this.history.future.length === 0) return

      const next = this.history.future.pop()!
      const current: WorkflowState = {
        nodes: JSON.parse(JSON.stringify(this.nodes)),
        edges: JSON.parse(JSON.stringify(this.edges)),
        viewport: { ...this.viewport },
      }
      this.history.past.push(current)

      this.nodes = next.nodes
      this.edges = next.edges
      this.viewport = next.viewport
    },

    addNode(type: string, position: { x: number; y: number }) {
      this.saveToHistory()
      const newNode: WorkflowNode = {
        id: uuidv4(),
        type: type as any,
        position,
        data: {
          label: type.split('_').pop()?.toUpperCase() || 'New Node',
          config: {},
          status: 'idle',
        },
      }
      this.nodes.push(newNode)
    },

    updateNodeData(id: string, data: Partial<NodeData>) {
      this.saveToHistory()
      const node = this.nodes.find((n) => n.id === id)
      if (node && node.data) {
        // Direct mutation is reactive in Pinia and safer for VueFlow synchronization
        if (data.config) {
          node.data.config = JSON.parse(JSON.stringify(data.config))
        }
        if (data.label) node.data.label = data.label
        if (data.status) node.data.status = data.status

        // Auto-save to local storage on every change
        this.persist()
      }
    },

    persist() {
      persistence.save({
        nodes: this.nodes,
        edges: this.edges,
        viewport: this.viewport,
      })
    },

    removeNode(id: string) {
      this.saveToHistory()
      this.nodes = this.nodes.filter((n) => n.id !== id)
      this.edges = this.edges.filter((e) => e.source !== id && e.target !== id)
    },

    setNodes(nodes: WorkflowNode[]) {
      this.nodes = nodes
    },

    setEdges(edges: WorkflowEdge[]) {
      this.edges = edges
    },

    onConnect(params: any) {
      this.saveToHistory()
      this.edges.push({
        id: uuidv4(),
        ...params,
      })
    },

    setViewport(viewport: { x: number; y: number; zoom: number }) {
      this.viewport = viewport
    },

    selectNode(id: string | null) {
      this.selectedNodeId = id
    },

    removeEdge(id: string) {
      this.saveToHistory()
      this.edges = this.edges.filter((e) => e.id !== id)
      this.persist()
    },

    removeSelected() {
      const selectedNodes = (this.nodes as any[]).filter((n) => n.selected)
      const selectedEdges = (this.edges as any[]).filter((e) => e.selected)

      if (selectedNodes.length === 0 && selectedEdges.length === 0) return

      this.saveToHistory()

      // Filter out nodes and their connected edges
      const selectedNodeIds = new Set(selectedNodes.map((n) => n.id))
      this.nodes = this.nodes.filter((n) => !selectedNodeIds.has(n.id))

      // Filter out explicitly selected edges and edges connected to deleted nodes
      const selectedEdgeIds = new Set(selectedEdges.map((e) => e.id))
      this.edges = this.edges.filter((e) => {
        return (
          !selectedEdgeIds.has(e.id) &&
          !selectedNodeIds.has(e.source) &&
          !selectedNodeIds.has(e.target)
        )
      })

      this.persist()
      if (selectedNodeIds.has(this.selectedNodeId as string)) {
        this.selectNode(null)
      }
    },
  },
})
