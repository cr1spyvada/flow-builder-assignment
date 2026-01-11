<script setup lang="ts">
import BaseNode from './BaseNode.vue'
import { Zap, Globe } from 'lucide-vue-next'
import { type NodeProps } from '@vue-flow/core'

defineProps<NodeProps>()
</script>

<template>
  <BaseNode :id="id" :data="data" :type="type" :selected="selected">
    <template #icon>
      <Zap v-if="type === 'trigger_manual'" class="w-4 h-4 text-amber-500" />
      <Globe v-else class="w-4 h-4 text-blue-500" />
    </template>
    <template #content>
      {{ type === 'trigger_manual' ? 'Trigger manually' : 'Webhook listener' }}
    </template>
  </BaseNode>
</template>
