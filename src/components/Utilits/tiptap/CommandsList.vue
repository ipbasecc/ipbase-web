<template>
  <q-card bordered class="row no-wrap gap-sm q-pa-xs">
    <q-list dense class="q-pa-xs radius-sm">
      <q-item v-for="(item, index) in items" :key="index" clickable v-ripple
      class="radius-xs"
      :class="index === selectedParentIndex ? 
        (!isRightSideActive ? 'bg-primary text-white' : 'border-xs border-dashed') : ''">
        <q-item-section side class="q-pl-sm">
          <q-icon :name="item.icon" size="xs" />
        </q-item-section>
        <q-item-section class="q-pr-lg">{{ $t(item.title) }}</q-item-section>
      </q-item>
    </q-list>
    <div class="column no-wrap" style="height: 400px;">
      <q-input 
        v-model="searchQuery" 
        dense
        outlined
        ref="searchInput"
        class="q-mb-sm"
        placeholder="Search..."
        @keydown="handleInputKeydown"
      />
      <q-scroll-area
        ref="scrollArea"
        :thumb-style="{ right: '2px', width: '4px', opacity: 0.75 }"
        class="q-space"
      >
        <q-list v-if="filteredItems.length > 0" dense class="q-pa-xs radius-sm">
          <template v-for="(category, categoryIndex) in items" :key="categoryIndex">
            <q-separator v-if="categoryIndex > 0" spaced class="op-5"/>
            <template v-for="(child, childIndex) in category.children" :key="`${categoryIndex}-${childIndex}`">
              <q-item 
                ref="menuItems"
                clickable 
                v-ripple 
                class="radius-xs"
                :class="isItemSelected(categoryIndex, childIndex) ? 
                  (isRightSideActive ? 'bg-primary text-white' : 'border-xs border-dashed') : ''"
                @click="selectFilteredItem(child)"
              >
                <q-item-section side>
                  <component :is="child.icon" size="18" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ child.title }}</q-item-label>
                  <q-item-label caption lines="2">{{ child.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </template>
        </q-list>
      </q-scroll-area>
    </div>
</q-card>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from "vue";

// Props 定义
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

// 基础状态
const selectedParentIndex = ref(0);
const selectedFilteredIndex = ref(0);
const isRightSideActive = ref(true);
const searchQuery = ref('');
const searchInput = ref(null);

// 事件发射器
const emit = defineEmits(['filter', 'close']);

// 计算属性
const filteredItems = computed(() => {
  if (!searchQuery.value) {
    return props.items[selectedParentIndex.value]?.children || [];
  }
  
  const query = searchQuery.value.toLowerCase();
  const results = [];
  
  props.items.forEach(category => {
    category.children.forEach(item => {
      if (
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        (item.searchTerms &&
          item.searchTerms.some(term => term.toLowerCase().includes(query)))
      ) {
        results.push(item);
      }
    });
  });
  
  return results;
});

const currentSelection = computed(() => {
  let currentIndex = 0;
  let foundParent = 0;
  let foundChild = 0;

  for (let i = 0; i < props.items.length; i++) {
    const childrenCount = props.items[i].children.length;
    if (currentIndex + childrenCount > selectedFilteredIndex.value) {
      foundParent = i;
      foundChild = selectedFilteredIndex.value - currentIndex;
      break;
    }
    currentIndex += childrenCount;
  }

  return {
    parentIndex: foundParent,
    childIndex: foundChild
  };
});

// 事件处理函数
function onKeyDown(event) {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (isRightSideActive.value) {
      // 右侧选择：不循环，到底部就停止
      const totalItems = props.items.reduce((sum, item) => sum + item.children.length, 0);
      if (selectedFilteredIndex.value < totalItems - 1) {
        selectedFilteredIndex.value++;
      }
    } else {
      // 左侧选择：保持循环
      selectedParentIndex.value = (selectedParentIndex.value + 1) % props.items.length;
      selectedFilteredIndex.value = props.items.slice(0, selectedParentIndex.value)
        .reduce((sum, item) => sum + item.children.length, 0);
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (isRightSideActive.value) {
      // 右侧选择：不循环，到顶部就停止
      if (selectedFilteredIndex.value > 0) {
        selectedFilteredIndex.value--;
      }
    } else {
      // 左侧选择：保持循环
      selectedParentIndex.value = (selectedParentIndex.value - 1 + props.items.length) % props.items.length;
      selectedFilteredIndex.value = props.items.slice(0, selectedParentIndex.value)
        .reduce((sum, item) => sum + item.children.length, 0);
    }
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    isRightSideActive.value = false;
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    isRightSideActive.value = true;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const { parentIndex, childIndex } = currentSelection.value;
    const selectedItem = props.items[parentIndex].children[childIndex];
    if (selectedItem) {
      props.command(selectedItem);
    }
  }
}

function handleInputKeydown(event) {
  const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'];
  
  if (event.key === 'Escape') {
    emit('close');
    event.preventDefault();
    return;
  }
  
  if (navigationKeys.includes(event.key)) {
    event.preventDefault();
    onKeyDown(event);
  }
}

function selectFilteredItem(item) {
  if (item) {
    props.command(item);
  }
}

function isItemSelected(categoryIndex, childIndex) {
  let currentIndex = 0;
  for (let i = 0; i < categoryIndex; i++) {
    currentIndex += props.items[i].children.length;
  }
  currentIndex += childIndex;
  return currentIndex === selectedFilteredIndex.value;
}

// 监听器
watch(searchQuery, (newValue) => {
  selectedFilteredIndex.value = 0;
  emit('filter', newValue);
});

watch(() => currentSelection.value, (newSelection) => {
  selectedParentIndex.value = newSelection.parentIndex;
}, { immediate: true });

watch(() => props.items, () => {
  selectedParentIndex.value = 0;
  selectedFilteredIndex.value = 0;
  isRightSideActive.value = true;
}, { immediate: true });

// 生命周期钩子
onMounted(() => {
  nextTick(() => {
    searchInput.value?.focus();
  });
});

// 添加对滚动区域和菜单项的引用
const scrollArea = ref(null);
const menuItems = ref([]);

// 滚动到选中项
const scrollToSelected = () => {
  nextTick(() => {
    let currentIndex = 0;
    
    for (let i = 0; i < props.items.length; i++) {
      for (let j = 0; j < props.items[i].children.length; j++) {
        if (currentIndex === selectedFilteredIndex.value) {
          const element = menuItems.value[currentIndex]?.$el;
          
          if (element && scrollArea.value) {
            if (!isRightSideActive.value) {
              // 左侧选择：滚动到顶部
              scrollArea.value.setScrollPosition('vertical', element.offsetTop, 0);
            } else {
              // 右侧选择：检查是否需要滚动
              const container = scrollArea.value.$el;
              const containerRect = container.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();
              
              // 向下选择时：检查元素底部是否超出可视区域
              if (elementRect.bottom > containerRect.bottom) {
                // 计算需要滚动的位置，使元素底部对齐容器底部
                const newScrollTop = element.offsetTop + element.offsetHeight - container.clientHeight;
                scrollArea.value.setScrollPosition('vertical', newScrollTop, 300);
              }
              // 向上选择时：检查元素顶部是否在可视区域之上
              else if (elementRect.top < containerRect.top) {
                // 滚动到元素顶部对齐容器顶部
                scrollArea.value.setScrollPosition('vertical', element.offsetTop, 300);
              }
              // 如果元素在可视区域内，不进行滚动
            }
          }
          return;
        }
        currentIndex++;
      }
    }
  });
};

// 监听选中项和活动侧变化
watch([selectedFilteredIndex, selectedParentIndex, isRightSideActive], () => {
  scrollToSelected();
});

// 暴露方法
defineExpose({
  onKeyDown,
  scrollToSelected,
});
</script>

<style scoped>
.q-scroll-area {
  border-radius: 4px;
}
</style>