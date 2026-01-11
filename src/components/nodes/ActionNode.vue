<script setup lang="ts">
import BaseNode from './BaseNode.vue'
import { Send, Mail, MessageSquare } from 'lucide-vue-next'
import { type NodeProps } from '@vue-flow/core'

defineProps<NodeProps>()
</script>

<template>
  <BaseNode :id="id" :data="data" :type="type" :selected="selected">
    <template #icon>
      <Send v-if="type === 'action_http'" class="w-4 h-4 text-emerald-500" />
      <Mail v-else-if="type === 'action_email'" class="w-4 h-4 text-indigo-500" />
      <MessageSquare v-else class="w-4 h-4 text-cyan-500" />
    </template>
    <template #content>
      {{ data.config.url || data.config.to || 'Not configured' }}
    </template>
  </BaseNode>
</template>
