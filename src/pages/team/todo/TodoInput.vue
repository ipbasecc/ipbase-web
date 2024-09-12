<template>
  <!-- 需要解决自动聚焦问题，用户点击后，光标自动聚焦开始输入 -->
    <div
      :contenteditable="editable"
      ref="classlessInput"
      v-mutation="handler"
      style="writing-mode: lr;cursor: text"
      :class="`${props.baseClass} ${editable ? props.activeClass : ''}`"
      :autofocus="autofocus"
      @focus="handleFocus"
      @blur="onBlur"
      @keydown.esc="cancelChange()"
      @keydown.ctrl.enter="ctrlEnter()"
      @paste="handlePaste"
    >
      {{ content }}
      <slot />
    </div>
</template>

<script setup>
import {ref, onMounted, toRefs, watchEffect} from 'vue';
import { removeHtmlTags } from "src/hooks/utilits.js";
import {uiStore} from 'src/hooks/global/useStore';
import { onKeyStroke } from "@vueuse/core";

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
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
  },
});

const emit = defineEmits(["update", "cannel", "ctrlEnter", "onFocus", "onBlur"]);
const { autofocus, content, auth } = toRefs(props);

const editable = ref();
watchEffect(() => {
  if(uiStore.isShared){
    editable.value = false
  } else {
    editable.value = auth.value
  }
})
const handleFocus = () => {
  emit('onFocus');
  isEmmit.value = false
}

const inputValue = ref();
const source_txt = ref();

const classlessInput = ref(null);

onMounted(() => {
  inputValue.value = content.value;
  source_txt.value = content.value;
  if (autofocus.value) {
    document.activeElement.blur();
    classlessInput.value.focus();
  }
});
// 按下win键时会触发blur，因此这里不使用默认方法触发blur
// 改用 onClickOutside
// onClickOutside(classlessInput, () => blur())
const isEmmit = ref(false);
const onBlur = async () => {
  if(isEmmit.value) return
  isEmmit.value = true
  emit("onBlur", classlessInput.value?.textContent.trim());
};

const ctrlEnter = async () => {
  if(isEmmit.value) return
  isEmmit.value = true
  emit("ctrlEnter", classlessInput.value?.textContent.trim());
};

const cancelChange = () => {
  inputValue.value = source_txt.value;
  emit("cannel");
};

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

    // 更新inputValue
    inputValue.value = classlessInput.value.innerText;
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

    // 更新inputValue
    inputValue.value = classlessInput.value.innerText;
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
      classlessInput.value.innerText = data;
      inputValue.value = data;
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
    classlessInput.value.innerText = data
  }
};
function moveCursorToEnd() {
  const _classlessInput = classlessInput.value; // 获取输入框的DOM元素
  if (_classlessInput) {
    const range = document.createRange(); // 创建一个新的Range对象
    const selection = window.getSelection(); // 获取当前的选择对象

    range.selectNodeContents(_classlessInput); // 选择输入框内的所有内容
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
