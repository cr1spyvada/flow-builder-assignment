<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import NodePalette from './components/palette/NodePalette.vue'
import WorkflowCanvas from './components/canvas/WorkflowCanvas.vue'
import ConfigPanel from './components/panel/ConfigPanel.vue'
import RunPreview from './components/preview/RunPreview.vue'
import { useWorkflowStore } from './stores/workflow'
import { persistence } from './utils/persistence'

const store = useWorkflowStore()

onMounted(() => {
  const savedState = persistence.load()
  if (savedState) {
    store.nodes = savedState.nodes
    store.edges = savedState.edges
    store.viewport = savedState.viewport
  }

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      if (e.shiftKey) {
        store.redo()
      } else {
        store.undo()
      }
    }
  })
})
</script>

<template>
  <div class="flex flex-col h-screen w-screen overflow-hidden text-slate-900 bg-slate-50 selection:bg-primary-100 italic-none">
    <AppHeader />
    
    <div class="flex flex-1 overflow-hidden relative">
      <NodePalette />
      
      <main class="flex-1 relative flex flex-col">
        <WorkflowCanvas />
        <RunPreview />
      </main>

      <ConfigPanel v-if="store.selectedNodeId" :key="store.selectedNodeId" />
    </div>
  </div>
</template>

<style>
/* Global resets and utility classes */
body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100vw;
  height: 100vh;
}

.italic-none * {
  font-style: normal !important;
}
</style>
