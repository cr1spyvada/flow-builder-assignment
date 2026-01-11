<script setup lang="ts">
import { ref, watch, markRaw } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { useWorkflowStore } from '@/stores/workflow'
import { MousePointer2, Zap } from 'lucide-vue-next'

// Import custom nodes
import TriggerNode from '../nodes/TriggerNode.vue'
import ActionNode from '../nodes/ActionNode.vue'
import LogicNode from '../nodes/LogicNode.vue'

const store = useWorkflowStore()
const { onConnect, addEdges, project, onPaneReady, onConnectEnd, onEdgesChange, onNodesChange } = useVueFlow()

onPaneReady(({ fitView }) => {
  fitView()
})

const nodeTypes = {
  trigger_manual: markRaw(TriggerNode),
  trigger_webhook: markRaw(TriggerNode),
  action_http: markRaw(ActionNode),
  action_email: markRaw(ActionNode),
  action_sms: markRaw(ActionNode),
  logic_condition: markRaw(LogicNode),
  logic_transform: markRaw(LogicNode),
}

// Listen for deletion
const onNodesDelete = (deletedNodes: any[]) => {
  deletedNodes.forEach(node => store.removeNode(node.id))
}

const onEdgesDelete = (deletedEdges: any[]) => {
  deletedEdges.forEach(edge => store.removeEdge(edge.id))
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event: DragEvent) => {
  const type = event.dataTransfer?.getData('application/vueflow')
  if (!type) return

  const position = project({
    x: event.clientX - 260, // Account for palette width
    y: event.clientY - 60,  // Account for header height
  })

  store.addNode(type, position)
}

const onNodeClick = (event: any) => {
  store.selectNode(event.node.id)
}

const onPaneClick = () => {
  store.selectNode(null)
}

// Sync store edges with VueFlow
watch(() => store.edges, (newEdges) => {
  // VueFlow handles edges internally if we use the store's edges directly in the template
}, { deep: true })
</script>

<template>
  <div class="flex-1 h-full relative" @drop="onDrop" @dragover="onDragOver">
    <!-- Empty State overlay -->
    <div 
      v-if="store.nodes.length === 0" 
      class="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
    >
      <div class="p-8 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 text-center space-y-4 max-w-sm">
        <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto">
          <MousePointer2 class="w-8 h-8 text-primary-600 animate-bounce" />
        </div>
        <div>
          <h3 class="font-black text-slate-800 text-xl">Start Building</h3>
          <p class="text-sm text-slate-500 font-medium mt-1">
            Drag components from the <span class="font-bold text-slate-700">sidebar</span> and drop them here to create your workflow.
          </p>
        </div>
        <div class="flex items-center justify-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
          <Zap class="w-3 h-3" />
          <span>Interactive Canvas</span>
        </div>
      </div>
    </div>

    <VueFlow
      v-model:nodes="store.nodes"
      v-model:edges="store.edges"
      :node-types="nodeTypes"
      @node-click="onNodeClick"
      @pane-click="onPaneClick"
      @connect="store.onConnect"
      @nodes-delete="onNodesDelete"
      @edges-delete="onEdgesDelete"
      :fit-view-on-init="true"
      class="bg-slate-50"
    >
      <Background :pattern-color="'#cbd5e1'" :gap="20" />
      <MiniMap />
      <Controls />
    </VueFlow>
  </div>
</template>

<style>
@reference "@/assets/main.css";

@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/minimap/dist/style.css';

.vue-flow__minimap {
  @apply !bg-white !border border-slate-200 !rounded-lg !shadow-lg;
}

.vue-flow__controls {
  @apply !bg-white !border border-slate-200 !rounded-lg !shadow-lg !flex-row p-1;
}

.vue-flow__controls-button {
  @apply !border-none text-slate-500 hover:!bg-slate-100 rounded;
}
</style>
