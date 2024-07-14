<template>
  <q-btn v-if="projectStore" flat no-caps class="full-width" padding="sm">
    <div class="row no-warp items-center full-width">
      <div class="q-space">
        <span class="float-left"
          >workspace: {{ projectStore.board?.name }}</span
        >
      </div>
      <q-icon size="xs" name="unfold_more" />
    </div>
    <q-menu
      fit
      cover
      anchor="top left"
      transition-show="jump-up"
      transition-hide="jump-down"
      class="shadow-24 radius-sm"
    >
      <q-list bordered dense class="radius-sm q-pa-xs">
        <draggable
          :list="projectStore.project?.boards"
          animation="300"
          :delay="30"
          :fallbackTolerance="2"
          :force-fallback="true"
          :fallbackOnBody="true"
          :item-key="(key) => key"
          :sort="true"
          :touchStartThreshold="2"
          :scroll="true"
          handle=".dragBar"
          ghost-class="ghostColumn"
          chosen-class="chosenGroupClass"
          drag-class="dragClass"
          group="boards"
          class="q-py-xs radius-sm column gap-sm no-warp q-pa-xs"
          @change="dragBoard_sort"
        >
          <template #item="{ element }">
            <div
              class="row no-wrap gap-sm items-center radius-xs border q-py-sm q-pl-md q-pr-sm hovered-item"
            >
              <q-icon
                name="task_alt"
                :class="calc_auth('board', 'order', 'project') ? 'dragBar' : ''"
              />
              <span
                class="q-space cursor-pointer"
                @click="changeBoard(element)"
                v-close-popup
                >{{ element.name }}</span
              >
              <q-btn
                v-if="
                  calc_auth('board', 'name', 'project') ||
                  calc_auth('board', 'delete', 'project')
                "
                dense
                size="sm"
                round
                flat
                icon="more_vert"
                class="hover-show transition"
              >
                <q-menu class="radius-sm shadow-24">
                  <q-list dense bordered class="radius-sm q-pa-xs">
                    <q-item
                      class="no-padding"
                      v-if="calc_auth('board', 'name', 'project')"
                    >
                      <q-input
                        v-model="rename_text"
                        dense
                        square
                        filled
                        type="text"
                        placeholder="工作空间名称"
                        class="radius-xs overflow-hidden"
                        @keyup.enter="updateBoardFn(element.id)"
                        @keyup.ctrl.enter="updateBoardFn(element.id)"
                        @keydown.esc="rename_text = null"
                      >
                        <template v-slot:append>
                          <q-btn
                            flat
                            round
                            dense
                            size="sm"
                            icon="check"
                            @click="updateBoardFn(element.id)"
                          />
                        </template>
                      </q-input>
                    </q-item>
                    <template v-if="calc_auth('board', 'delete', 'project')">
                      <q-separator spaced />
                      <q-item
                        clickable
                        v-close-popup
                        class="radius-xs"
                        @click="deleteBoardFn(element.id)"
                      >
                        <q-item-section side
                          ><q-icon name="remove"
                        /></q-item-section>
                        <q-item-section>移除工作空间</q-item-section>
                      </q-item>
                    </template>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </template>
        </draggable>
        <template v-if="calc_auth('board', 'create', 'project')">
          <q-separator spaced />
          <q-item
            v-if="!create_board_ing"
            clickable
            class="radius-xs"
            @click="create_board_ing = true"
          >
            <q-item-section side>
              <q-icon name="add_circle" />
            </q-item-section>
            <q-item-section>新工作空间</q-item-section>
          </q-item>
          <q-item v-else class="radius-xs no-padding">
            <q-item-section class="q-pa-xs">
              <q-input
                v-model="create_name"
                type="text"
                dense
                square
                filled
                placeholder="工作空间名称"
                @keyup.enter="createBoardFn()"
                @keyup.ctrl.enter="createBoardFn()"
                @keydown.esc="create_name = null"
              >
                <template v-slot:append>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="add"
                    @click="createBoardFn"
                  />
                </template>
              </q-input>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import {
  updateProject,
  createBoard,
  updateBoard,
  deleteBoard,
} from "src/api/strapi/project.js";
import { useRouter } from "vue-router";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import useMmws from "src/stores/mmws.js";
import draggable from "vuedraggable";
const projectStore = useProjectStore();
const userStore = useUserStore();
const mm_wsStore = useMmws();
const router = useRouter();

const multiple_boards = computed(
  () =>
    projectStore.project?.preferences?.find(
      (i) => i.name === "multiple_boards"
    ) || null
);
const create_board_ing = ref(false);
const create_name = ref("");

const createBoardFn = async () => {
  let params = {
    project_id: projectStore.project.id,
    name: create_name.value,
  };
  let res = await createBoard(params);
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}在项目"${projectStore.project.name}"内新建了工作空间: ${res.data.name}`,
      props: {
        strapi: {
          data: {
            is: "board",
            by_user: userStore.userId,
            project_id: projectStore.project.id,
            action: "board_created",
            body: res.data,
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
    create_board_ing.value = false;
    projectStore.board = res.data;
  }
};
const deleteBoardFn = async (board_id) => {
  let res = await deleteBoard(projectStore.project.id, board_id);
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}删除了项目"${projectStore.project.name}"内ID为${board_id}的工作空间`,
      props: {
        strapi: {
          data: {
            is: "board",
            by_user: userStore.userId,
            project_id: projectStore.project.id,
            action: "board_deleted",
            body: res.data,
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
    // 定义一个条件函数，判断元素的id是否与obj的id相同
    function isSameId(element) {
      return element.id == board_id;
    }
    // 使用findIndex()方法找到arr中满足条件的元素的索引
    var index = projectStore.project.boards.findIndex(isSameId);
    // 如果找到了，就使用splice()方法替换该元素
    if (index != -1) {
      projectStore.project.boards.splice(index, 1);
    }
    projectStore.board = projectStore.project.boards[0];
  }
};
const dragBoard_sort = async () => {
  let params = {
    boards: projectStore.project.boards.map((i) => i.id),
  };
  let res = await updateProject(projectStore.project.id, params);
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}修改了项目"${projectStore.project.name}"工作空间的排序`,
      props: {
        strapi: {
          data: {
            is: "board",
            by_user: userStore.userId,
            project_id: res.data.id,
            action: "sortBoard",
            order: res.data.boards.map((i) => i.id),
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
  }
};

const changeBoard = (val) => {
  // console.log(val);
  projectStore.board = val;
  projectStore.kanban = null;
  router.push(`/projects/${projectStore.project?.id}`);
};

const rename_text = ref("");
const updateBoardFn = async (board_id) => {
  let params = {
    name: rename_text.value,
  };
  let res = await updateBoard(projectStore.project.id, board_id, params);
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}将项目"${projectStore.project.name}"内ID为${board_id}的工作空间的名称修改为：${params.name}`,
      props: {
        strapi: {
          data: {
            is: "board",
            by_user: userStore.userId,
            project_id: projectStore.project.id,
            board_id: res.data.id,
            action: "update_borad",
            body: res.data,
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
  }
};

const send_chat_Msg = async (MsgContent) => {
  send_MattersMsg(MsgContent);
};

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
          strapi.data?.is === "board" &&
          strapi.data?.project_id === projectStore.project.id &&
          strapi.data.action === "sortBoard"
        ) {
          projectStore.project.boards = strapi.data.order.map((i) =>
            projectStore.project.boards.find((b) => b.id === i)
          );
        }
        if (
          strapi.data?.is === "board" &&
          strapi.data?.project_id === projectStore.project.id &&
          strapi.data.action === "board_created"
        ) {
          console.log("new board");
          projectStore.project.boards.push(strapi.data.body);
        }
        if (
          strapi.data?.is === "board" &&
          strapi.data?.project_id === projectStore.project.id &&
          strapi.data.action === "board_deleted"
        ) {
          projectStore.project.boards = projectStore.project.boards.filter(
            (i) => i.id != strapi.data.body.id
          );
        }
        if (
          strapi.data?.is === "board" &&
          strapi.data?.project_id === projectStore.project.id &&
          strapi.data.action === "update_borad"
        ) {
          // 定义一个条件函数，判断元素的id是否与obj的id相同
          function isSameId(element) {
            return element.id == strapi.data.board_id;
          }
          // 使用findIndex()方法找到arr中满足条件的元素的索引
          var index = projectStore.project.boards.findIndex(isSameId);
          // 如果找到了，就使用splice()方法替换该元素
          if (index != -1) {
            projectStore.project.boards.splice(index, 1, strapi.data.body);
          }
          if (projectStore.board.id === strapi.data.board_id) {
            projectStore.board = strapi.data.body;
          }
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
