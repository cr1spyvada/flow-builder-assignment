<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'
import { Play, CheckCircle2, XCircle, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  id: string
  data: any
  type: string
  selected?: boolean
}>()

const statusColor = computed(() => {
  switch (props.data.status) {
    case 'running': return 'border-blue-500'
    case 'success': return 'border-green-500'
    case 'error': return 'border-red-500'
    case 'skipped': return 'border-gray-300 opacity-50'
    default: return 'border-slate-200'
  }
})

const iconColor = computed(() => {
  switch (props.data.status) {
    case 'running': return 'text-blue-500'
    case 'success': return 'text-green-500'
    case 'error': return 'text-red-500'
    default: return 'text-slate-400'
  }
})
</script>

<template>
  <div 
    class="px-4 py-3 min-w-[180px] shadow-lg rounded-xl bg-white border-2 transition-all duration-200"
    :class="[statusColor, { 'ring-2 ring-primary-500 ring-offset-2': selected }]"
  >
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <slot name="icon"></slot>
        <span class="text-sm font-semibold text-slate-700">{{ data.label }}</span>
      </div>
      <div v-if="data.status && data.status !== 'idle'">
        <Loader2 v-if="data.status === 'running'" class="w-4 h-4 animate-spin text-blue-500" />
        <CheckCircle2 v-else-if="data.status === 'success'" class="w-4 h-4 text-green-500" />
        <XCircle v-else-if="data.status === 'error'" class="w-4 h-4 text-red-500" />
      </div>
    </div>
    
    <div class="text-xs text-slate-500 truncate">
      <slot name="content"></slot>
    </div>

    <Handle 
      v-if="type !== 'trigger_manual' && type !== 'trigger_webhook'"
      type="target" 
      :position="Position.Left" 
      class="!w-3 !h-3 !bg-primary-400 border-2 border-white"
    />
    <Handle 
      type="source" 
      :position="Position.Right" 
      class="!w-3 !h-3 !bg-primary-400 border-2 border-white"
    />
  </div>
</template>
