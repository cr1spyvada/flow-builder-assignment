import type { Node, Edge } from '@vue-flow/core'

export type NodeType = 'trigger_manual' | 'trigger_webhook' | 'action_http' | 'action_email' | 'action_sms' | 'logic_condition' | 'logic_transform'

export interface NodeData {
  label: string
  config: Record<string, any>
  status?: 'idle' | 'running' | 'success' | 'error' | 'skipped'
  error?: string
}

export type WorkflowNode = Node<NodeData, any, NodeType>
export type WorkflowEdge = Edge

export interface WorkflowState {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  viewport: {
    x: number
    y: number
    zoom: number
  }
}

export interface HistoryState {
  past: WorkflowState[]
  present: WorkflowState
  future: WorkflowState[]
}
