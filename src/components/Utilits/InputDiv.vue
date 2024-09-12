<template>
  <div
    ref="editableDiv"
    :contenteditable="auth"
    :class="`${baseClass} ${auth ? activeClass : ''}`"
    @input="updateValue"
    @keydown.esc="ESC"
    @keydown.ctrl.enter.stop="emit('ctrlEnter')"
    @keydown.shift.enter.stop="emit('shiftEnter')"
    @paste="handlePaste"
    @blur="emit('ctrlEnter')"
    @focus="handleFocus"
  ></div>
</template>

<script setup>
import {defineModel, onMounted, useTemplateRef, nextTick} from 'vue';
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

const emit = defineEmits(["ctrlEnter", "shiftEnter", "ESC", "onFocus"]);
const ESC = () => {
  modelValue.value = '';
  emit('ESC')
};
const handleFocus = () => {
  emit('onFocus');
}

const handlePaste = async (event) => {
  event.preventDefault();
  try {
    const text = await navigator.clipboard.readText();
    event.target.innerText = removeHtmlTags(text);
    modelValue.value = removeHtmlTags(text);
  } catch (err) {
    console.error('Failed to read clipboard contents: ', err);
    const text = (event.clipboardData || window.clipboardData).getData('text/plain');
    modelValue.value = removeHtmlTags(text);
  }
  await nextTick(); // 确保 DOM 更新
};
</script>