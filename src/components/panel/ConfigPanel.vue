<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { Schemas } from '@/utils/schemas'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { X, Save, Trash2, Info } from 'lucide-vue-next'

const store = useWorkflowStore()
const selectedNode = computed(() => store.nodes.find(n => n.id === store.selectedNodeId))

const schema = computed(() => {
  if (!selectedNode.value?.type) return null
  return Schemas[selectedNode.value.type] || null
})

const { values, errors, handleSubmit, resetForm, meta, setFieldValue } = useForm({
  validationSchema: schema.value ? toTypedSchema(schema.value) : undefined,
  initialValues: JSON.parse(JSON.stringify(selectedNode.value?.data?.config || {}))
})

const onSubmit = handleSubmit((formValues) => {
  console.log('Submitting form values:', formValues)
  if (selectedNode.value) {
    const config = JSON.parse(JSON.stringify(formValues))
    console.log('Updating node:', selectedNode.value.id, 'with config:', config)
    store.updateNodeData(selectedNode.value.id, { config })
    store.selectNode(null)
  }
})

const removeNode = () => {
  if (selectedNode.value) {
    store.removeNode(selectedNode.value.id)
    store.selectNode(null)
  }
}

// Helpers for dynamic fields
const fields = computed(() => {
  if (!selectedNode.value?.type) return []
  const type = selectedNode.value.type
  
  if (type === 'action_http') {
    return [
      { name: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com' },
      { name: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
      { name: 'headers', label: 'Headers (JSON)', type: 'textarea' },
      { name: 'body', label: 'Body', type: 'textarea' },
    ]
  }
  if (type === 'action_email') {
    return [
      { name: 'to', label: 'Recipient Email', type: 'email' },
      { name: 'subject', label: 'Subject', type: 'text' },
      { name: 'body', label: 'Message Body', type: 'textarea' },
    ]
  }
  if (type === 'action_sms') {
    return [
      { name: 'phone', label: 'Phone Number', type: 'tel' },
      { name: 'message', label: 'SMS Message', type: 'textarea' },
    ]
  }
  if (type === 'logic_condition') {
    return [
      { name: 'field', label: 'Field to Check', type: 'text' },
      { name: 'operator', label: 'Operator', type: 'select', options: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than'] },
      { name: 'value', label: 'Comparison Value', type: 'text' },
    ]
  }
  if (type === 'logic_transform') {
    return [
      { name: 'script', label: 'Transformation Script (JS)', type: 'textarea', placeholder: 'return input.data.map(item => item.id);' },
    ]
  }
  return []
})
</script>

<template>
  <div 
    v-if="selectedNode"
    :key="selectedNode.id"
    class="fixed top-0 right-0 w-96 h-screen bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col animate-in slide-in-from-right duration-300"
  >
    <!-- Header -->
    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
      <div v-if="selectedNode && selectedNode.data">
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-slate-800 text-lg">{{ selectedNode.data.label }}</h3>
          <span class="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-mono">{{ selectedNode.id.split('-')[0] }}...</span>
        </div>
        <p class="text-xs text-slate-500 uppercase font-semibold tracking-wider">{{ selectedNode.type }}</p>
      </div>
      <button @click="store.selectNode(null)" class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- General Settings -->
      <div class="space-y-4">
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest">General Settings</label>
        <div class="space-y-1">
          <label class="block text-sm font-semibold text-slate-700">Node Name</label>
          <input 
            :value="selectedNode.data.label"
            @input="e => store.updateNodeData(selectedNode!.id, { label: (e.target as HTMLInputElement).value })"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all text-sm font-medium"
            placeholder="e.g. Welcome Email"
          />
        </div>
      </div>

      <div class="h-px bg-slate-100"></div>

      <div v-if="fields.length > 0" class="space-y-4">
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest">Configuration</label>
        <div v-for="field in fields" :key="field.name" class="space-y-1">
          <label :for="field.name" class="block text-sm font-semibold text-slate-700">
            {{ field.label }}
          </label>
          
          <input 
            v-if="field.type !== 'textarea' && field.type !== 'select'"
            :id="field.name"
            :value="values[field.name]"
            @input="e => setFieldValue(field.name, (e.target as HTMLInputElement).value)"
            :type="field.type"
            :placeholder="field.placeholder"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all text-sm"
            :class="errors[field.name] ? 'border-red-500 bg-red-50' : 'border-slate-300'"
          />

          <select 
            v-else-if="field.type === 'select'"
            :value="values[field.name]"
            @change="e => setFieldValue(field.name, (e.target as HTMLSelectElement).value)"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all text-sm bg-white"
          >
            <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <textarea 
            v-else
            :value="values[field.name]"
            @input="e => setFieldValue(field.name, (e.target as HTMLTextAreaElement).value)"
            :rows="4"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all text-sm"
            :placeholder="field.placeholder"
            :class="errors[field.name] ? 'border-red-500 bg-red-50' : 'border-slate-300'"
          ></textarea>

          <p v-if="errors[field.name]" class="text-xs text-red-500 font-medium mt-1">
            {{ errors[field.name] }}
          </p>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-50">
        <div class="p-4 bg-slate-100 rounded-full">
          <Info class="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-700">No configuration needed</p>
          <p class="text-xs text-slate-500">This node type doesn't require extra settings.</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
      <button 
        @click="onSubmit"
        :disabled="!!(!meta.valid && schema)"
        class="w-full h-11 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
      >
        <Save class="w-4 h-4" />
        Save Configuration
      </button>
      
      <button 
        @click="removeNode"
        class="w-full h-11 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
      >
        <Trash2 class="w-4 h-4" />
        Delete Node
      </button>
    </div>
  </div>
</template>
