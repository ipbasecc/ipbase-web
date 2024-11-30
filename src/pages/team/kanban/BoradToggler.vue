<template>
  <q-btn
    v-if="teamStore"
    flat
    no-caps
    :icon="space_icon"
    :icon-right="isEmpty ? '' : 'unfold_more'"
    :label="!isEmpty ? teamStore.board?.name : `${$t('create')}${space_name}`"
    align="left"
    class="full-width btn-fixed-width"
    :class="isEmpty ? 'active-sublistitem border-dashed border-op-xl border-xs' : ''"
    padding="sm"
  >
    <q-menu
      v-if="isEmpty"
      fit
      cover
      anchor="top left"
      transition-show="jump-up"
      transition-hide="jump-down"
      class="shadow-24 radius-sm"
    >
      <q-list bordered dense class="radius-sm q-pa-xs">
        <q-item class="no-padding">
          <q-item-section class="radius-xs overflow-hidden">
            <q-input
              v-model="create_name"
              type="text"
              dense
              square
              filled
              :placeholder="`新${space_name}名称`"
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
      </q-list>
    </q-menu>
    <q-menu
      v-else
      fit
      cover
      anchor="top left"
      transition-show="jump-up"
      transition-hide="jump-down"
      class="shadow-24 radius-sm"
    >
      <q-list bordered dense class="radius-sm q-pa-xs">
        <VueDraggable  v-if="!isEmpty" v-model="boards"
          :animation="300" :delay="1" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
          group="boards"
          chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
          handle=".dragBar"
          class="q-py-xs radius-sm column gap-sm no-wrap q-pa-xs"
          @sort="dragBoard_sort"
        >
          <template v-for="element in boards" :key="element.id">
            <div
              class="row no-wrap gap-sm items-center radius-xs border q-py-sm q-pl-md q-pr-sm hovered-item"
              :class="element.id === teamStore.board?.id ? 'bg-primary text-white' : ''"
            >
              <q-icon
                name="task_alt"
                :class="useAuths('order', ['board']) ? 'dragBar' : ''"
              />
              <span
                class="q-space cursor-pointer"
                @click="changeBoard(element)"
                v-close-popup
                >{{ element.name }}</span
              >
              <q-btn
                v-if="
                  useAuths('name', ['board']) ||
                  useAuths('delete', ['board'])
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
                      v-if="useAuths('name', ['board'])"
                    >
                      <q-input
                        v-model="rename_text"
                        dense
                        square
                        filled
                        type="text"
                        :placeholder="`${space_name}${$t('name')}`"
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
                    <template v-if="useAuths('delete', ['board'])">
                      <q-separator spaced />
                      <q-item
                        clickable
                        :v-close-popup="confirmRemove"
                        class="radius-xs"
                        :class="confirmRemove ? 'bg-negative' : ''"
                        @click="removeBoard(element.id)"
                      >
                        <q-item-section side
                          ><q-icon name="remove"
                        /></q-item-section>
                        <q-item-section>{{ $t('remove') }} {{ space_name }}</q-item-section>
                      </q-item>
                    </template>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </template>
        </VueDraggable>
        <template v-if="useAuths('create', ['board'])">
          <q-separator v-if="!isEmpty" spaced />
          <q-item
            v-if="!create_board_ing"
            clickable
            class="radius-xs"
            @click="create_board_ing = true"
          >
            <q-item-section side>
              <q-icon name="add_circle" />
            </q-item-section>
            <q-item-section>{{ `${$t('new')}${space_name}` }}</q-item-section>
          </q-item>
          <q-item v-else class="radius-xs no-padding">
            <q-item-section class="q-pa-xs">
              <q-input
                v-model="create_name"
                type="text"
                dense
                square
                filled
                :placeholder="`${$t('new')}${space_name}${$t('name')}`"
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
import { ref, toRefs, computed, nextTick } from "vue";
import {
  updateProject,
  createBoard,
  updateBoard,
  deleteBoard,
} from "src/api/strapi/project.js";
import { useRouter } from "vue-router";
import { VueDraggable } from 'vue-draggable-plus'
import { teamStore} from "src/hooks/global/useStore.js";
import { boards, space_name, space_icon } from "./BoradsList.js";
import { i18n } from 'src/boot/i18n.js';

const $t = i18n.global.t;

const props = defineProps({
  isEmpty: {
    type: Boolean,
    default: false,
  },
});
const { isEmpty } = toRefs(props);

const router = useRouter();

const create_board_ing = ref(false);
const create_name = ref("");

const createBoardFn = async () => {
  let params = {
    project_id: teamStore.project.id,
    name: create_name.value,
    type: teamStore.navigation,
  };
  let res = await createBoard(params);
  if (res) {
    create_board_ing.value = false;
    teamStore.board = res.data;
    create_name.value = null;
  }
};
const confirmRemove = ref(false);
const removeBoard = async (board_id) => {
  if(!confirmRemove.value){
    confirmRemove.value = true;
  } else {
    await deleteBoardFn(board_id)
    confirmRemove.value = false;
  }
}
const deleteBoardFn = async (board_id) => {
  let res = await deleteBoard(teamStore.project.id, board_id);
  if (res) {
    return;
  }
};
const dragBoard_sort = async () => {
  await nextTick();
  const rebuildallSort = () => {
    const newSort = boards.value.map((i) => i.id);
    let allSort_after = teamStore.project.boards.map((i) => i.id);
    allSort_after = allSort_after.filter((i) => !newSort.includes(i));
    allSort_after = [...newSort, ...allSort_after];
    return allSort_after;
  }
  let params = {
    data: {
      boards: rebuildallSort(),
    }
  };
  let res = await updateProject(teamStore.project.id, params);
  if (res) {
    
  }
};

const changeBoard = (val) => {
  // console.log(val);
  teamStore.board = val;
  teamStore.kanban = null;
  router.push(`/teams/projects/${teamStore.project?.id}`);
};

const rename_text = ref("");
const updateBoardFn = async (board_id) => {
  let params = {
    name: rename_text.value,
  };
  let res = await updateBoard(board_id, params);
  if (res) {
    rename_text.value = null;
  }
};
</script>

<style lang="scss">
.btn-fixed-width span.block {
  flex-grow: 1;
  text-align: left !important;
}
</style>
