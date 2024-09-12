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
</script>
