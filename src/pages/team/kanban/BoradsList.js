import { computed, ref, watchEffect } from "vue";
import localforage from "localforage";
import { groupCreate, kanbanCreate } from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";

import { teamStore, userStore } from "src/hooks/global/useStore.js";
import { i18n } from 'src/boot/i18n.js';

const $t = i18n.global.t;

export async function getLastKanban(project_id, board_type) {
  const key = `___last_${board_type}_of_project_${project_id}`;
  const res = await localforage.getItem(key);
  if (res) {
    return res;
  }
}
export async function setLastKanban(project_id, val, board_type) {
  const key = `___last_${board_type}_of_project_${project_id}`;
  const _val = JSON.parse(JSON.stringify(val));
  await localforage.setItem(key, _val);
  return val;
}
export async function removeLastKanban(project_id, board_type) {
  const key = `___last_${board_type}_of_project_${project_id}`;
  await localforage.removeItem(key);
}

export async function createGroup(groupname) {
  if (!groupname) return;
  let params = {
    project_id: teamStore.project.id,
    board_id: teamStore.board.id,
    name: groupname,
  };
  let res = await groupCreate(params);
  if (res) {
    return res;
  }
}
export async function createKanban(group_id, title, type) {
  if (!group_id || !title) return;
  let params = {
    group_id: group_id,
    data: {
      title: title,
    },
  };
  if (type) {
    params.data.type = type;
  }
  let res = await kanbanCreate(params);
  if (res) {
    return res;
  }
}
export const board_type = computed(() => {
  let _type;
  if (teamStore.navigation === "kanban") {
    _type = "kanban";
  } else if (teamStore.navigation === "classroom") {
    _type = "classroom";
  } else if (teamStore.navigation === "segment") {
    _type = "segment";
  } else if (teamStore.navigation === "resource") {
    _type = "resource";
  }
  return _type;
});
export const space_name = computed(() => {
  let _space;
  if (teamStore.navigation === "kanban") {
    _space = $t('workspace_kanban');
  }
  if (teamStore.navigation === "classroom") {
    _space = $t('workspace_classroom');
  }
  if (teamStore.navigation === "resource") {
    _space = $t('workspace_resource');
  }
  if (teamStore.navigation === "segment") {
    _space = $t('workspace_segment');
  }
  return _space;
});
export const space_icon = computed(() => {
  let _space;
  if (teamStore.navigation === "kanban") {
    _space = "mdi-chart-gantt";
  } else if (teamStore.navigation === "classroom") {
    _space = "mdi-school";
  } else if (teamStore.navigation === "resource") {
    _space = "mdi-sale";
  } else if (teamStore.navigation === "segment") {
    _space = "mdi-film";
  } else {
    _space = "mdi-plus";
  }
  return _space;
});

export const boards = ref([]);
watchEffect(() => {
  boards.value = teamStore.project?.boards?.filter((i) => i.type === board_type.value)
})

export const findBoardByKanban = (kanban_id, _boards) => {
  let _board  
  if (_boards?.length > 0) {
    _board = _boards?.find(i => i.groups?.some(j => j.kanbans?.some(k => k.id === Number(kanban_id))));
    if(!_board) {
      _board = _boards[0]
    }
    return _board;
  } else {
    return null;
  }
}