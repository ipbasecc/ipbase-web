import { computed, ref, watchEffect } from "vue";
import localforage from "localforage";
import { groupCreate, kanbanCreate } from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";

import { teamStore, userStore } from "src/hooks/global/useStore.js";

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
    let chat_Msg = {
      body: `${userStore.me.username}在项目"${teamStore.project.name}"内新建了看板：${res.data.title}`,
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
    await send_chat_Msg(chat_Msg);
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
  }
  return _type;
});
export const boards = ref([]);
watchEffect(() => {
  boards.value = teamStore.project?.boards?.filter((i) => i.type === board_type.value)
})

const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};

export const findBoardByKanban = (kanban_id, _boards) => {
  let _board  
  if (_boards?.length > 0) {
    _board = _boards.find(i => i.groups.some(j => j.kanbans.some(k => k.id === Number(kanban_id))));
    if(!_board) {
      _board = _boards[0]
    }
    return _board;
  } else {
    return null;
  }
}