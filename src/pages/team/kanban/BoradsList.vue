<template>
  <q-list v-if="(teamStore.project && teamStore.board) || isEmpty" class="fit column no-wrap q-pa-xs">
    <template v-if="useAuths('read', ['board'])">
      <div v-if="multiple_boards || isEmpty"
        class="row no-wrap"
      >
        <BoradToggler :isEmpty />
      </div>
      <q-scroll-area v-if="useAuths('read', ['group']) && teamStore.board?.groups?.length > 0"
        class="q-space"
      >
        <VueDraggable v-model="teamStore.board.groups"
          :disabled="!$q.screen.gt.xs" :animation="300" :delay="1" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
          group="groups" handle=".dragBar" filter=".undrag"
          :preventOnFilter="false"
          chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
          class="radius-sm column gap-sm no-wrap"
          @sort="groupOrderFn()"
          @start="kanbanDraging = true"
          @end="kanbanDraging = false"
        >
          <template  v-for="element in teamStore.board?.groups" :key="element.id">
            <div class="column no-wrap">
              <div class="row no-wrap items-center hovered-item relative-position">
                <q-icon size="xs" name="mdi-pound"
                  :class="useAuths('order', ['group']) ? 'dragBar' : ''"
                />
                <span class="q-space q-px-xs q-py-sm"
                  :class="useAuths('order', ['group']) ? 'dragBar' : ''"
                >
                  {{ element.name === 'Initial_Group' ? $t(element.name) : element.name }}
                </span>
                <div class="absolute-right z-fab q-mr-xs q-py-sm hover-show transition undrag">
                  <q-btn v-if="
                      useAuths('name', ['group']) ||
                      useAuths('delete', ['group'])
                    "
                    dense flat size="sm" round icon="more_vert"
                  >
                    <q-menu class="radius-sm shadow-24">
                      <q-list dense bordered class="radius-sm q-pa-xs">
                        <q-item v-if="useAuths('name', ['group'])"
                          class="no-padding"
                        >
                          <q-input v-model="element.name"
                            dense square filled type="text"
                            class="radius-xs overflow-hidden"
                            @keyup.enter="
                              updateGroupFn(element.id, element, 'rename')
                            "
                            @keyup.ctrl.enter="
                              updateGroupFn(element.id, element, 'rename')
                            "
                          >
                            <template v-slot:append>
                              <q-btn flat round dense size="sm" icon="check" v-close-popup
                                @click="updateGroupFn(element.id, element, 'rename')"
                              />
                            </template>
                          </q-input>
                        </q-item>
                        <template v-if="useAuths('create', ['kanban'])">
                          <q-separator spaced />
                          <q-item
                            clickable
                            v-close-popup
                            class="radius-xs"
                            @click="addKanban_targetId = element.id"
                          >
                            <q-item-section side
                              ><q-icon name="mdi-plus"
                            /></q-item-section>
                            <q-item-section v-if="teamStore.kanban?.type === 'kanban'">{{ $t('new_kanban') }}</q-item-section>
                            <q-item-section v-if="teamStore.kanban?.type === 'segment'">{{ $t('new_reel') }}</q-item-section>
                            <q-item-section v-if="teamStore.kanban?.type === 'classroom'">{{ $t('new_classroom') }}</q-item-section>
                          </q-item>
                        </template>
                        <template v-if="useAuths('delete', ['group'])">
                          <q-separator spaced />
                          <q-item
                            clickable
                            v-close-popup
                            class="radius-xs"
                            @click="groupDeleteFn(element)"
                          >
                            <q-item-section side
                              ><q-icon name="remove"
                            /></q-item-section>
                            <q-item-section>{{ $t('remove_this_group')}}</q-item-section>
                          </q-item>
                        </template>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </div>
              <VueDraggable v-model="element.kanbans"
                :animation="300" :delay="1" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
                filter=".undrag" group="kanbans" handle=".dragBar"
                :preventOnFilter="false"
                chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
                class="q-py-xs radius-sm column no-wrap gap-xs q-pa-xs"
                :style="kanbanDraging ? 'min-height: 1rem;' : ''"
                @sort="updateGroupFn(element.id, element, 'order')"
                @start="kanbanDraging = true"
                @end="kanbanDraging = false"
              >
                <template v-for="kanban in element.kanbans" :key="kanban.id">
                  <KanbanListitem :kanban="kanban" class="dragBar" @enterKanban="enterKanban" @removeKanban="removeKanban" />
                </template>
                <template v-if="useAuths('create', ['kanban']) && addKanban_targetId === element.id">
                  <div class="row no-wrap items-center border radius-xs q-pa-xs undrag" draggable="false">
                    <q-input v-model="createKanba_title"
                      square filled dense autofocus type="text"
                      :placeholder="$t('kanban_name')"
                      @keyup.esc="addKanban_targetId = null"
                      @keyup.enter="kanbanCreateFn(element.id, teamStore?.navigation)"
                      @keyup.ctrl.enter="kanbanCreateFn(element.id, teamStore?.navigation)"
                      class="col border-bottom no-drag"
                    >
                      <template v-slot:append>
                        <q-btn flat round dense size="sm" icon="check"
                          @click="kanbanCreateFn(element.id, teamStore?.navigation)"
                        />
                      </template>
                    </q-input>
                  </div>
                </template>
            </VueDraggable>
            </div>
          </template>
        </VueDraggable>
        <q-input v-if="createGroup_ing"
          v-model="createGroup_name"
          dense square filled autofocus type="text"
          :placeholder="$t('new_group_name')"
          class="q-pa-xs border radius-xs"
          @keyup.enter="createGroupFn()"
          @keyup.ctrl.enter="createGroupFn()"
          @keyup.esc="createGroup_ing = false"
        >
          <template v-slot:prepend>
            <q-icon size="xs" name="tag" class="undrag" />
          </template>
          <template v-if="createGroup_name" v-slot:append>
            <q-btn flat round dense size="sm" icon="check"
              @click="createGroupFn()"
            />
          </template>
        </q-input>
      </q-scroll-area>
      <q-btn v-if="useAuths('create', ['group']) && !isEmpty"
        size="md" flat class="full-width"
        :class="
          teamStore.board?.groups?.length > 0
            ? 'border'
            : 'bg-primary text-white'
        "
        @click="createGroup_ing = !createGroup_ing"
      >
        <q-icon size="1rem" class="op-5"
          :name="createGroup_ing ? 'arrow_back_ios_new' : 'add'"
        />
        <span v-if="teamStore.board?.groups?.length === 0">{{
          createGroup_ing ? $t('new_group') : $t('cancel')
        }}</span>
      </q-btn>
    </template>
    <div v-else class="q-space flex flex-center">
      <span class="op-5">{{$t('no_premission_to_view')}}</span>
    </div>
  </q-list>
</template>

<script setup>
import { ref, watch, computed, nextTick, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import BoradToggler from "./BoradToggler.vue";
import KanbanListitem from "src/pages/team/kanban/KanbanListitem.vue";
import { VueDraggable } from 'vue-draggable-plus'
import {
  groupOrder,
  groupUpdate,
  groupDelete,
} from "src/api/strapi/project.js";
import {
  getLastKanban,
  setLastKanban,
  removeLastKanban,
  createGroup,
  createKanban,
  boards,
  board_type,
  findBoardByKanban
} from "./BoradsList.js";

import { useQuasar } from "quasar";
import {teamStore, uiStore} from 'src/hooks/global/useStore.js';
import { $team } from "src/boot/service";

import { i18n } from 'src/boot/i18n.js';

const $t = i18n.global.t;

const router = useRouter();
const route = useRoute();

const multiple_boards = computed(() =>{
  const kanban_settings = teamStore.project?.preferences?.find(i => i.name === 'kanban_settings')?.settings;
  const multiple_boards_enable = kanban_settings?.find(i => i.val === "multiple_boards")?.enable;
  const multiple_boards_by_type = $team().multipleBoardType.includes(teamStore.navigation);

  return multiple_boards_enable || multiple_boards_by_type;
});

onMounted(async() => {
  await nextTick();
  /**
   * 如果用户直接使用URL访问，此时还没有初始化store数据
   * 在这里初始化
   * teamStore.project赋值后，hook中的watchEffect会自动触发，之后本组件watch也会触发更新
   */
  if (!teamStore.project && route.params?.project_id) {
    teamStore.project = teamStore.init?.default_team?.projects?.find(i => i.id === Number(route.params?.project_id));
  }
})

const $q = useQuasar();
const loading = ref(false);
const groupOrderFn = async () => {
  await nextTick();
  let params = {
    order: teamStore.board?.groups.map((i) => i.id),
  };
  let res = await groupOrder(teamStore.project.id, teamStore.board.id, params);
  if (res) {
    return res;
  }
};
const updateGroupFn = async (group_id, element, action) => {
  await nextTick();
  let params = {
    name: element.name,
    kanbans: element.kanbans.map((i) => i.id),
  };
  let res = await groupUpdate(group_id,params);
  if (res?.data) {
    return res.data;
  }
};
const groupDeleteFn = async (element) => {
  if (element.kanbans?.length > 0) {
    $q.notify($t('cant_delete_include_kanban'));
    return;
  }
  let res = await groupDelete(element.id);
  if (res) {
    return
  }
};
const createGroup_ing = ref(false);
const createGroup_name = ref();
const createGroupFn = async () => {
  if (!createGroup_name.value || loading.value) return;
  createGroup_ing.value = false;
  loading.value = true;
  const res = await createGroup(createGroup_name.value);
  if (res) {
    loading.value = false;
    createGroup_name.value = "";
  }
};

const kanbanDraging = ref(false);
const createKanba_ing = ref(false);
const createKanba_title = ref("");
const addKanban_targetId = ref();
const kanbanCreateFn = async (group_id, type) => {
  if (!createKanba_title.value || createKanba_ing.value || !group_id) return;
  createKanba_ing.value = true;
  const res = await createKanban(group_id, createKanba_title.value, type);
  if (res) {
    createKanba_title.value = "";
    createKanba_ing.value = false;
    addKanban_targetId.value = null;
  }
};

const enterKanban = async (kanban) => {
  await setLastKanban(teamStore.project?.id, kanban, board_type.value);
  uiStore.showMainContentList = false;
  await router.push(
    `/teams/projects/${teamStore.project?.id}/${board_type.value}/${kanban?.id}`
  );
};
const removeKanban = async (kanban_id) => {
  if(kanban_id !== teamStore.kanban?.id) return
  await removeLastKanban(teamStore.project?.id, board_type.value);
  uiStore.showMainContentList = true;
  await router.push(
    `/teams/projects/${teamStore.project?.id}/${board_type.value}`
  );
};

const isEmpty = computed(() => boards.value?.length === 0);
const navigation = computed(() => teamStore.navigation);
const kanban = computed(() => teamStore.kanban);
const kanban_id_by_route = computed(() => route.params.kanban_id);
watch(
  [navigation, boards, kanban, kanban_id_by_route],
  async () => {
    await nextTick();
    if (boards.value?.length > 0) {
      if(kanban_id_by_route.value){
        teamStore.board = findBoardByKanban(kanban_id_by_route.value, teamStore.project?.boards);
      } else if(teamStore.board?.type !== navigation.value || !teamStore.board) {
        if(kanban.value){
          if(boards.value.length > 0) {
            teamStore.board = findBoardByKanban(kanban.value.id, teamStore.project?.boards);
          }
        } else {
          teamStore.board = boards.value[0];
        }
      }
    } else {
      teamStore.board = null;
      getLastKanban(teamStore.project?.id, board_type.value).then((res) => {
        if (res) {
          removeLastKanban(teamStore.project?.id, board_type.value);
        }
      });
      teamStore.kanban = null;
    }
  },{ immediate: true, deep: true }
);

watch(
  route,
  async () => {
    // 如果是通过路由直接访问的看板首页
    const autoEnterByRoute = [
      "team_kanban_homepage",
      "team_kanban_homepage",
      "team_classroom_homepage",
      "team_classroom_page",
      "team_segment_homepage",
      "team_segment_page",
    ];
    if (autoEnterByRoute?.includes(route.name) && !isEmpty.value && $q.screen.gt.xs) {
      // 获取缓存中上次看板
      const lastKanban = await getLastKanban(
        teamStore.project?.id,
        board_type.value
      );
      // 如果有缓存 进入
      if (lastKanban) {
        await enterKanban(lastKanban);
      } else {
        // 如果没有缓存 进入第一个分组中第一个看板
        const first_kanban_of_project = teamStore.board?.groups[0]?.kanbans[0];
        if (first_kanban_of_project?.id) {
          await enterKanban(first_kanban_of_project);
        }
      }
    }
  },
  { immediate: true, deep: true }
);

</script>
