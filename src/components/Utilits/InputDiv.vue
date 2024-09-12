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

// const handlePaste = async (event) => {
//   event.preventDefault();
//   try {
//     const text = await navigator.clipboard.readText();
//     event.target.innerText = removeHtmlTags(text);
//     modelValue.value = removeHtmlTags(text);
//   } catch (err) {
//     console.error('Failed to read clipboard contents: ', err);
//     const text = (event.clipboardData || window.clipboardData).getData('text/plain');
//     modelValue.value = removeHtmlTags(text);
//   }
//   await nextTick(); // 确保 DOM 更新
// };
const handlePaste = async (event) => {
  event.preventDefault();
  try {
    const text = await navigator.clipboard.readText();
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return; // 如果没有选择区域，则不执行

    const selectedRange = selection.getRangeAt(0);
    const startNode = selectedRange.startContainer;
    const startOffset = selectedRange.startOffset;

    // 创建一个span元素来临时存放粘贴的文本
    const span = document.createElement('span');
    span.textContent = removeHtmlTags(text); // 清理粘贴的文本

    // 插入span元素到文本节点中
    selectedRange.deleteContents(); // 删除当前选中的内容
    selectedRange.insertNode(span); // 插入span

    // 移动光标到span元素后面
    selectedRange.setStartAfter(span);
    selectedRange.setEndAfter(span);
    selection.removeAllRanges(); // 清除所有选择
    selection.addRange(selectedRange); // 添加新的选择区域

    // 更新modelValue
    modelValue.value = editableDiv.value.innerText;
  } catch (err) {
    console.error('Failed to read clipboard contents: ', err);
    const text = (event.clipboardData || window.clipboardData).getData('text/plain');
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return; // 如果没有选择区域，则不执行

    const selectedRange = selection.getRangeAt(0);
    const startNode = selectedRange.startContainer;
    const startOffset = selectedRange.startOffset;

    // 创建一个span元素来临时存放粘贴的文本
    const span = document.createElement('span');
    span.textContent = removeHtmlTags(text); // 清理粘贴的文本

    // 插入span元素到文本节点中
    selectedRange.deleteContents(); // 删除当前选中的内容
    selectedRange.insertNode(span); // 插入span

    // 移动光标到span元素后面
    selectedRange.setStartAfter(span);
    selectedRange.setEndAfter(span);
    selection.removeAllRanges(); // 清除所有选择
    selection.addRange(selectedRange); // 添加新的选择区域

    // 更新modelValue
    modelValue.value = editableDiv.value.innerText;
  }
};
</script>