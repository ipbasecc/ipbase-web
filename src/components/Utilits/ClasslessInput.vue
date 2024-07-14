<template>
  <!-- 需要解决自动聚焦问题，用户点击后，光标自动聚焦开始输入 -->
  <div
    :contenteditable="editable"
    ref="classlessInput"
    style="writing-mode: lr"
    :class="`${props.baseClass} ${editable ? props.activeClass : ''}`"
    :autofocus="autofocus"
    @keydown.esc="cancelChange()"
    @keydown.ctrl.enter.stop="ctrlEnter()"
    @keydown.shift.enter.stop="shiftEnter()"
    @paste="handlePaste"
  >
    {{ inputValue }}
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, toRefs, watch } from "vue";
import { onClickOutside } from "@vueuse/core";
import { removeHtmlTags } from "src/hooks/utilits.js";
import {uiStore} from 'src/hooks/global/useStore';

const props = defineProps({
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
  todogroup: {
    type: Object,
    default: void 0,
  },
});

const emit = defineEmits(["update", "cannel", "ctrlEnter", "shiftEnter"]);
const { autofocus, todogroup } = toRefs(props);

const model = defineModel();
const editable = ref(props.auth);

const inputValue = ref();
const source_txt = ref();

const classlessInput = ref(null);

onMounted(() => {
  // disable shortcut or you can't input '/'
  uiStore.disable_shortcut = true
  inputValue.value = model.value;
  source_txt.value = model.value;
  if (autofocus.value) {
    document.activeElement.blur();
    classlessInput.value.focus();
  }
});
watch(
  model,
  () => {
    if (model.value) {
      model.value = removeHtmlTags(model.value);
    }
  },
  { immediate: true, deep: true }
);

// 按下win键时会触发blur，因此这里不使用默认方法触发blur
// 改用 onClickOutside
const blur = () => {
  model.value = classlessInput.value?.innerText;
  // editable.value = false;
  emit("update");
  model.value = "";
};
onClickOutside(classlessInput, () => {
  if (!classlessInput.value.innerText) {
    emit("cannel");
  } else {
    blur();
  }
});

onUnmounted(() => {
  if (classlessInput.value?.innerText) {
    blur();
  }
  uiStore.disable_shortcut = false
});
const ctrlEnter = () => {
  model.value = classlessInput.value?.innerText;
  // editable.value = false;
  emit("ctrlEnter");
  model.value = "";
};
const shiftEnter = () => {
  model.value = classlessInput.value?.innerText;
  // editable.value = false;
  emit("shiftEnter");
  model.value = "";
};

const cancelChange = () => {
  // editable.value = false;
  model.value = "";
  // inputValue.value = source_txt.value; // 此处修改后UI并没有更新，因此增加下方一行
  // classlessInput.value.innerText = source_txt.value;
  emit("cannel");
};

const handlePaste = (event) => {
  event.preventDefault();
  inputValue.value = (event.clipboardData || window.clipboardData).getData("text");
};
</script>
