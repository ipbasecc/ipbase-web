<template>
  <q-list v-if="projectStore.project" class="fit column no-wrap q-pa-sm">
    <template v-if="calc_auth('board', 'read', 'project')">
      <div v-if="multiple_boards" class="row no-wrap">
        <BoradToggler />
      </div>
      <q-scroll-area
        class="q-space"
        v-if="calc_auth('group', 'read', 'project')"
      >
        <draggable
          :list="projectStore.board?.groups"
          animation="300"
          :delay="30"
          :fallbackTolerance="2"
          :force-fallback="true"
          :fallbackOnBody="true"
          :item-key="(key) => key"
          :sort="true"
          :touchStartThreshold="2"
          :scroll="true"
          ghost-class="ghostColumn"
          chosen-class="chosenGroupClass"
          drag-class="dragClass"
          handle=".dragBar"
          group="groups"
          class="radius-sm column gap-sm no-warp"
          @change="groupOrderFn()"
        >
          <template #item="{ element }">
            <div class="column no-wrap q-px-sm">
              <div class="row no-wrap items-center hovered-item">
                <q-icon
                  size="sm"
                  name="tag"
                  :class="
                    calc_auth('group', 'order', 'project') ? 'dragBar' : ''
                  "
                />
                <span
                  class="q-space q-pa-sm"
                  :class="
                    calc_auth('group', 'order', 'project') ? 'dragBar' : ''
                  "
                >
                  {{ element.name }}
                </span>
                <q-btn
                  v-if="
                    calc_auth('group', 'name', 'project') ||
                    calc_auth('group', 'delete', 'project')
                  "
                  class="hover-show transition"
                  dense
                  flat
                  size="sm"
                  round
                  icon="more_vert"
                >
                  <q-menu class="radius-sm shadow-24" ref="more_vert_menu">
                    <q-list dense bordered class="radius-sm q-pa-xs">
                      <q-item
                        v-if="calc_auth('group', 'name', 'project')"
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
                              @click="
                                updateGroupFn(element.id, element, 'rename')
                              "
                            />
                          </template>
                        </q-input>
                      </q-item>
                      <template v-if="calc_auth('group', 'delete', 'project')">
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
                          <q-item-section>移除此分组</q-item-section>
                        </q-item>
                      </template>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
              <draggable
                :list="element.kanbans"
                animation="300"
                :delay="30"
                :fallbackTolerance="2"
                :force-fallback="true"
                :fallbackOnBody="true"
                :item-key="(key) => key"
                :sort="true"
                :touchStartThreshold="2"
                :scroll="true"
                ghost-class="ghostColumn"
                chosen-class="chosenGroupClass"
                drag-class="dragClass"
                handle=".dragBar"
                filter=".undrag"
                group="kanbans"
                class="q-py-xs radius-sm column no-warp gap-xs q-pa-xs"
                :style="kanbanDraging ? 'min-height: 1rem;' : ''"
                @change="updateGroupFn(element.id, element, 'order')"
                @start="kanbanDraging = true"
                @end="kanbanDraging = false"
              >
                <template #item="{ element: kanban }">
                  <KanbanListitem :kanban="kanban" />
                </template>
                <template
                  #footer
                  v-if="calc_auth('kanban', 'create', 'project')"
                >
                  <div
                    v-if="!addKanban_targetId"
                    class="hovered-item radius-xs q-pa-xs kanban-item border-placeholder"
                  >
                    <div
                      class="row no-wrap gap-sm items-center q-px-xs indicator transition"
                      @click="addKanban_targetId = element.id"
                    >
                      <q-icon
                        name="add"
                        size="xs"
                        class="undrag cursor-pointer"
                      ></q-icon>
                      <span class="hover-show transition cursor-pointer"
                        >新看板</span
                      >
                    </div>
                  </div>
                  <div
                    v-if="addKanban_targetId === element.id"
                    class="row no-wrap items-center border radius-xs q-pa-xs"
                  >
                    <q-input
                      v-model="createKanba_title"
                      square
                      filled
                      dense
                      autofocus
                      type="text"
                      placeholder="看板名称"
                      @keyup.esc="addKanban_targetId = null"
                      @keyup.enter="
                        kanbanCreateFn(element.id, createKanba_type)
                      "
                      @keyup.ctrl.enter="
                        kanbanCreateFn(element.id, createKanba_type)
                      "
                      class="col border-bottom"
                    >
                      <template v-slot:append>
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="check"
                          @click="kanbanCreateFn(element.id, createKanba_type)"
                        />
                      </template>
                    </q-input>
                  </div>
                </template>
              </draggable>
            </div>
          </template>
        </draggable>
        <q-input
          v-if="createGroup_ing"
          v-model="createGroup_name"
          dense
          square
          filled
          autofocus
          type="text"
          placeholder="新分组名称"
          class="q-pa-xs border radius-xs"
          @keyup.enter="createGroupFn()"
          @keyup.ctrl.enter="createGroupFn()"
          @keyup.esc="createGroup_ing = false"
        >
          <template v-slot:prepend>
            <q-icon size="xs" name="tag" class="undrag" />
          </template>
          <template v-if="createGroup_name" v-slot:append>
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="check"
              @click="createGroupFn()"
            />
          </template>
        </q-input>
      </q-scroll-area>
      <div v-else class="q-space flex flex-center">
        <span class="op-5">您没有查看此处内容的权限</span>
      </div>
      <q-btn
        v-if="calc_auth('group', 'create', 'project')"
        size="md"
        flat
        class="full-width"
        :class="
          projectStore.board?.groups?.length > 0
            ? 'border'
            : 'bg-primary text-white'
        "
        @click="createGroup_ing = !createGroup_ing"
      >
        <q-icon
          size="1rem"
          class="op-5"
          :name="createGroup_ing ? 'arrow_back_ios_new' : 'add'"
        />
        <span v-if="projectStore.board?.groups?.length === 0">{{
          createGroup_ing ? "新建分组" : "取消"
        }}</span>
      </q-btn>
    </template>
    <div v-else class="q-space flex flex-center">
      <span class="op-5">您没有查看此处内容的权限</span>
    </div>
  </q-list>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import BoradToggler from "src/pages/Project/components/project/widgets/BoradToggler.vue";
import KanbanListitem from "src/pages/Project/components/project/KanbanListitem.vue";
import draggable from "vuedraggable";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
import {
  groupCreate,
  groupOrder,
  groupUpdate,
  groupDelete,
  kanbanCreate,
} from "src/api/strapi/project.js";
import { deleteKanbanCache } from "src/hooks/project/useProcess.js";

import { useQuasar } from "quasar";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import useMmws from "src/stores/mmws.js";

const projectStore = useProjectStore();
const multiple_boards = computed(
  () =>
    projectStore.project?.preferences?.enable_settings?.find(
      (i) => i.name === "multiple_boards"
    )?.enable || false
);
watch(
  projectStore,
  () => {
    if (projectStore.project && !projectStore.board) {
      projectStore.board = projectStore.project.boards[0];
    }
  },
  { immediate: true, deep: true }
);
const userStore = useUserStore();

const more_vert_menu = ref(null);

const $q = useQuasar();
const loading = ref(false);
const groupOrderFn = async () => {
  let params = {
    order: projectStore.board?.groups.map((i) => i.id),
  };
  let res = await groupOrder(
    projectStore.project.id,
    projectStore.board.id,
    params
  );
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}调整了看板分组的排序`,
      props: {
        strapi: {
          data: {
            is: "kanban_group",
            action: "sort_kanban_group",
            by_user: userStore.userId,
            board_id: projectStore.board.id,
            action: "sort_kanban_group",
            order: res.data,
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
  }
};
const updateGroupFn = async (group_id, element, action) => {
  let params = {
    name: element.name,
    kanbans: element.kanbans.map((i) => i.id),
  };
  let res = await groupUpdate(
    projectStore.project.id,
    projectStore.board.id,
    group_id,
    params
  );
  if (res?.data) {
    if (action === "rename") {
      let chat_Msg = {
        body: `${userStore.me.username}将项目"${projectStore.project.name}"内ID为${element.id}的看板分组名称修改为：${res.data.name}`,
        props: {
          strapi: {
            data: {
              is: "kanban_group",
              by_user: userStore.userId,
              board_id: projectStore.board.id,
              group_id: group_id,
              action: "update_kanban_group",
              body: res.data,
            },
          },
        },
      };
      send_chat_Msg(chat_Msg);
    } else {
      let chat_Msg = {
        body: `${userStore.me.username}调整了项目"${projectStore.project.name}"内看板分组:${element.name}的看板排序`,
        props: {
          strapi: {
            data: {
              is: "kanban_group",
              by_user: userStore.userId,
              board_id: projectStore.board.id,
              group_id: group_id,
              action: "sort_kanban",
              order: res.data.kanbans.map((i) => i.id),
            },
          },
        },
      };
      send_chat_Msg(chat_Msg);
    }

    more_vert_menu.value.hide();
    return;
  }
};
const groupDeleteFn = async (element) => {
  if (element.kanbans?.length > 0) {
    $q.notify("不能删除包含看板的分组");
    return;
  }
  let res = await groupDelete(
    projectStore.project.id,
    projectStore.board.id,
    element.id
  );
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}删除了项目"${projectStore.project.name}"内看板分组${element.name}`,
      props: {
        strapi: {
          data: {
            is: "kanban_group",
            by_user: userStore.userId,
            board_id: projectStore.board.id,
            action: "delete_kanban_group",
            body: res.data,
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
    more_vert_menu.value.hide();
  } else {
    $q.notify(res.error.message);
    more_vert_menu.value.hide();
  }
};
const createGroup_ing = ref(false);
const createGroup_name = ref();
const createGroupFn = async () => {
  if (!createGroup_name.value || loading.value) return;
  createGroup_ing.value = false;
  loading.value = true;
  let params = {
    project_id: projectStore.project.id,
    board_id: projectStore.board.id,
    name: createGroup_name.value,
  };
  let res = await groupCreate(params);
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}在项目"${projectStore.project.name}"内新建了看板分组：${res.data.name}`,
      props: {
        strapi: {
          data: {
            is: "kanban_group",
            by_user: userStore.userId,
            board_id: projectStore.board.id,
            action: "kanban_group_created",
            body: res.data,
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
    loading.value = false;
    createGroup_name.value = "";
    more_vert_menu.value.hide();
  }
};

const kanbanDraging = ref(false);
const createKanba_ing = ref(false);
const createKanba_title = ref("");
const createKanba_type = ref("kanban");
const addKanban_targetId = ref();
const kanbanCreateFn = async (group_id, type) => {
  if (!createKanba_title.value || createKanba_ing.value) return;
  createKanba_ing.value = true;
  let params = {
    title: createKanba_title.value,
    type: type,
  };
  let res = await kanbanCreate(projectStore.project.id, group_id, params);
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}在项目"${projectStore.project.name}"内新建了看板：${res.data.title}`,
      props: {
        strapi: {
          data: {
            is: "kanban",
            by_user: userStore.userId,
            group_id: group_id,
            action: "kanbanCreated",
            body: res.data,
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
    createKanba_title.value = "";
    createKanba_type.value = "kanban";
    createKanba_ing.value = false;
    addKanban_targetId.value = null;
  }
};
const send_chat_Msg = async (MsgContent) => {
  send_MattersMsg(MsgContent);
};

// 查找board下的所有看板，找到与修改看板id相同项，之后用新数据替换
function replaceKanban(arr, obj) {
  // 遍历arr数组
  for (let i = 0; i < arr.length; i++) {
    // 获取当前元素的kanbans属性，它是一个数组
    let kanbans = arr[i].kanbans;
    // 遍历kanbans数组
    for (let j = 0; j < kanbans.length; j++) {
      // 获取当前元素的id属性，它是一个字符串
      let id = kanbans[j].id;
      // 如果id和obj的id相同，说明找到了要替换的条目
      if (id === obj.id) {
        // 用obj替换当前元素
        kanbans[j] = obj;
        // 结束循环，不再继续查找
        break;
      }
    }
  }
}
// 查找board下的所有看板，找到与修改看板id相同项，之后删除
function deleteKanban(arr, kanban_id) {
  // 遍历arr数组
  for (let i = 0; i < arr.length; i++) {
    // 获取当前元素的kanbans属性，它是一个数组
    let kanbans = arr[i].kanbans;
    // 遍历kanbans数组
    for (let j = 0; j < kanbans.length; j++) {
      // 获取当前元素的id属性，它是一个字符串
      let id = kanbans[j].id;
      // 如果id和obj的id相同，说明找到了要删除的条目
      if (id === kanban_id) {
        // 用splice方法删除当前元素，第一个参数是要删除的索引，第二个参数是要删除的个数
        kanbans.splice(j, 1);
        // 结束循环，不再继续查找
        break;
      }
    }
  }
}
function pushKanban(arr, group_id, data) {
  for (let j = 0; j < arr.length; j++) {
    let id = arr[j].id;
    if (id === group_id) {
      if (arr[j].kanbans?.length > 0) {
        arr[j].kanbans.push(data);
      } else {
        arr[j].kanbans = [data];
      }
    }
  }
}
const mm_wsStore = useMmws();
watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event == "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.is === "kanban" &&
          strapi.data.action === "kanbanUpdate"
        ) {
          let kanbans_in_allgroup_ids = projectStore.board.groups
            .map((group) => group.kanbans)
            .flat(2)
            .map((k) => k.id);
          if (kanbans_in_allgroup_ids.includes(strapi.data.kanban_id)) {
            let arr = projectStore.board.groups;
            let obj = strapi.data.body;
            replaceKanban(arr, obj);
            projectStore.board.groups = arr;
          }
        }
        if (
          strapi.data?.is === "kanban" &&
          strapi.data.action === "kanbanDeleted"
        ) {
          let kanbans_in_allgroup_ids = projectStore.board.groups
            .map((group) => group.kanbans)
            .flat(2)
            .map((k) => k.id);
          if (kanbans_in_allgroup_ids.includes(strapi.data.kanban_id)) {
            let arr = projectStore.board.groups;
            let kanban_id = strapi.data.kanban_id;
            deleteKanban(arr, kanban_id);
            projectStore.board.groups = arr;
          }
          await deleteKanbanCache(strapi.data.kanban_id);
        }
        if (
          strapi.data?.is === "kanban" &&
          strapi.data.action === "kanbanCreated"
        ) {
          console.log("kanbanCreated");
          let allgroup_ids = projectStore.board.groups.map((group) => group.id);
          if (allgroup_ids.includes(strapi.data.group_id)) {
            pushKanban(
              projectStore.board.groups,
              strapi.data.group_id,
              strapi.data.body
            );
          }
        }
        if (
          strapi.data?.is === "kanban_group" &&
          strapi.data?.board_id === projectStore.board.id &&
          strapi.data.action === "sort_kanban_group"
        ) {
          projectStore.board.groups = strapi.data.order.map((i) =>
            projectStore.board.groups.find((g) => g.id === i)
          );
        }
        if (
          strapi.data?.is === "kanban_group" &&
          strapi.data?.board_id === projectStore.board.id &&
          strapi.data.action === "update_kanban_group"
        ) {
          function isSameId(element) {
            return element.id === strapi.data.group_id;
          }
          const index = projectStore.board.groups.findIndex(isSameId);
          if (index !== -1) {
            projectStore.board.groups[index] = strapi.data.body;
          }
        }
        if (
          strapi.data?.is === "kanban_group" &&
          strapi.data?.board_id === projectStore.board.id &&
          strapi.data.action === "sort_kanban"
        ) {
          // 拖拽排序可能在分组间进行，因此先要提取全部kanbans，在排序时从全部中抽取条目组成新数组赋值
          let all_kanbans = projectStore.board.groups
            .map((k) => k.kanbans)
            .flat(2);
          function isSameId(element) {
            return element.id === strapi.data.group_id;
          }
          const index = projectStore.board.groups.findIndex(isSameId);
          if (index !== -1) {
            projectStore.board.groups[index].kanbans = strapi.data.order.map(
              (i) => all_kanbans.find((k) => k.id === i)
            );
          }
        }
        if (
          strapi.data?.is === "kanban_group" &&
          strapi.data?.board_id === projectStore.board.id &&
          strapi.data.action === "kanban_group_created"
        ) {
          let group_of_created = strapi.data.body;
          group_of_created.kanbans = [];
          // console.log(group_of_created);
          projectStore.board.groups.push(group_of_created);
        }
        if (
          strapi.data?.is === "kanban_group" &&
          strapi.data?.board_id === projectStore.board.id &&
          strapi.data.action === "delete_kanban_group"
        ) {
          // 定义一个条件函数，判断元素的id是否与obj的id相同
          function isSameId(element) {
            return element.id == strapi.data.body.id;
          }
          // 使用findIndex()方法找到arr中满足条件的元素的索引
          const index = projectStore.board.groups.findIndex(isSameId);
          // 如果找到了，就使用splice()方法替换该元素
          if (index !== -1) {
            projectStore.board.groups.splice(index, 1);
          }
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
.kanban-item:hover {
  border: 1px solid #333;
}
</style>
