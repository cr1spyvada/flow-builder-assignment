import type { WorkflowNode, WorkflowEdge } from '@/types/workflow'

export class Simulator {
  private nodes: WorkflowNode[]
  private edges: WorkflowEdge[]
  private visited: Set<string> = new Set()
  private nodeMap: Map<string, WorkflowNode>

  constructor(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
    this.nodes = JSON.parse(JSON.stringify(nodes))
    this.edges = edges
    this.nodeMap = new Map(this.nodes.map((n) => [n.id, n]))
  }

  getTopologicalOrder(): WorkflowNode[] {
    const order: WorkflowNode[] = []
    const visited = new Set<string>()
    const temp = new Set<string>()

    const visit = (nodeId: string) => {
      if (temp.has(nodeId)) {
        // Simple cycle detection (ignore for now or log)
        return
      }
      if (!visited.has(nodeId)) {
        temp.add(nodeId)
        const neighbors = this.edges.filter((e) => e.source === nodeId).map((e) => e.target)

        neighbors.forEach(visit)

        temp.delete(nodeId)
        visited.add(nodeId)
        order.unshift(this.nodeMap.get(nodeId)!)
      }
    }

    // Start with trigger nodes
    const triggers = this.nodes.filter((n) => n.type?.startsWith('trigger'))
    triggers.forEach((t) => visit(t.id))

    return order // Correct topological order
  }

  async executeStep(
    node: WorkflowNode,
    onProgress: (id: string, status: any) => void,
  ): Promise<string | null> {
    onProgress(node.id, 'running')

    // Simulate work
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500))

    try {
      // Mock validation/execution
      if (
        node.type?.includes('action') &&
        node.data &&
        !node.data.config.url &&
        !node.data.config.to &&
        !node.data.config.phone
      ) {
        throw new Error('Missing configuration')
      }

      onProgress(node.id, 'success')

      // If logic node, return the handle to take
      if (node.type === 'logic_condition') {
        const result = Math.random() > 0.5 ? 'true' : 'false'
        return result
      }

      return 'default'
    } catch (e: any) {
      onProgress(node.id, 'error')
      throw e
    }
  }
}
