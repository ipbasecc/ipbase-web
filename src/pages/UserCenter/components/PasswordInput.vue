<template>
    <q-input
      :model-value="modelValue"
      :rules="rules"
      :type="isPwd ? 'password' : 'text'"
      :label="label"
      :disable="disable"
      hide-bottom-space
      lazy-rules
        class="border radius-xs overflow-hidden"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #prepend>
        <q-icon
          name="mdi-lock-outline"
          right
        />
      </template>
      <template #append>
        <q-icon
          :name="isPwd ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          left
          @click="isPwd = !isPwd"
        />
      </template>
    </q-input>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  defineProps({
    modelValue: {
      type: String,
      required: true
    },
    rules: {
      type: Array,
      default: () => []
    },
    label: {
      type: String,
      required: true
    },
    disable: {
      type: Boolean,
      default: false
    }
  });
  
  defineEmits(['update:modelValue']);
  
  const isPwd = ref(true);
  </script>