<script setup lang="ts">
import BaseNode from './BaseNode.vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { GitBranch as BranchIcon, Code2 as TransformIcon } from 'lucide-vue-next'

defineProps<NodeProps>()
</script>

<template>
  <div 
    class="px-4 py-3 min-w-[200px] shadow-lg rounded-xl bg-white border-2 transition-all duration-200"
    :class="[
      data.status === 'success' ? 'border-green-500' : 'border-slate-200',
      { 'ring-2 ring-primary-500 ring-offset-2': selected }
    ]"
  >
    <div class="flex items-center gap-2 mb-2">
      <BranchIcon v-if="type === 'logic_condition'" class="w-4 h-4 text-purple-500" />
      <TransformIcon v-else class="w-4 h-4 text-orange-500" />
      <span class="text-sm font-semibold text-slate-700">{{ data.label }}</span>
    </div>

    <div class="text-xs text-slate-500">
      {{ type === 'logic_condition' ? 'Conditional Branch' : 'Data Transformation' }}
    </div>

    <!-- Inputs -->
    <Handle type="target" :position="Position.Left" class="!w-3 !h-3 !bg-primary-400 border-2 border-white" />

    <!-- Outputs -->
    <template v-if="type === 'logic_condition'">
      <div class="mt-4 flex flex-col gap-2">
        <div class="flex items-center justify-end gap-2 relative h-6">
          <span class="text-[10px] font-bold text-green-600 uppercase pr-2">True</span>
          <Handle 
            id="true"
            type="source" 
            :position="Position.Right" 
            class="!w-3 !h-3 !bg-green-500 border-2 border-white !top-1/2"
          />
        </div>
        <div class="flex items-center justify-end gap-2 relative h-6">
          <span class="text-[10px] font-bold text-red-600 uppercase pr-2">False</span>
          <Handle 
            id="false"
            type="source" 
            :position="Position.Right" 
            class="!w-3 !h-3 !bg-red-500 border-2 border-white !top-1/2"
          />
        </div>
      </div>
    </template>
    <template v-else>
      <Handle 
        type="source" 
        :position="Position.Right" 
        class="!w-3 !h-3 !bg-primary-400 border-2 border-white"
      />
    </template>
  </div>
</template>
