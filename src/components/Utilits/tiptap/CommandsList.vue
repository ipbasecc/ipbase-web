<template>
  <q-list v-if="items.length > 0" bordered class="q-pa-xs radius-sm">
    <q-item v-for="(item, index) in items" :key="index" clickable v-ripple
    class="radius-xs"
    :class="index === selectedIndex ? 'bg-primary text-white' : ''"
    @click="selectItem(index)">
      <q-item-section avatar>
        <LoadingCircle v-if="item.title === 'Continue writing' && isLoading" />
        <component v-else :is="item.icon" size="18" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ item.title }}</q-item-label>
        <q-item-label caption lines="2">{{ item.description }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import { inject, ref, watch } from "vue";
import LoadingCircle from "./icons/loadingCircle.vue";
import { useCompletion } from "ai/vue";
import { getPrevText } from "./lib/editor.js";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  command: {
    type: Function,
    required: true,
  },
  editor: {
    type: Object,
    required: true,
  },
  range: {
    type: Object,
    required: true,
  },
});

const selectedIndex = ref(0);

const { complete, isLoading } = useCompletion({
  id: "novel-vue",
  api: inject('completionApi'),
  onResponse: (_) => {
    props.editor.chain().focus().deleteRange(props.range).run();
  },
  onFinish: (_prompt, completion) => {
    // highlight the generated text
    props.editor.commands.setTextSelection({
      from: props.range.from,
      to: props.range.from + completion.length,
    });
  },
  onError: (e) => {
    console.error(e);
  },
});

const commandListContainer = ref();

const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"];
function onKeyDown(e) {
  if (navigationKeys.includes(e.key)) {
    e.preventDefault();
    if (e.key === "ArrowUp") {
      selectedIndex.value =
        (selectedIndex.value + props.items.length - 1) % props.items.length;
      scrollToSelected();
      return true;
    }
    if (e.key === "ArrowDown") {
      selectedIndex.value = (selectedIndex.value + 1) % props.items.length;
      scrollToSelected();
      return true;
    }
    if (e.key === "Enter") {
      selectItem(selectedIndex.value);
      return true;
    }
    return false;
  }
}

watch(
  () => props.items,
  () => {
    selectedIndex.value = 0;
  }
);

defineExpose({
  onKeyDown,
});

function selectItem(index) {
  const item = props.items[index];

  if (item) {
    if (item.title === "Continue writing") {
      if (isLoading.value) return;
      complete(
        getPrevText(props.editor, {
          chars: 5000,
          offset: 1,
        })
      );
    } else {
      props.command(item);
    }
  }
}

function updateScrollView(container, item) {
  const containerHeight = container.offsetHeight;
  const itemHeight = item ? item.offsetHeight : 0;

  const top = item.offsetTop;
  const bottom = top + itemHeight;

  if (top < container.scrollTop) {
    container.scrollTop -= container.scrollTop - top + 5;
  } else if (bottom > containerHeight + container.scrollTop) {
    container.scrollTop += bottom - containerHeight - container.scrollTop + 5;
  }
}

function scrollToSelected() {
  const container = commandListContainer.value;
  const item = container?.children[selectedIndex.value];

  if (container && item) {
    updateScrollView(container, item);
  }
}
</script>