import { db } from "src/boot/dexie.js";
import { getOneKanban, getProjects, checkCardsPayStates } from "src/api/strapi/project.js";
import { useGetProject } from "src/hooks/project/useGetProject.js";
import { nextTick } from "vue";
import { teamStore } from "../global/useStore";

const processVal = (data) => {
  // if (data != null || data != undefined || data != NaN || !data) {
  //   return;
  // } else {
  //   }
  // console.log("data", data);
  // function preprocessData(data) {
  //   if (typeof data === "function" || typeof data === "symbol") {
  //     return JSON.stringify(data);
  //   } else if (data instanceof RegExp) {
  //     return data.toString();
  //   } else if (data instanceof HTMLElement) {
  //     return data.outerHTML;
  //   } else if (Array.isArray(data)) {
  //     return data.map((i) => preprocessData(i));
  //   } else {
  //     return toRaw(data);
  //   }
  //   const prcs = preprocessData(data);

  // 返回预处理后的数据
  // }
  return JSON.parse(JSON.stringify(data));
};

const _putProjectsCache = async (user_id, val) => {
  if (val === null || val === undefined || isNaN(val) || !val) return;
  // console.log("user_id", user_id);
  const _val = processVal(val);
  await nextTick();
  const cache = await getProjectsCache(user_id);
  if (cache) {
    const newCache = {
      ...cache,
      projects: _val,
    };
    try {
      await db.matedata.put(newCache);
    } catch (error) {
      console.log(error);
    }
  } else {
    const params = {
      id: user_id,
      projects: _val,
    };
    try {
      await db.matedata.add(params);
    } catch (error) {
      console.log(error);
    }
  }
};

export async function getProjectsCache(user_id) {
  if (!user_id) return;
  return await db.matedata.get(user_id);
}
export async function putProjectsCache(user_id, val) {
  if (val === null || val === undefined || isNaN(val) || !val) return;
  await _putProjectsCache(user_id, val);
}

export async function fetchProjects(page, per_page, user_id) {
  let res = await getProjects(page, per_page, user_id);
  if (res) {
    // console.log(user_id);
    await putProjectsCache(user_id, res.data?.projects);
  }
  return res;
}

async function _putKanbanCache(val) {
  // if (val === null || val === undefined || isNaN(val) || !val) return;
  // console.log('_putKanbanCache', val)
  const getCache = async (_id) => {
    // console.log("getCache", _id);
    try {
      return await db.kanbans.get(_id);
    } catch (error) {
      console.log(error);
      return {};
    }
  };
  const addCache = async (val) => {
    // console.log('addCache', val)
    const __val = processVal(val);
    try {
      return await db.kanbans.add(__val);
    } catch (error) {
      console.log(error);
      return {};
    }
  };
  const putCache = async (val) => {
    // console.log('putCache', val)
    await nextTick();
    const __val = processVal(val);
    const cache = await getCache(val.id);
    if (cache) {
      try {
        await db.kanbans.put(__val);
      } catch (error) {
        console.log(error);
      }
    } else {
      await addCache(val);
    }
  };
  await putCache(val);
}

export async function getKanbanCache(kanban_id) {
  try {
    return await db.kanbans.get(kanban_id);
  } catch (error) {
    console.log(error);
    return {};
  }
}

export async function deleteKanbanCache(kanban_id) {
  try {
    await db.kanbans.delete(kanban_id);
  } catch (error) {
    console.log(error);
  }
}

export async function putKanbanCache(val) {
  if (!val) return;
  // console.log("putKanbanCache", val);
  await _putKanbanCache(val);
}

export async function getKanban(kanban_id) {
  let res = await getOneKanban(kanban_id);
  if (res?.data) {
    if(teamStore.navigation === 'classroom'){
      if (res?.data?.columns?.length > 0) {
        const cardIds = res.data.columns.flatMap(column => column.cards?.map(card => card.id) || []);
        const params = {
          subject: 'card',
          data: {
            check_ids: cardIds
          }
        }
        const payStates = await checkCardsPayStates(params);
        // console.log(payStates);
        
        res.data.columns.forEach(column => {
          column.cards.forEach(card => {
            card.payState = payStates.data?.find(i => i.card_id === card.id);
          });
        });
      }
    }
    await _putKanbanCache(res?.data);
    return res.data;
  }
}

const _putProjectCache = async (val) => {
  if (val === null || val === undefined || isNaN(val) || !val) return;
  // console.log("val", val);
  const __val = processVal(val);
  // console.log("__val", __val);
  const getCache = async (_id) => {
    try {
      return await db.projects.get(_id);
    } catch (error) {
      console.log(error);
    }
  };
  const addCache = async (val) => {
    try {
      return await db.projects.add(val);
    } catch (error) {
      console.log(error);
    }
  };
  await nextTick();
  const cache = await getCache(val.id);
  if (cache) {
    try {
      await db.projects.put(__val);
    } catch (error) {
      console.log(error);
    }
  } else {
    await addCache(__val);
  }
};

export async function getProjectCache(_id) {
  try {
    return await db.projects.get(_id);
  } catch (error) {
    console.log(error);
    return {};
  }
}

export async function deleteProjectCache(_id) {
  try {
    await db.projects.delete(_id);
  } catch (error) {
    console.log(error);
  }
}

export async function fetchProject(_id) {
  try {
    let res = await useGetProject(_id);
    if (res) {
      return res;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function putProjectCache(val) {
  if (val === null || val === undefined || isNaN(val) || !val) return;
  await _putProjectCache(val);
}
