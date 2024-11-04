<template>
  <div class="row no-wrap gap-sm border radius-sm">
    <q-list dense class="q-pa-xs radius-sm">
      <q-item v-for="(item, index) in menuItems" :key="index" clickable v-ripple
      class="radius-xs"
      :class="index === selectedParentIndex ? 'bg-primary text-white' : ''">
        <q-item-section>{{ item.title }}</q-item-section>
      </q-item>
    </q-list>
    <q-list v-if="menuItems.length > 0" dense class="q-pa-xs radius-sm">
      <q-item v-for="(item, index) in menuItems" :key="index"
      class="radius-xs">
        <q-item-section>
          <q-item-label>{{ item.title }}</q-item-label>
          <q-list dense v-for="(child, index) in item.children" :key="index">
            <q-item clickable v-ripple class="radius-xs"
            :class="index === selectedChildIndex && menuItems[selectedParentIndex].title === item.title ? 'bg-primary text-white' : ''"
            @click="selectItem(child)">
              <q-item-section>{{ child.title }}</q-item-section>
            </q-item>
          </q-list>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { inject, ref, watch, computed, onMounted, onUnmounted } from "vue";
import {i18n} from 'src/boot/i18n.js';

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
const $t = i18n.global.t;

const selectedParentIndex = ref(0);
const selectedChildIndex = ref(0);
const isRightSideActive = ref(false);

const flattenedChildren = computed(() => {
  let items = [];
  menuItems.forEach((parent, parentIndex) => {
    parent.children.forEach((child, childIndex) => {
      items.push({
        parentIndex,
        childIndex,
        item: child
      });
    });
  });
  return items;
});

const currentFlatIndex = computed(() => {
  let index = 0;
  for (let i = 0; i < selectedParentIndex.value; i++) {
    index += menuItems[i].children.length;
  }
  return index + selectedChildIndex.value;
});

const handleKeyDown = (event) => {
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    isRightSideActive.value = true;
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    isRightSideActive.value = false;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (isRightSideActive.value) {
      const currentIndex = currentFlatIndex.value;
      if (currentIndex > 0) {
        const prevItem = flattenedChildren.value[currentIndex - 1];
        selectedParentIndex.value = prevItem.parentIndex;
        selectedChildIndex.value = prevItem.childIndex;
      }
    } else {
      if (selectedParentIndex.value > 0) {
        selectedParentIndex.value--;
        selectedChildIndex.value = 0;
      }
    }
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (isRightSideActive.value) {
      const currentIndex = currentFlatIndex.value;
      if (currentIndex < flattenedChildren.value.length - 1) {
        const nextItem = flattenedChildren.value[currentIndex + 1];
        selectedParentIndex.value = nextItem.parentIndex;
        selectedChildIndex.value = nextItem.childIndex;
      }
    } else {
      if (selectedParentIndex.value < menuItems.length - 1) {
        selectedParentIndex.value++;
        selectedChildIndex.value = 0;
      }
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  selectedParentIndex.value = 0;
  selectedChildIndex.value = 0;
  isRightSideActive.value = false;
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const menuItems = props.items;

const flatItems = computed(() => {
  return menuItems.flatMap(item => item.children);
});

// 暴露 onKeyDown 方法给父组件
defineExpose({
  onKeyDown: (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const currentItem = flattenedChildren.value[currentFlatIndex.value];
      if (currentItem) {
        // 直接执行 item 中的 command 方法
        currentItem.item.command({
          editor: props.editor,
          range: props.range
        });
        return true;
      }
    }
    handleKeyDown(event);
    return true;
  }
});

// 修改 selectItem 方法
function selectItem(item) {
  if (item) {
    // 直接执行 item 的 command 方法
    item.command({
      editor: props.editor,
      range: props.range
    });
  }
}
</script>