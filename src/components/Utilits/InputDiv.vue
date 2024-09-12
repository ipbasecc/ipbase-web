<template>
  <div
    ref="editableDiv"
    :contenteditable="auth"
    v-mutation="handler"
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
import {ref, onMounted, useTemplateRef} from 'vue';
import {removeHtmlTags} from "src/hooks/utilits.js";
import { onKeyStroke } from "@vueuse/core";

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
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return; // 如果没有选择区域，则不执行

    const selectedRange = selection.getRangeAt(0);
    const startNode = selectedRange.startContainer;
    const startOffset = selectedRange.startOffset;
    const endNode = selectedRange.endContainer;
    const endOffset = selectedRange.endOffset;

    // 删除当前选中的内容
    selectedRange.deleteContents();

    // 创建一个文本节点来存放粘贴的文本
    const textNode = document.createTextNode(removeHtmlTags(text));
    selectedRange.insertNode(textNode);

    // 移动光标到粘贴文本之后
    selectedRange.setStartAfter(textNode);
    selectedRange.setEndAfter(textNode);

    // 更新选择区域
    selection.removeAllRanges();
    selection.addRange(selectedRange);

    // 更新modelValue
    modelValue.value = editableDiv.value.innerText;
  } catch (err) {
    console.error('Failed to read clipboard contents: ', err);
    // 兼容旧浏览器的粘贴操作
    const text = (event.clipboardData || window.clipboardData).getData('text/plain');
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return; // 如果没有选择区域，则不执行

    const selectedRange = selection.getRangeAt(0);
    const startNode = selectedRange.startContainer;
    const startOffset = selectedRange.startOffset;
    const endNode = selectedRange.endContainer;
    const endOffset = selectedRange.endOffset;

    // 删除当前选中的内容
    selectedRange.deleteContents();

    // 创建一个文本节点来存放粘贴的文本
    const textNode = document.createTextNode(removeHtmlTags(text));
    selectedRange.insertNode(textNode);

    // 移动光标到粘贴文本之后
    selectedRange.setStartAfter(textNode);
    selectedRange.setEndAfter(textNode);

    // 更新选择区域
    selection.removeAllRanges();
    selection.addRange(selectedRange);

    // 更新modelValue
    modelValue.value = editableDiv.value.innerText;
  }
};
const maxStack = ref(100)
const undoStack = ref([])
const redoStack = ref([])
const undoBlocked = ref(false)

function checkStack (stack) {
  if (stack.length > maxStack.value) {
    stack.splice(maxStack.value)
  }
}

function clearStack (stack) {
  stack.splice(0)
}

function undo() {
  if (undoStack.value.length > 0) {
    const data = undoStack.value.shift();
    if (data !== void 0) {
      undoBlocked.value = true;
      editableDiv.value.innerText = data;
      modelValue.value = data;
      moveCursorToEnd()
    }
  }
};


function redo () {
  // shift the stack
  const data = redoStack.value.shift()
  if (data !== void 0) {
    // unblock undo from receiving redo data
    undoBlocked.value = false
    editableDiv.value.innerText = data
  }
};
function moveCursorToEnd() {
  const _editableDiv = editableDiv.value; // 获取输入框的DOM元素
  if (_editableDiv) {
    const range = document.createRange(); // 创建一个新的Range对象
    const selection = window.getSelection(); // 获取当前的选择对象

    range.selectNodeContents(_editableDiv); // 选择输入框内的所有内容
    range.collapse(false); // 折叠Range到末尾

    selection.removeAllRanges(); // 移除当前的所有选择范围
    selection.addRange(range); // 添加新的Range到选择中
  }
}

function handler(mutationRecords) {
  mutationRecords.forEach(record => {
    if (record.type === 'characterData') {
      undoStack.value.unshift(record.oldValue);
      checkStack(undoStack.value);
      clearStack(redoStack.value);
    }
    else if (record.type === 'childList') {
      record.removedNodes.forEach(node => {
        if (undoBlocked.value === false) {
          undoStack.value.unshift(node.textContent);
        } else {
          redoStack.value.unshift(node.textContent);
        }
      });
      checkStack(undoStack.value);
      checkStack(redoStack.value);
      undoBlocked.value = false;
    }
  });
}

// 修改onKeyStroke监听器，添加saveSelection调用
onKeyStroke(["ctrlKey", "z"], (e) => {
  e.preventDefault();
  undo();
});
</script>