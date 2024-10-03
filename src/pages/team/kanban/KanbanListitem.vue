<template>
  <q-list dense>
    <q-item
        v-if="kanbanRef"
        class="hovered-item radius-xs q-pa-xs"
        :class="`
        ${isActived ? 'border active-sublistitem' : `op-6 ${!teamStore.dropKanbanID ? 'border-placeholder' : ''}`}
        ${useAuths('order', ['kanban']) && $q.screen.gt.xs ? ' dragBar' : ''}
        ${teamStore.dropKanbanID === kanbanRef.id ? 'border border-dashed' : ''}
      `"
        clickable
        v-ripple
        @click.stop="enterKanban(kanbanRef)">
      <q-item-section>{{ kanbanRef.title === 'Initial_Kanban' ? $t(kanbanRef.title) : kanbanRef.title }}</q-item-section>
      <q-item-section side class="absolute-right z-fab q-mr-xs"
        @mouseenter="unEnter = true"
        @mouseleave="unEnter = false"
      >
        <q-btn
          v-if="
            useAuths('title', ['kanban']) ||
            useAuths('delete', ['kanban'])
          "
            dense
            size="sm"
            flat
            round
            icon="more_vert"
            class="hover-show transition undrag cursor-pointer"
        >
          <q-menu class="radius-sm shadow-24">
            <q-list
                dense
                bordered
                class="radius-sm q-pa-xs"
                style="max-width: 202px"
            >
            <template v-if="useAuths('title', ['kanban'])">
              <q-item class="no-padding">
                <q-input
                    v-model="params.data.title"
                    dense
                    square
                    filled
                    type="text"
                    :placeholder="$t('kanban_name')"
                    class="radius-xs overflow-hidden"
                    @keyup.enter="updateKanbanFn(kanbanRef.id)"
                    @keyup.ctrl.enter="updateKanbanFn(kanbanRef.id)"
                    @keydown.esc="params.data.title = null"
                >
                  <template v-slot:append>
                    <q-btn
                        flat
                        round
                        dense
                        size="sm"
                        icon="check"
                        @click="updateKanbanFn(kanbanRef.id)"
                    />
                  </template>
                </q-input>
              </q-item>
              <q-separator spaced />
              <q-item class="justify-center font-large">
                <div class="grid-container">
                  <div v-for="i in uiStore.emojis"
                    :key="i"
                    class="grid-item cursor-pointer"
                    @click="toggleEmoji(i)"
                  >
                    <span v-if="i" class="flex flex-center">{{ i }}</span>
                    <q-btn v-else dense size="sm" flat round icon="close" />
                  </div>
                  <q-space />
                </div>
              </q-item>
            </template>
              <template v-if="useAuths('delete', ['kanban'])">
                <q-separator spaced />
                <q-item
                    clickable
                    v-close-popup
                    class="radius-xs"
                    @click="deleteKanbanFn(kanbanRef.id)"
                >
                  <q-item-section side><q-icon name="remove" /></q-item-section>
                  <q-item-section>{{ $t('remove_this_kanban') }}</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import { computed, ref, toRef } from "vue";
import { kanbanUpdate, kanbanDelete } from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";

import { userStore, teamStore, uiStore } from "src/hooks/global/useStore.js";

const props = defineProps({
  kanban: {
    type: Object,
    default() {
      return {};
    },
  },
});

const emit = defineEmits(["enterKanban", "removeKanban"]);
const kanbanRef = toRef(props, "kanban");
const isActived = computed(
  () =>
    teamStore.kanban?.id === kanbanRef.value?.id
);
const unEnter = ref(false)
const enterKanban = (kanban) => {
  if(unEnter.value) return
  if(uiStore.split_kanban_active === 'right'){
    teamStore.dropKanbanID = Number(kanban.id);
  } else {
    emit("enterKanban", kanban);
  }
};

const params = ref({
  project_id: teamStore.project.id,
  kanban_id: kanbanRef.value.id,
  data: {
    title: kanbanRef.value.title,
  },
});
const toggleEmoji = (i) => {
  let str = params.value.data.title;
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  str = str.replace(emojiRegex, "");

  if (i !== "") {
    params.value.data.title = i + " " + str;
  } else {
    params.value.data.title = str;
  }
  updateKanbanFn(kanbanRef.value?.id);
};
const updateKanbanFn = async (kanban_id) => {
  let res = await kanbanUpdate(kanban_id, params.value);
  if (res?.data) {
    
  }
};

const deleteKanbanFn = async (kanban_id) => {
  let res = await kanbanDelete(teamStore.project?.id, kanban_id);
  if (res) {
    
  }
};

</script>

<style lang="scss" scoped>
.indicator {
  border-left: 0 solid #00000000;
}
.indicator.active {
  border-left: 5px solid #0e5bff;
}
.shadow-indicator {
  -webkit-box-shadow: 0 0 42px -9px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0 0 42px -9px rgba(0, 0, 0, 0.75);
  box-shadow: 0 0 42px -9px rgba(0, 0, 0, 0.75);
}
.emoji {
  border: 1px solid #00000000;
  margin: 2px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 创建4列 */
  grid-gap: 10px; /* 网格间距 */
}

.grid-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
</style>
