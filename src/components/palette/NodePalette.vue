<script setup lang="ts">
import { Zap, Globe, Send, Mail, MessageSquare, GitBranch, Code2, GripVertical } from 'lucide-vue-next'

const nodeTypes = [
  {
    group: 'Triggers',
    description: 'Events that start your workflow',
    types: [
      { id: 'trigger_manual', label: 'Manual Trigger', icon: Zap, color: 'text-amber-500', desc: 'Run flow by clicking a button' },
      { id: 'trigger_webhook', label: 'Webhook', icon: Globe, color: 'text-blue-500', desc: 'Start flow via external URL' },
    ]
  },
  {
    group: 'Actions',
    description: 'Tasks performed by the system',
    types: [
      { id: 'action_http', label: 'HTTP Request', icon: Send, color: 'text-emerald-500', desc: 'Call an external API endpoint' },
      { id: 'action_email', label: 'Send Email', icon: Mail, color: 'text-indigo-500', desc: 'Send an email notification' },
      { id: 'action_sms', label: 'Send SMS', icon: MessageSquare, color: 'text-cyan-500', desc: 'Send a text message' },
    ]
  },
  {
    group: 'Logic',
    description: 'Control the flow and data',
    types: [
      { id: 'logic_condition', label: 'Condition', icon: GitBranch, color: 'text-purple-500', desc: 'Branch based on data values' },
      { id: 'logic_transform', label: 'Transform', icon: Code2, color: 'text-orange-500', desc: 'Modify data using JavaScript' },
    ]
  }
]

const onDragStart = (event: DragEvent, type: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', type)
    event.dataTransfer.effectAllowed = 'move'
  }
}
</script>

<template>
  <div class="w-64 bg-white border-r border-slate-200 h-full flex flex-col p-4 overflow-y-auto">
    <div class="mb-6">
      <h2 class="text-lg font-bold text-slate-800">Components</h2>
      <p class="text-xs text-slate-500">Drag and drop nodes to canvas</p>
    </div>

    <div v-for="group in nodeTypes" :key="group.group" class="mb-8">
      <div class="mb-3">
        <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest">{{ group.group }}</h3>
        <p class="text-[10px] text-slate-400 font-medium">{{ group.description }}</p>
      </div>
      
      <div class="space-y-3">
        <div
          v-for="node in group.types"
          :key="node.id"
          class="flex items-start gap-4 p-3 bg-white border border-slate-200 rounded-xl cursor-grab hover:border-primary-400 hover:shadow-md hover:shadow-primary-500/5 transition-all group relative active:scale-95"
          draggable="true"
          @dragstart="onDragStart($event, node.id)"
        >
          <div class="p-2.5 bg-slate-50 rounded-lg group-hover:bg-primary-50 transition-colors">
            <component :is="node.icon" class="w-4 h-4" :class="node.color" />
          </div>
          <div class="flex-1 min-w-0">
            <span class="block text-sm font-bold text-slate-700 leading-tight mb-0.5">{{ node.label }}</span>
            <p class="text-[10px] text-slate-400 leading-normal">{{ node.desc }}</p>
          </div>
          <GripVertical class="w-3.5 h-3.5 mt-1 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  </div>
</template>
