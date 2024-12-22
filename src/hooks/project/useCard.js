import { reactive } from "vue";
import { findCard, updateCard, deleteCard } from "src/api/strapi/project.js";
import { useCardname } from "src/hooks/project/useCardname.js";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
import { computed } from "vue";
import { Notify } from "quasar";
import localforage from "localforage";
import {
  teamStore,
  projectStore
} from "src/hooks/global/useStore.js";

const project = computed(() => projectStore?.project);

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
  }
  if (card.urgency > 50 && card.importance < 50) {
    edge.style = `background-color: rgba(25,206,78,${
      Number(card?.importance) - 50 + Number(card?.urgency)
    }%);`;
    edge.highlight = true;
  }
  if (card.urgency < 50 && card.importance > 50) {
    edge.style = `background-color: rgba(33,111,244,${
      Number(card?.importance) + (Number(card?.urgency) - 50)
    }%);`;
    edge.highlight = true;
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
    () =>
      card.type === "todo" &&
      card.todogroups?.map((i) => i.todos.filter((j) => j.status))?.flat(2)
        .length
  );
  const todo_process = computed(() =>
    Number(((total_complateTodo.value / total_todo.value) * 100).toFixed(0))
  );
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
  await send_MattersMsg(MsgContent);
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
  updateParmars.data.name = name.replace(/<[^>]+>/g, "");

  let res = await updateCardFn(card.id);
  if (res) {
    let chat_Msg = {
      body: `${teamStore?.init?.username}修改了卡片 - ${useCardname(card)} 的名称`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: teamStore?.init?.id,
            card_id: card.id,
            action: "update_card_name",
            card_name: updateParmars.data.name,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
    delete updateParmars.data.name;
  }
}
export async function setCardType(card, val) {
  updateParmars.data.type = val;
  let res = await updateCardFn(card.id);
  if (res) {
    delete updateParmars.data.type;
    let chat_Msg = {
      body: `${teamStore?.init?.username}修改了卡片 - ${useCardname(card)} 的类型`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: teamStore?.init?.id,
            card_id: card.id,
            action: "update_card_type",
            card_type: val,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
}
export async function setCardColor(card, color) {
  updateParmars.data.color_marker = color;

  let res = await updateCardFn(card.id);
  if (res?.data) {
    let chat_Msg = {
      body: `${teamStore?.init?.username}修改了卡片 - ${useCardname(
        card
      )} 的颜色标记`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: teamStore?.init?.id,
            card_id: card.id,
            action: "update_card_color",
            card_color: color,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
}

export async function unfollowCard(card) {
  const roleID_of_executor = card.member_roles?.find(
    (i) => i.subject === "executor"
  )?.id;
  let card_executor = card.card_members?.find(
    (i) => i.id === roleID_of_executor
  )?.by_user.id;
  if (card_executor === teamStore?.init?.id) {
    Notify.create("您是卡片负责人，不能取消对卡片的关注");
    return;
  }
  updateParmars.data = {
    remove_follow_user_id: teamStore?.init?.id,
  };
  let res = await updateCardFn(card.id);
  if (res) {
    delete updateParmars.data.remove_follow_user_id;
    let message = `${teamStore?.init?.username}取消了卡片 - ${useCardname(
      card
    )} 的关注`;
    let chat_Msg = {
      body: message,
      props: {
        strapi: {
          data: {
            is: "card",
            action: "remove_card_followed",
            card_id: card.id,
            remove_followed: teamStore?.init?.id,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
}

export async function followCard(card, _user) {
  console.log("触发followCard", _user);
  updateParmars.data = {
    new_follow_user_id: _user?.id || teamStore?.init?.id,
  };
  let res = await updateCardFn(card.id);
  if (res) {
    delete updateParmars.data.new_follow_user_id;
    let message = `${
      _user ? _user.username : teamStore?.init?.username
    }关注了卡片 - ${useCardname(card)}`;
    let chat_Msg = {
      body: message,
      props: {
        strapi: {
          data: {
            is: "card",
            action: "new_card_followed",
            card_id: card.id,
            new_followed: _user?.id || teamStore?.init?.id,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
}

export async function attachExecutor(card, member) {
  updateParmars.executor = member?.id || NaN;
  let res = await updateCardFn(card.id);
  if (res) {
    let message;
    if (member === null) {
      message = `${teamStore?.init?.username}移除了卡片 - ${useCardname(
        card
      )} 的负责人`;
    } else {
      message = `${teamStore?.init?.username}指定了卡片 - ${useCardname(
        card
      )} 的负责人为：${member.username}`;
    }
    let body = Object.assign(res);
    delete body.member_roles;
    let chat_Msg = {
      body: message,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: teamStore?.init?.id,
            card_id: card.id,
            action: "update_card_executor",
            executor: member?.id || NaN,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);

    if (
      !card.followed_bies?.map((i) => i.id).includes(Number(teamStore?.init?.id))
    ) {
      const _user = member?.by_user;
      console.log("触发follow", _user);
      followCard(card, _user);
    }
  }
}

const todoUpdate = async (card, val) => {
  updateParmars.data.todogroups = val;
  let res = await updateCardFn(card.id);
  if (res) {
    delete updateParmars.data.todogroups;
    return res;
  }
};

export async function todogroupSort(card, val) {
  let res = await todoUpdate(card, val);
  if (res) {
    let chat_Msg = {
      body: `${teamStore?.init?.username}修改了卡片 - ${useCardname(
        card
      )} 的待办事项的分组排序`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: teamStore?.init?.id,
            card_id: card.id,
            action: "card_todogroup_order",
            order: res.todogroups.map((i) => i.id),
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
}

export async function todogroupUpdate(card, groups, group) {
  let res = await todoUpdate(card, groups);
  if (res) {
    let chat_Msg = {
      body: `${teamStore?.init?.username}修改了卡片 - ${useCardname(
        card
      )} 的待办事项的分组名称修改为: ${group.name}`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: teamStore?.init?.id,
            card_id: card.id,
            action: "card_todogroup_update",
            body: group,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
}

export async function createTodogroup(card, group) {
  let chat_Msg = {
    body: `${teamStore?.init?.username}在卡片 - ${useCardname(
      card
    )} 内新建了待办事项分组 - ${group.name}`,
    props: {
      strapi: {
        data: {
          is: "card",
          by_user: teamStore?.init?.id,
          card_id: card.id,
          action: "card_todogroup_created",
          body: group,
        },
      },
    },
  };
  await send_chat_Msg(chat_Msg);
}

export async function deleteTodogroup(card, groups, group) {
  let todogroups = groups.filter((g) => g.id !== group.id);
  let res = await todoUpdate(card, todogroups);
  if (res) {
    let chat_Msg = {
      body: `${teamStore?.init?.username}删除了卡片 - ${useCardname(
        card
      )} 的待办事项分组 - ${group.name}`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: teamStore?.init?.id,
            card_id: card.id,
            action: "card_todogroup_deleted",
            id: group.id,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
}
export async function todoSort(card, group, sort) {
  let all_todos = card.todogroups.map((g) => g.todos).flat(2);
  let chat_Msg = {
    body: `${teamStore?.init?.username}对卡片 - ${useCardname(
      card
    )} 的待办事项进行了排序`,
    props: {
      strapi: {
        data: {
          is: "todogroup",
          by_user: teamStore?.init?.id,
          card_id: card.id,
          group_id: group.id,
          action: "card_todo_sort",
          body: {
            todos: sort.map((i) => all_todos.find((t) => t.id === i)),
          },
        },
      },
    },
  };
  await send_chat_Msg(chat_Msg);
}
export async function todoitemUpdate(card, group_id, todo) {
  let chat_Msg = {
    body: `${teamStore?.init?.username}更新了卡片 - ${useCardname(
      card
    )} 的待办事项： ${todo.name}`,
    props: {
      strapi: {
        data: {
          is: "todo",
          by_user: teamStore?.init?.id,
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
    body: `${teamStore?.init?.username}在卡片 - ${useCardname(
      card
    )} 新建了待办事项： ${todo.content}`,
    props: {
      strapi: {
        data: {
          is: "todo",
          by_user: teamStore?.init?.id,
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
    body: `${teamStore?.init?.username}删除了卡片 - ${useCardname(
      card
    )} 的待办事项： ${todo_id}`,
    props: {
      strapi: {
        data: {
          is: "todo",
          by_user: teamStore?.init?.id,
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
  console.log("updateParmars", updateParmars);
  let res = await updateCardFn(card.id);
  if (res) {
    delete updateParmars.data.score;
    card.score = val;
    let chat_Msg = {
      body: `${teamStore?.init?.username}修改了卡片 - ${useCardname(card)} 的分值`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: teamStore?.init?.id,
            card_id: card.id,
            action: "update_card_score",
            card_score: val,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
}
export async function setStatus(card, val) {
  card.status = val;
  updateParmars.data.status = val;
  let res = await updateCardFn(card.id);
  if (res) {
    let chat_Msg = {
      body: `${teamStore?.init?.username}将卡片 - ${useCardname(
        card
      )} 状态修改为：${val}`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: teamStore?.init?.id,
            card_id: card.id,
            action: "update_card_status",
            card_status: val,
          },
        },
      },
    };
    delete updateParmars.data.status;
    await send_chat_Msg(chat_Msg);
  }
}

export async function updateJsonContent(card, val) {
  updateParmars.data.jsonContent = val;
  let res = await updateCard(card.id, updateParmars);
  if (res) {
    let chat_Msg = {
      body: `${teamStore?.init?.username}修改了卡片 - ${useCardname(card)} 的内容`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: teamStore?.init?.id,
            card_id: card.id,
            action: "update_card_jsonContent",
            jsonContent: res.data.jsonContent,
          },
        },
      },
    };
    delete updateParmars.data.jsonContent;
    await send_chat_Msg(chat_Msg);
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
    let chat_Msg = {
      body: `${teamStore?.init?.username}删除了卡片 - ${useCardname(card)}`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: teamStore?.init?.id,
            action: "delete",
            body: res.data,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
    Notify.create("卡片已删除");
    return card.id;
  }
}

export async function enterCard(card, viewType) {
  let can_enter_types = ["task"];
  let show_cardDetial = void 0;
  if (can_enter_types.includes(card.type) || viewType === "kanban") {
    // 如果projectStore.showCards为 true,说明点开的card是在card内的看板,否则点开的card是project的看板
    if (projectStore.showCards) {
      let res = await findCard(card.id);
      if (res) {
        projectStore.card = res.data;
        if (!projectStore.cards.map((i) => i.id).includes(res.data.id)) {
          projectStore.cards = [...projectStore.cards, res.data];
        }
      }
    } else {
      projectStore.activedCard_id = card.id;
      show_cardDetial = true;
    }
  }
  if (card.type === "document" || viewType === "document") {
    // console.log(card.type, viewTypeRef.value);
    projectStore.card = card;
  }
  return show_cardDetial;
}

export async function leaveCard() {
  projectStore.showCards = false;
  projectStore.activedCard_id = null;
  projectStore.card = null;
  projectStore.cards = [];
}

export async function cacheExpand(card) {
  try {
    await localforage.setItem(
      `___card_unfold_less_${card.id}`,
      unfold_lessRef.value
    );
  } catch (error) {
    console.log(error);
  }
}
