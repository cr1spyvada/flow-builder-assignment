<script setup lang="ts">
import { ref } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { Simulator } from '@/utils/simulator'
import { Play, Pause, SkipForward, RotateCcw, Terminal, CheckCircle, AlertCircle } from 'lucide-vue-next'

const store = useWorkflowStore()
const isRunning = ref(false)
const logs = ref<any[]>([])
const currentStepIndex = ref(-1)
let simulator: Simulator | null = null
let plan: any[] = []

const log = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
  logs.value.unshift({ timestamp: new Date().toLocaleTimeString(), message, type })
}

const resetSimulation = () => {
  isRunning.value = false
  currentStepIndex.value = -1
  store.nodes.forEach(n => {
    if (n.data) n.data.status = 'idle'
  })
  logs.value = []
  log('Simulation reset', 'info')
}

const startSimulation = async () => {
  if (currentStepIndex.value === -1) {
    simulator = new Simulator(store.nodes, store.edges)
    plan = simulator.getTopologicalOrder()
    if (plan.length === 0) {
      log('No trigger nodes found to start workflow', 'error')
      return
    }
    log(`Workflow initialized with ${plan.length} nodes in execution plan`, 'info')
  }

  isRunning.value = true
  store.isSimulating = true
  while (isRunning.value && currentStepIndex.value < plan.length - 1) {
    currentStepIndex.value++
    const node = plan[currentStepIndex.value]
    
    try {
      log(`Executing: ${node.data?.label}...`, 'info')
      await simulator!.executeStep(node, (id, status) => {
        const n = store.nodes.find(node => node.id === id)
        if (n && n.data) n.data.status = status
      })
      log(`Completed: ${node.data.label}`, 'success')
      
      // Artificial delay between steps
      await new Promise(r => setTimeout(r, 500))
    } catch (e: any) {
      log(`Failed: ${node.data.label} - ${e.message}`, 'error')
      isRunning.value = false
      break
    }
  }

  if (currentStepIndex.value === plan.length - 1) {
    log('Workflow execution finished successfully', 'success')
  }
  
  isRunning.value = false
  store.isSimulating = false
}

const pauseSimulation = () => {
  isRunning.value = false
}

const stepSimulation = async () => {
  if (currentStepIndex.value === -1) {
    simulator = new Simulator(store.nodes, store.edges)
    plan = simulator.getTopologicalOrder()
  }

    if (currentStepIndex.value < plan.length - 1) {
      currentStepIndex.value++
      const node = plan[currentStepIndex.value]
      try {
        await simulator!.executeStep(node, (id, status) => {
          const n = store.nodes.find(node => node.id === id)
          if (n && n.data) n.data.status = status
        })
      } catch (e: any) {
        log(`Error in step: ${e.message}`, 'error')
      }
    }
}
</script>

<template>
  <div class="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 flex h-64 overflow-hidden">
    <!-- Controls -->
    <div class="w-72 border-r border-slate-100 p-6 flex flex-col justify-between bg-slate-50/50">
      <div class="space-y-4">
        <div>
          <h3 class="font-bold text-slate-800">Run Preview</h3>
          <p class="text-xs text-slate-500">Simulate your workflow execution</p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button 
            v-if="!isRunning"
            @click="startSimulation"
            class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm active:scale-[0.98]"
          >
            <Play class="w-4 h-4 fill-current" />
            Play
          </button>
          <button 
            v-else
            @click="pauseSimulation"
            class="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-all shadow-sm active:scale-[0.98]"
          >
            <Pause class="w-4 h-4 fill-current" />
            Pause
          </button>
          
          <button 
            @click="stepSimulation"
            :disabled="isRunning"
            class="p-2 border border-slate-200 hover:bg-white rounded-lg text-slate-600 transition-all disabled:opacity-50"
            title="Step Forward"
          >
            <SkipForward class="w-5 h-5" />
          </button>

          <button 
            @click="resetSimulation"
            class="p-2 border border-slate-200 hover:bg-white rounded-lg text-slate-600 transition-all"
            title="Reset"
          >
            <RotateCcw class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs font-semibold">
          <span class="text-slate-500 uppercase tracking-wider">Progress</span>
          <span class="text-primary-600">{{ currentStepIndex + 1 }} / {{ plan.length || 0 }}</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div 
            class="bg-primary-500 h-full transition-all duration-300"
            :style="{ width: (plan.length ? ((currentStepIndex + 1) / plan.length) * 100 : 0) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Logs -->
    <div class="flex-1 flex flex-col bg-slate-900">
      <div class="px-6 py-2 border-b border-slate-800 flex items-center gap-2">
        <Terminal class="w-3.5 h-3.5 text-slate-400" />
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Execution Logs</span>
      </div>
      <div class="flex-1 overflow-y-auto p-5 font-medium text-[12px] space-y-3 custom-scrollbar">
        <div v-if="logs.length === 0" class="text-slate-600 italic opacity-50 flex flex-col items-center justify-center h-full gap-2">
          <Terminal class="w-8 h-8" />
          <span>No activity logs. Press Play to begin.</span>
        </div>
        <div v-for="(log, i) in logs" :key="i" class="flex gap-4 group animate-in slide-in-from-bottom-2 duration-300">
          <span class="text-slate-600 shrink-0 select-none text-[10px] bg-slate-800 px-1.5 py-0.5 rounded opacity-70 mt-0.5 font-mono">{{ log.timestamp }}</span>
          <div class="flex gap-2.5 items-start">
            <div class="shrink-0 mt-0.5">
              <CheckCircle v-if="log.type === 'success'" class="w-4 h-4 text-emerald-400" />
              <AlertCircle v-else-if="log.type === 'error'" class="w-4 h-4 text-red-400" />
              <div v-else class="w-4 h-4 border-l-2 border-slate-700 ml-1.5"></div>
            </div>
            <span :class="{
              'text-emerald-300 font-bold': log.type === 'success',
              'text-red-300 font-bold': log.type === 'error',
              'text-slate-200': log.type === 'info'
            }" class="leading-relaxed">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-700 rounded-full;
}
</style>
