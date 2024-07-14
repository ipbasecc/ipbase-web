<template>
  <q-layout v-if="project" view="lHr LpR lFr" container>
    <q-header v-if="project?.id" class="transparent">
      <q-bar
        class="transparent border-bottom gap-sm q-pr-none overflow-hidden"
        style="height: 2.3rem"
      >
        <q-btn
          flat
          dense
          icon="menu"
          @click="projectStore.BoradsList = !projectStore.BoradsList"
        />

        <q-space />
        <q-btn-group
          v-if="projectStore?.kanban?.type === 'kanban'"
          flat
          class="border"
        >
          <q-btn
            dense
            padding="4px 10px"
            label="看板"
            icon="view_kanban"
            @click="view_model = 'kanban'"
            :color="view_model === 'kanban' ? 'primary' : ''"
            :class="
              view_model === 'kanban'
                ? 'text-white'
                : $q.dark.mode
                ? 'text-grey-3'
                : 'text-grey-10'
            "
          />
          <q-btn
            dense
            padding="4px 10px"
            label="列表"
            icon="format_list_bulleted"
            @click="view_model = 'list'"
            :color="view_model === 'list' ? 'primary' : ''"
            :class="
              view_model === 'list'
                ? 'text-white'
                : $q.dark.mode
                ? 'text-grey-3'
                : 'text-grey-10'
            "
          />
          <q-btn
            dense
            padding="4px 10px"
            label="四象限"
            icon="border_inner"
            @click="view_model = 'quadrant'"
            :color="view_model === 'quadrant' ? 'primary' : ''"
            :class="
              view_model === 'quadrant'
                ? 'text-white'
                : $q.dark.mode
                ? 'text-grey-3'
                : 'text-grey-10'
            "
          />
        </q-btn-group>
        <q-btn
          flat
          dense
          icon="task_alt"
          :class="projectStore.PrivateTodo ? '' : 'op-5'"
          :color="projectStore.PrivateTodo ? 'positive' : ''"
          @click="projectStore.PrivateTodo = !projectStore.PrivateTodo"
        />
        <q-input
          v-model="projectStore.filter_txt"
          type="text"
          flat
          dense
          filled
          square
          class="no-padding"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-bar>
    </q-header>

    <q-drawer
      v-model="projectStore.BoradsList"
      v-if="project?.id"
      side="left"
      class="border-right q-py-sm"
    >
      <BoradsList v-if="projectStore.project" />
    </q-drawer>
    <q-drawer
      v-if="projectStore.kanban && project?.id"
      v-model="projectStore.PrivateTodo"
      side="right"
      class="border-right q-pl-xs"
      :class="$q.dark.mode ? 'bg-black' : 'bg-white'"
      :width="400"
    >
      <TodoPage :kanban_id="projectStore.kanban?.id" />
    </q-drawer>

    <q-page-container>
      <q-page :class="$q.dark.mode ? '' : 'bg-grey-4'">
        <div v-if="!project?.id" class="absolute-full flex flex-center">
          <q-card bordered style="min-width: 400px">
            <q-card-section
              v-if="userStore?.me?.username"
              class="border-bottom"
            >
              Hi:
              <span class="font-bold-600 q-ml-sm">{{
                userStore.me.username
              }}</span>
            </q-card-section>
            <q-card-section class="font-larger font-medium q-pa-xl">
              {{ project }}
            </q-card-section>
            <q-card-section class="border-top q-pa-sm">
              <q-btn
                color="primary"
                icon="arrow_back_ios"
                align="left"
                label="返回项目首页"
                class="full-width"
                @click="$router.push('/projects')"
              />
            </q-card-section>
          </q-card>
        </div>
        <template v-else>
          <RouterView :view_model="view_model" />
          <div
            v-if="!projectStore.kanban"
            class="absolute-full column flex-center op-3 z-unfab"
          >
            <BgBrand />
          </div>
        </template>
        <q-dialog
          v-model="projectRemoved"
          persistent
          full-height
          full-width
          class="blur-md"
        >
          <div class="fit flex flex-center">
            <q-card bordered style="min-width: 400px">
              <q-card-section>
                当前项目已经被删除，即将跳转到项目管理首页...
              </q-card-section>
              <q-card-actions>
                <q-btn
                  label="立即跳转"
                  color="primary"
                  class="full-width"
                  v-close-popup
                />
              </q-card-actions>
            </q-card>
          </div>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onBeforeUnmount, onBeforeMount, ref, watch, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getOneProject, findCard } from "src/api/strapi/project.js";

import BoradsList from "src/pages/Project/components/project/BoradsList.vue";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";
import TodoPage from "src/pages/Project/todo/TodoPage.vue";
import useProjectStore from "src/stores/project.js";
import useMmws from "src/stores/mmws.js";
import useUserStore from "src/stores/user.js";
import localforage from "localforage";

import { isJSON, uniqueById } from "src/hooks/utilits.js";

const router = useRouter();
const route = useRoute();
const mm_wsStore = useMmws();
const projectStore = useProjectStore();
const userStore = useUserStore();

const props = defineProps({
  kanban_id: {
    type: String,
    default: "",
  },
});

const project = ref();
const getProject = async () => {
  try {
    let res = await getOneProject(projectStore.project_id);
    if (res?.data) {
      project.value = res.data;
      projectStore.project = res.data;
      projectStore.project_members = projectStore.project.project_members;
      // 防御性设置，在获取项目后，重置need_refecth_kanban的状态
      projectStore.need_refecth_kanban = false;

      if (projectStore.board) {
        projectStore.board = projectStore.project.boards.find(
          (i) => i.id === projectStore.board.id
        );
      }
    } else {
      projectRemoved.value = true;
      projectRemovedFn();
    }
  } catch (error) {
    console.log(error);
  }
};

onBeforeMount(() => {
  projectStore.rightDrawerOpen = false;
  localforage
    .getItem("__project_leftDrawerOpen")
    .then((res) => {
      projectStore.leftDrawerOpen = res;
    })
    .catch((err) => {
      console.log(err);
    });
  getProject();
}),
  onBeforeUnmount(() => {
    projectStore.leftDrawerOpen = true;
  });

const projectRemoved = ref(false);
const projectRemovedFn = () => {
  setTimeout(() => {
    projectStore.need_refecth_projects = true;
    projectRemoved.value = false;
    // router.push('/projects');
  }, 3000);
};
watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event == "posted") {
      let post = JSON.parse(mm_wsStore.event.data.post);
      let message;
      if (isJSON(post.message)) {
        message = JSON.parse(post.message);
        if (
          message.data?.is === "project" &&
          message.data?.project_id === projectStore.project?.id &&
          (message.data.action === "delete" ||
            message.data.action === "archive")
        ) {
          projectRemoved.value = true;
          projectRemovedFn();
        }
        if (
          strapi.data?.is === "project" &&
          strapi.data.action === "role_updated" &&
          strapi.data.project_id === projectStore.project?.id
        ) {
          const res = await getProject(projectStore.project?.id);
          if (res?.data) {
            projectStore.project.member_roles = res.data.member_roles;
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.action === "role_updated" &&
          strapi.data.card_id === projectStore.card?.id
        ) {
          try {
            let res = await findCard(strapi.data.card_id);
            if (res?.data) {
              projectStore.card.member_roles = res.data.member_roles;
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
  },
  { immediate: true, deep: true }
);

// watchEffect()(() => {
//     if(route.params?.proj_id && !route.params?.kanban_id) {
//         find_lastKanban(route.params.proj_id)
//     }
// })
onBeforeUnmount(() => {
  projectStore.project = null;
});

const view_model = ref("kanban");
</script>

<style lang="scss">
aside.q-dark {
  background-color: transparent;
}
</style>
