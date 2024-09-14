<template>
  <q-list v-if="(teamStore.project && teamStore.board) || isEmpty" class="fit column no-wrap q-pa-xs">
    <template v-if="useAuths('read', ['board'], 'boardList')">
      <div v-if="multiple_boards || isEmpty || teamStore.navigation === 'classroom'"
        class="row no-wrap"
      >
        <BoradToggler :isEmpty />
      </div>
      <q-scroll-area v-if="useAuths('read', ['group']) && teamStore.board?.groups?.length > 0"
        class="q-space"
      >
        <VueDraggable v-model="teamStore.board.groups"
          :disabled="!$q.screen.gt.xs" :animation="300" :delay="1" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
          group="groups" handle=".dragBar"
          chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
          class="radius-sm column gap-sm no-wrap"
          @sort="groupOrderFn()"
          @start="kanbanDraging = true"
          @end="kanbanDraging = false"
        >
          <template  v-for="element in teamStore.board.groups" :key="element.id">
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
                <div class="absolute-right z-fab q-mr-xs q-py-sm hover-show transition">
                  <q-btn
                    v-if="
                      useAuths('name', ['group']) ||
                      useAuths('delete', ['group'])
                    "
                    dense
                    flat
                    size="sm"
                    round
                    icon="more_vert"
                  >
                    <q-menu class="radius-sm shadow-24">
                      <q-list dense bordered class="radius-sm q-pa-xs">
                        <q-item
                          v-if="useAuths('name', ['group'])"
                          class="no-padding"
                        >
                          <q-input
                            v-model="element.name"
                            dense
                            square
                            filled
                            type="text"
                            class="radius-xs overflow-hidden"
                            @keyup.enter="
                              updateGroupFn(element.id, element, 'rename')
                            "
                            @keyup.ctrl.enter="
                              updateGroupFn(element.id, element, 'rename')
                            "
                          >
                            <template v-slot:append>
                              <q-btn
                                flat
                                round
                                dense
                                size="sm"
                                icon="check"
                                v-close-popup
                                @click="
                                  updateGroupFn(element.id, element, 'rename')
                                "
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
                            <q-item-section>{{ $t('new_kanban')}}</q-item-section>
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
                filter=".undrag" group="kanbans"
                chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
                class="q-py-xs radius-sm column no-wrap gap-xs q-pa-xs"
                :style="kanbanDraging ? 'min-height: 1rem;' : ''"
                @sort="updateGroupFn(element.id, element, 'order')"
                @start="kanbanDraging = true"
                @end="kanbanDraging = false"
              >
                <template v-for="kanban in element.kanbans" :key="kanban.id">
                  <KanbanListitem :kanban="kanban" @enterKanban="enterKanban" @removeKanban="removeKanban" />
                </template>
                <template v-if="useAuths('create', ['kanban']) && addKanban_targetId === element.id">
                  <div class="row no-wrap items-center border radius-xs q-pa-xs">
                    <q-input v-model="createKanba_title"
                      square filled dense autofocus type="text"
                      :placeholder="$t('kanban_name')"
                      @keyup.esc="addKanban_targetId = null"
                      @keyup.enter="kanbanCreateFn(element.id, teamStore?.navigation)"
                      @keyup.ctrl.enter="kanbanCreateFn(element.id, teamStore?.navigation)"
                      class="col border-bottom"
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
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
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
import { deleteKanbanCache } from "src/hooks/project/useProcess.js";

import { useQuasar } from "quasar";
import {teamStore, mm_wsStore, userStore, uiStore} from 'src/hooks/global/useStore.js';

import { i18n } from 'src/boot/i18n.js';

const $t = i18n.global.t;

const router = useRouter();
const route = useRoute();

const multiple_boards = computed(
  () =>
    teamStore.project?.preferences?.enable_settings?.find(
      (i) => i.name === "multiple_boards"
    )?.enable || false
);

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
    let chat_Msg = {
      body: `${userStore.me.username}${$t('sort_kanban')}`,
      props: {
        strapi: {
          data: {
            is: "kanban_group",
            action: "sort_kanban_group",
            by_user: userStore.userId,
            board_id: teamStore.board.id,
            order: res.data,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
};
const updateGroupFn = async (group_id, element, action) => {
  await nextTick();
  let params = {
    name: element.name,
    kanbans: element.kanbans.map((i) => i.id),
  };
  let res = await groupUpdate(
    teamStore.project.id,
    teamStore.board.id,
    group_id,
    params
  );
  if (res?.data) {
    if (action === "rename") {
      let chat_Msg = {
        body: `${userStore.me.username}将项目"${teamStore.project.name}"内ID为${element.id}的看板分组名称修改为：${res.data.name}`,
        props: {
          strapi: {
            data: {
              is: "kanban_group",
              by_user: userStore.userId,
              board_id: teamStore.board.id,
              group_id: group_id,
              action: "update_kanban_group",
              body: res.data,
            },
          },
        },
      };
      await send_chat_Msg(chat_Msg);
    } else {
      let chat_Msg = {
        body: `${userStore.me.username}调整了项目"${teamStore.project.name}"内看板分组:${element.name}的看板排序`,
        props: {
          strapi: {
            data: {
              is: "kanban_group",
              by_user: userStore.userId,
              board_id: teamStore.board.id,
              group_id: group_id,
              action: "sort_kanban",
              order: res.data.kanbans.map((i) => i.id),
            },
          },
        },
      };
      await send_chat_Msg(chat_Msg);
    }
  }
};
const groupDeleteFn = async (element) => {
  if (element.kanbans?.length > 0) {
    $q.notify($t('cant_delete_include_kanban'));
    return;
  }
  let res = await groupDelete(
    teamStore.project.id,
    teamStore.board.id,
    element.id
  );
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}删除了项目"${teamStore.project.name}"内看板分组${element.name}`,
      props: {
        strapi: {
          data: {
            is: "kanban_group",
            by_user: userStore.userId,
            board_id: teamStore.board.id,
            action: "delete_kanban_group",
            body: res.data,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  } else {
    $q.notify(res.error.message);
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
  teamStore.kanban_id = kanban?.id;
  teamStore.kanban_type = kanban?.type;
  uiStore.showMainContentList = false;
  await router.push(
    `/teams/projects/${teamStore.project?.id}/${board_type.value}/${kanban?.id}`
  );
};
const removeKanban = async (kanban_id) => {
  if(kanban_id !== teamStore.kanban_id) return
  await removeLastKanban(teamStore.project?.id, board_type.value);
  teamStore.kanban_id = void 0;
  teamStore.kanban_type = void 0;
  uiStore.showMainContentList = true;
  await router.push(
    `/teams/projects/${teamStore.project?.id}/${board_type.value}`
  );
};

const isEmpty = computed(() => boards.value?.length === 0);
const navigation = computed(() => teamStore.navigation);
const kanban_id = computed(() => teamStore.kanban?.id);
watch(
  [navigation, boards, kanban_id],
  async () => {
    if (boards.value?.length > 0) {
      if(teamStore.board?.type !== navigation.value || !teamStore.board) {
        if(kanban_id.value){
          if(boards.value.length > 0) {
            await nextTick();
            const _board = await findBoardByKanban(kanban_id.value, teamStore.project?.boards);
            console.log('_board', _board);
            if(_board){
              teamStore.board = _board;
            }
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
      teamStore.kanban_id = null;
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

const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};

watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      const isCurClint = mm_wsStore?.clientId === post?.props?.clientId;
      if (isCurClint) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.is === "kanban" &&
          strapi.data.action === "kanbanUpdate"
        ) {
          teamStore.board.groups = teamStore.board.groups.map((group) => ({
            ...group,
            kanbans: group.kanbans.map((kanban) => kanban.id === strapi.data.kanban_id ? strapi.data.body : kanban)
          }))
        }
        if (
          strapi.data?.is === "kanban" &&
          strapi.data.action === "kanbanDeleted"
        ) {
          teamStore.board.groups = teamStore.board.groups.map((group) => ({
            ...group,
            kanbans: group.kanbans.filter((kanban) => kanban.id !== strapi.data.kanban_id)
          }))
          await deleteKanbanCache(strapi.data.kanban_id);
        }
        if (
          strapi.data?.is === "kanban" &&
          strapi.data.action === "kanbanCreated"
        ) {
          teamStore.board.groups = teamStore.board.groups.map((group) => ({
            ...group,
            kanbans: group.id === strapi.data.group_id ? [...group.kanbans, strapi.data.body] : group.kanbans
          }))
        }
        if (
          strapi.data?.is === "kanban_group" &&
          strapi.data?.board_id === teamStore.board.id &&
          strapi.data.action === "sort_kanban_group"
        ) {
          teamStore.board.groups = strapi.data.order.map((i) =>
            teamStore.board.groups.find((g) => g.id === i)
          );
        }
        if (
          strapi.data?.is === "kanban_group" &&
          strapi.data?.board_id === teamStore.board.id &&
          strapi.data.action === "update_kanban_group"
        ) {
          teamStore.board.groups = teamStore.board.groups.map(group => group.id === strapi.data.group_id ? strapi.data.body : group);
        }
        if (
          strapi.data?.is === "kanban_group" &&
          strapi.data?.board_id === teamStore.board.id &&
          strapi.data.action === "sort_kanban"
        ) {
          // 拖拽排序可能在分组间进行，因此先要提取全部kanbans，在排序时从全部中抽取条目组成新数组赋值
          let all_kanbans = teamStore.board.groups
            .map((k) => k.kanbans)
            .flat(2);
          teamStore.board.groups = teamStore.board.groups.map(group => ({
            ...group,
            kanbans: group.id === strapi.data.group_id ? strapi.data.order.map((i) =>
              all_kanbans.find((k) => k.id === i)
            ) : group.kanbans
          }))
        }
        if (
          strapi.data?.is === "kanban_group" &&
          strapi.data?.board_id === teamStore.board.id &&
          strapi.data.action === "kanban_group_created"
        ) {
          let group_of_created = strapi.data.body;
          group_of_created.kanbans = [];
          // console.log(group_of_created);
          teamStore.board.groups.push(group_of_created);
        }
        if (
          strapi.data?.is === "kanban_group" &&
          strapi.data?.board_id === teamStore.board.id &&
          strapi.data.action === "delete_kanban_group"
        ) {
          teamStore.board.groups = teamStore.board.groups.filter((group) => group.id !== strapi.data.body.id );
        }
      }
    }
  },
  { immediate: false, deep: true }
);
</script>
