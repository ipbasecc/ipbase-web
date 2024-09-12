<template>
  <!-- 需要解决自动聚焦问题，用户点击后，光标自动聚焦开始输入 -->
    <div
      :contenteditable="editable"
      ref="classlessInput"
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
