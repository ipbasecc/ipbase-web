<template>
  <div class="column no-wrap gap-xs radius-xs" :style="columnStyle">
    <div data-no-dragscroll class="column-header row no-wrap items-center q-px-sm todogroup-root"
      :class="dense ? '' : 'q-pt-xs'">
      <span class="dragBar q-space">{{ group.name }}</span>
      <q-btn dense round flat icon="mdi-plus" size="sm" class="undrag todogroup-btn transition"
        @click="toggleCreatetodo()" />
      <q-btn flat dense size="sm" round icon="mdi-dots-vertical" class="todogroup-btn transition"
        :class="$q.screen.gt.sm ? 'undrag' : ''">
        <q-menu class="radius-sm shadow-24" ref="todogroupMenuRef">
          <GroupMenu :group :card :_for @todogroupUpdated="todogroupUpdated" @cancelUpdate="cancelUpdate" @todogroupDeleted="todogroupDeleted" />
        </q-menu>
      </q-btn>
    </div>
    <div v-if="!dense" data-no-dragscroll class="column-footer row no-wrap items-center q-px-xs"
      :class="$q.screen.gt.sm ? 'undrag' : ''">
      <q-btn dense flat icon="mdi-plus" size="sm" class="border full-width" @click="toggleCreatetodo()" />
    </div>
    <q-scroll-area v-if="layout === 'row'" class="q-space q-px-xs scroll-container flex-content">
      <GroupBody v-model="group" :card :displayType :uiOptions ref="todogroupBodyRef" :_for />
      <div v-if="$q.screen.gt.sm" data-dragscroll class="q-space op-0" style="order: 9999"
        @mouseenter="uiStore.dragKanbanScrollEnable = true" @dblclick="toggleCreatetodo()"
        @keydown.esc="toggleCreatetodo()"></div>
    </q-scroll-area>
    <GroupBody v-else v-model="group" ref="todogroupBodyRef" class="q-px-xs" :displayType :dense :card :uiOptions :_for />
  </div>
</template>

<script setup>
  import { ref, toRefs, useTemplateRef, computed, onMounted } from "vue";
  import { uiStore } from "src/hooks/global/useStore";
  import GroupMenu from "./GroupMenu.vue";
  import { useQuasar } from "quasar";
  import GroupBody from "./GroupBody.vue";

  const $q = useQuasar();
  const props = defineProps({
    group: {
      type: Object,
      required: true,
    },
    card: {
      type: Object,
      required: true,
    },
    _for: {
      type: String,
    },
    layout: {
      type: String,
    },
    displayType: {
      type: String,
    },
    dense: {
      type: Boolean,
    },
    uiOptions: {
      type: Object,
      required: true,
    },
  });
  const emit = defineEmits(["todogroupDeleted"]);
  const { group, card, _for, layout, displayType, dense, uiOptions } =
    toRefs(props);

  const columnStyle = computed(() => {
    if (layout.value === "column") {
      return `width: 100%`;
    } else {
      return `flex: 0 0 ${uiStore.columnWidth}px;width: ${uiStore.columnWidth}px`;
    }
  });

  const todogroupBodyRef = useTemplateRef("todogroupBodyRef");
  const toggleCreatetodo = () => {
    todogroupBodyRef.value?.toggleCreatetodo();
  };

  const todogroupMenuRef = useTemplateRef("todogroupMenuRef");
  const todogroupUpdated = (val) => {
    console.log('todogroupUpdated', val);
    
    group.value = val;
  };
  const cancelUpdate = () => {
    todogroupMenuRef.value?.hide();
  };
  const todogroupDeleted = async (_id) => {
    emit("todogroupDeleted", _id);
    cancelUpdate();
  };
</script>

<style scoped>
.todogroup-root .todogroup-btn{
  opacity: 0;
}
.todogroup-root:hover .todogroup-btn{
  opacity: 1;
}
</style>
