import { reactive, ref, watchEffect } from "vue";
import {
  findCard,
  findCardByShare,
  updateCard,
  deleteCard,
} from "src/api/strapi/project.js";
import { useCardname } from "src/hooks/project/useCardname.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import { computed } from "vue";
import { Notify } from "quasar";
import localforage from "localforage";
import {
  userStore,
  teamStore,
  mm_wsStore
} from "src/hooks/global/useStore.js";

const project = computed(() => teamStore?.project);

export function clac_cardEdgeStyle(card) {
  let edge = {};
  if (card?.urgency < 0) {
    card.urgency = 0;
  }
  if (card?.importance < 0) {
    card.importance = 0;
  }
  // 设置四象限对应的左边框颜色
  if (card.urgency >= 50 && card.importance >= 50) {
    edge.style = `background-color: rgba(222,0,21,${
      ((Number(card?.urgency) + Number(card?.importance)) / 2 - 50) * 2
    }%);`;
    edge.highlight = true;
    edge.color = "rgb(222,0,21)";
  }
  if (card.urgency > 50 && card.importance < 50) {
    edge.style = `background-color: rgba(25,206,78,${
      Number(card?.importance) - 50 + Number(card?.urgency)
    }%);`;
    edge.highlight = true;
    edge.color = "rgb(25,206,78)";
  }
  if (card.urgency < 50 && card.importance > 50) {
    edge.style = `background-color: rgba(33,111,244,${
      Number(card?.importance) + (Number(card?.urgency) - 50)
    }%);`;
    edge.highlight = true;
    edge.color = "rgb(33,111,244)";
  }
  return edge;
}
export function clac_todoData(card) {
  const total_todo = computed(
    () =>
      card.type === "todo" &&
      card.todogroups?.map((i) => i.todos)?.flat(2).length
  );
  const total_complateTodo = computed(
    () => {
      const all_todos = card.todogroups?.filter((i) => i.todos?.length > 0)?.map((i) => i.todos).flat(2);
      const filter_todos = all_todos.filter((i) => i.status);
      return filter_todos?.length
    }
  );
  const todo_process = computed(() => {
    let val;
    if (!total_todo.value || total_todo.value === 0) {
      val = 0;
    } else {
      val = Number(
        ((total_complateTodo.value / total_todo.value) * 100).toFixed(0)
      );
    }
    return val;
  });
  const todo_processColor = computed(() =>
    todo_process.value < 30
      ? "red"
      : todo_process.value < 70
      ? "primary"
      : "green"
  );
  return {
    total_todo: total_todo,
    total_complateTodo: total_complateTodo,
    todo_process: todo_process,
    todo_processColor: todo_processColor,
  };
}

const send_chat_Msg = async (MsgContent) => {
  return await send_MattersMsg(MsgContent);
};

const updateParmars = reactive({
  project_id: project.value?.id,
  data: {},
});

const updateCardFn = async (card_id) => {
  let res = await updateCard(card_id, updateParmars);
  if (res?.data) {
    return res.data;
  } else {
    Notify.create("保存失败");
  }
};

export async function updateCardName(card, name) {
  if (!name || !card || name === "") return;
  updateParmars.data.name = name.replace(/<[^>]+>/g, "");

  let res = await updateCardFn(card.id);
  if (res) {
    return res;
  }
}

export async function publishCard(card) {
  updateParmars.data.published = true;

  let res = await updateCardFn(card.id);
  delete updateParmars.data.published
  if (res) {
    return res;
  }
}
export async function pulledCard(card) {
  delete updateParmars.data.unpulledCard_id
  updateParmars.data.pulledCard_id = card.id;

  let res = await updateCardFn(card.id);
  if (res) {
    return res;
  }
}
export async function unpulledCard(card) {
  delete updateParmars.data.pulledCard_id
  updateParmars.data.unpulledCard_id = card.id;

  let res = await updateCardFn(card.id);
  if (res) {
    return res;
  }
}
export async function setCardType(card, val) {
  updateParmars.data.type = val;
  let res = await updateCardFn(card.id);
  if (res) {
    return res;
  }
}
export async function setCardColor(card, color) {
  updateParmars.data.color_marker = color;

  let res = await updateCardFn(card.id);
  if (res) {
    return res;
  }
}

export async function unfollowCard(card) {
  const roleID_of_executor = card.member_roles?.find(
    (i) => i.subject === "executor"
  )?.id;
  let card_executor = card.card_members?.find(
    (i) => i.id === roleID_of_executor
  )?.by_user.id;
  if (card_executor === userStore.userId) {
    Notify.create("您是卡片负责人，不能取消对卡片的关注");
    return;
  }
  updateParmars.data = {
    remove_follow_user_id: userStore.userId,
  };
  let res = await updateCardFn(card.id);
  if (res) {
    return res;
  }
}

export async function followCard(card, _user) {
  console.log("触发followCard", _user);
  updateParmars.data = {
    new_follow_user_id: _user?.id || userStore.userId,
  };
  let res = await updateCardFn(card.id);
  if (res) {
    return res;
  }
}

export async function attachExecutor(card, member) {
  console.log("member", member);
  updateParmars.executor = member?.id || NaN;
  let res = await updateCardFn(card.id);
  if (res) {
    if (!card.followed_bies?.map((i) => i.id).includes(Number(userStore.userId))) {
      const _user = member?.by_user;
      await followCard(card, _user);
    }
    return res;
  }
}

export async function todoItemUpdate(card, group_id, todo) {
  let chat_Msg = {
    body: `${userStore.me?.username}更新了卡片 - ${useCardname(
      card
    )} 的待办事项： ${todo.content}`,
    props: {
      strapi: {
        data: {
          is: "todo",
          by_user: userStore.userId,
          card_id: card.id,
          group_id: group_id,
          todo_id: todo.id,
          action: "card_todo_updated",
          body: todo,
        },
      },
    },
  };
  await send_chat_Msg(chat_Msg);
}
export async function todoCreated(card, group_id, todo) {
  let chat_Msg = {
    body: `${userStore.me?.username}在卡片 - ${useCardname(
      card
    )} 新建了待办事项： ${todo.content}`,
    props: {
      strapi: {
        data: {
          is: "todo",
          by_user: userStore.userId,
          card_id: card.id,
          group_id: group_id,
          action: "card_todo_created",
          body: todo,
        },
      },
    },
  };
  await send_chat_Msg(chat_Msg);
}

export async function todoDeleted(card, group_id, todo_id) {
  let chat_Msg = {
    body: `${userStore.me?.username}删除了卡片 - ${useCardname(
      card
    )} 的待办事项： ${todo_id}`,
    props: {
      strapi: {
        data: {
          is: "todo",
          by_user: userStore.userId,
          card_id: card.id,
          group_id: group_id,
          todo_id: todo_id,
          action: "card_todo_deleted",
        },
      },
    },
  };
  await send_chat_Msg(chat_Msg);
}

export async function setScore(card, val) {
  updateParmars.data.score = val;
  let res = await updateCardFn(card.id);
  if (res) {
    return res;
  }
}
export async function setStatus(card, val) {
  card.status = val;
  updateParmars.data.status = val;
  let res = await updateCardFn(card.id);
  if (res) {
    return res;
  }
}

export async function updateJsonContent(card, val) {
  updateParmars.data.jsonContent = val;
  let res = await updateCard(card.id, updateParmars);
  if (res) {
    return res;
  }
}

export async function removeCard(card, belong_card) {
  let res;
  if (belong_card) {
    let belong_card_id = belong_card.id;
    res = await deleteCard(card.id, project.value?.id, belong_card_id);
  } else {
    res = await deleteCard(card.id, project.value?.id);
  }

  if (res) {
    return card.id;
  }
}

export async function enterCard(card, viewType) {
  // console.log("enterCard viewType", viewType);
  let can_enter_types = ["task"];
  if (can_enter_types.includes(card.type) || viewType === "card") {
    // 如果teamStore.showCards为 true,说明点开的card是在card内的看板,否则点开的card是project的看板
    if (teamStore.showCards) {
      // console.log("teamStore.shareInfo", teamStore.shareInfo);
      let res
      if(teamStore.shareInfo){
        res = await findCardByShare(card.id, teamStore.shareInfo?.code, teamStore.shareInfo?.by);
      } else {
        res = await findCard(card.id);
      }
      if (res?.data) {
        teamStore.card = res.data;
        if (!teamStore.cards?.map((i) => i.id).includes(res.data.id)) {
          teamStore.cards = [...teamStore.cards, res.data];
        }
      }
    } else {
      teamStore.activedCard_id = card.id;
    }
  }
  if (card.type === "document" || viewType === "document") {
    // console.log(card.type, viewTypeRef.value);
    teamStore.card = card;
  }
}
export async function enterSegment(card) {
  let res = await findCard(card.id);
  if (res?.data) {
    teamStore.card = res.data;
    teamStore.cards = [res.data];
  }
}
export async function findThread(card) {
  let res = await findCard(card.id);
  if (res?.data) {    
    return res.data.mm_thread;
  }
}

export async function leaveCard() {
  teamStore.showCards = false;
  teamStore.activedCard_id = null;
  teamStore.card = null;
  teamStore.cards = [];
}

export async function cacheExpand(card, val) {
  try {
    await localforage.setItem(`___card_expandStatus_${card.id}`, val);
  } catch (error) {
    console.log(error);
  }
}

export async function setCardSharecode(card, val) {
  updateParmars.data.share_code = val;
  if(updateParmars.data.share_code.up_time === ''){
    updateParmars.data.share_code.up_time = null
  }
  const res = await updateCardFn(card.id);
  if(res) {
    return res
  }
}

/**
 * 
 * @param {Object} cardRef card的ref
 * @description 卡片关联的聊天主题更新时，都主动更新一次卡片的mm_thread字段，以便在此读取时可以拿到最新的数据
 * 后端收到只更新mm_thread的更新请求时，也不会通过ws同步更新信息
 */
export async function updateCardThread(cardRef) {
  watchEffect(async () => {
    const event = mm_wsStore.event;
    if(event.data?.thread){
      const _thread = JSON.parse(event.data.thread);
      if (event.event === "thread_updated" && _thread.id === cardRef.value?.mm_thread?.id) {
        cardRef.value.mm_thread = _thread;
        updateParmars.data.mm_thread = _thread;
        await updateCard(cardRef.value.id, updateParmars);
        delete updateParmars.data.mm_thread;
      }
    }
    
    if(event.data?.post){
      let post = JSON.parse(mm_wsStore.event.data.post);
      if (event.event === "posted" && post.root_id === cardRef.value?.mm_thread?.id) {
        cardRef.value.mm_thread.reply_count++;
      }
    }
  });
}