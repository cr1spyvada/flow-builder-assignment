import type { WorkflowState } from '@/types/workflow'

const STORAGE_KEY = 'workflow_builder_data'

export const persistence = {
  save(state: WorkflowState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.error('Failed to save state', e)
    }
  },

  load(): WorkflowState | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : null
    } catch (e) {
      console.error('Failed to load state', e)
      return null
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY)
  }
}
