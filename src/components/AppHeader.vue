<script setup lang="ts">
import { useWorkflowStore } from '@/stores/workflow'
import { persistence } from '@/utils/persistence'
import { 
  Undo2, Redo2, Save, Download, Upload, 
  Trash2, Play, MousePointer2 
} from 'lucide-vue-next'

const store = useWorkflowStore()

const handleSave = () => {
  persistence.save({
    nodes: store.nodes,
    edges: store.edges,
    viewport: store.viewport
  })
}

const handleClear = () => {
  if (confirm('Are you sure you want to clear the entire workflow?')) {
    store.nodes = []
    store.edges = []
    persistence.clear()
  }
}
</script>

<template>
  <header class="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-50">
    <div class="flex items-center gap-4">
      <div class="p-2 bg-primary-600 rounded-lg shadow-lg rotate-3 -mr-2">
        <MousePointer2 class="w-6 h-6 text-white" />
      </div>
      <div class="ml-2">
        <h1 class="font-black text-slate-800 text-xl tracking-tight">Flow<span class="text-primary-600">Forge</span></h1>
      </div>
      
      <div class="h-6 w-px bg-slate-200 mx-2"></div>
      
      <div class="flex items-center gap-1">
        <button 
          @click="store.undo"
          :disabled="store.history.past.length === 0"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-30 transition-all active:scale-90"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 class="w-5 h-5" />
        </button>
        <button 
          @click="store.redo"
          :disabled="store.history.future.length === 0"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-30 transition-all active:scale-90"
          title="Redo (Shift+Ctrl+Z)"
        >
          <Redo2 class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button 
        v-if="store.selectedCount > 0"
        @click="store.removeSelected"
        class="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-bold transition-all animate-in fade-in zoom-in duration-200"
      >
        <Trash2 class="w-4 h-4" />
        Delete Selection ({{ store.selectedCount }})
      </button>

      <button 
        @click="handleClear"
        class="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-all"
      >
        <Trash2 class="w-4 h-4" />
        Clear
      </button>

      <div class="h-6 w-px bg-slate-200 mx-1"></div>

      <button 
        @click="handleSave"
        class="flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-md active:scale-95"
      >
        <Save class="w-4 h-4" />
        Backup to Local
      </button>
    </div>
  </header>
</template>
