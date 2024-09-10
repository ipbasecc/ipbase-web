<template>
  <div
      ref="editableDiv"
      :contenteditable="auth"
      :autofocus="autofocus"
      :class="`${baseClass} ${auth ? activeClass : ''}`"
      @input="updateValue"
      @keydown.esc="ESC"
      @keydown.ctrl.enter.stop="emit('ctrlEnter')"
      @keydown.shift.enter.stop="emit('shiftEnter')"
      @paste="handlePaste"
      @blur="emit('ctrlEnter')"
  ></div>
</template>

<script setup>
import {defineModel, onMounted, useTemplateRef} from 'vue';
import {removeHtmlTags} from "src/hooks/utilits.js";

const { baseClass, activeClass, auth, autofocus } = defineProps({
  baseClass: {
    type: String,
    default: "q-pa-xs",
  },
  activeClass: {
    type: String,
    default: "",
  },
  auth: {
    type: Boolean,
    default: false,
  },
  autofocus: {
    type: Boolean,
    default: false,
  }
});
const editableDiv = useTemplateRef('editableDiv')
// 定义一个 v-model 绑定的变量
const modelValue = defineModel();

// 更新父组件的值
const updateValue = (event) => {
  modelValue.value = event.target.innerText;
};
// 在组件挂载后聚焦
onMounted(() => {
  if(autofocus){
    editableDiv.value?.focus();
  }
});

const emit = defineEmits(["ctrlEnter", "shiftEnter", "ESC"]);
const ESC = () => {
  modelValue.value = '';
  emit('ESC')
};
const handlePaste = (event) => {
  event.preventDefault();
  const pasteVal = (event.clipboardData || window.clipboardData).getData("text")
  modelValue.value = removeHtmlTags(pasteVal);
};
</script>