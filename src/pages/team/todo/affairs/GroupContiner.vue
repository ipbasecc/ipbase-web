<template>
  <div class="column no-wrap gap-xs radius-xs"
    :style="columnStyle"
  >
    <div data-no-dragscroll class="column-header row no-wrap items-center q-pt-xs q-px-sm">
        <span class="dragBar q-space">{{ group.name }}</span>
        <q-btn flat dense size="sm" round icon="mdi-dots-vertical" :class="$q.screen.gt.sm ? 'undrag' : ''">
            <q-menu class="radius-sm shadow-24" ref="todogroupMenuRef">
                <GroupMenu
                    :group
                    :card
                    @cancelUpdate="cancelUpdate"
                    @todogroupDeleted="todogroupDeleted"
                />
            </q-menu>
        </q-btn>
    </div>
    <div data-no-dragscroll class="column-footer row no-wrap items-center q-px-xs"
      :class="$q.screen.gt.sm ? 'undrag' : ''"
    >
        <q-btn dense flat icon="mdi-plus" size="sm" class="border full-width" @click="toggleCreatetodo()" />
    </div>
    <q-scroll-area v-if="$q.screen.gt.sm" class="q-space q-px-xs scroll-container flex-content">
      <GroupBody v-model="group" :card ref="todogroupBodyRef" />
    </q-scroll-area>
    <div v-else class="q-space q-px-xs">
      <GroupBody v-model="group"
        ref="todogroupBodyRef"
        class="q-space q-px-xs"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs, useTemplateRef, computed } from 'vue'
import {uiStore} from 'src/hooks/global/useStore';
import GroupMenu from './GroupMenu.vue'
import { useQuasar } from 'quasar';
import GroupBody from './GroupBody.vue'

const $q = useQuasar();
const columnStyle = computed(() => {
  if($q.platform.is.mobile && !$q.screen.gt.sm) {
    return `flex: 0 0 100%;width: 100%`
  } else {
    return `flex: 0 0 ${uiStore.columnWidth}px;width: ${uiStore.columnWidth}px`
  }
})
const props = defineProps({
  group: {
    type: Object,
    required: true
  },
  card: {
    type: Object,
    required: true
  }
});
const emit = defineEmits(['todogroupDeleted']);
const { group, card } = toRefs(props);

const todogroupBodyRef = useTemplateRef('todogroupBodyRef');
const toggleCreatetodo = () => {
  console.log(todogroupBodyRef.value);
  
  todogroupBodyRef.value?.toggleCreatetodo();
}

const todogroupMenuRef = useTemplateRef('todogroupMenuRef');
const update_params = ref({
    data: {
        name: null,
    }
});
const cancelUpdate = () => {
    update_params.value = {
        data: {
            name: null,
        }
    };
    todogroupMenuRef.value?.hide();
}
const todogroupDeleted = async (_id) => {
    emit('todogroupDeleted', _id);
    cancelUpdate();
}
</script>

<style scoped>
</style>