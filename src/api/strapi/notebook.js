import { api } from "boot/axios";


/**
 * 笔记本
 * @param {Number} notebook_id
 * @returns data
 */
export async function getNotebook(notebook_id) {
    try {
      const {data} = await api.get(`notebooks/${notebook_id}`);
      if (data) {
        return data;
      }
    } catch (error) {
        console.log(error);
        return error;
    }
}

/**
 * 新建笔记本
 * @param {Object} params { data: { name: '笔记本名称', ... } }
 * @returns data
 */
export async function createNotebook(params) {
    try {
      const {data} = await api.post(`notebooks`, params);
      if (data) {
        return data;
      }
    } catch (error) {
        console.log(error);
        return error;
    }
}

/**
 * 更新笔记本
 * @param {Object} params { data: { name: '笔记本名称', ... } }
 * @returns data
 */
export async function updateNotebook(notebook_id, params) {
    try {
      const {data} = await api.put(`notebooks/${notebook_id}`, params);
      if (data) {
        return data;
      }
    } catch (error) {
        console.log(error);
        return error;
    }
}

/**
 * 删除笔记本
 * @param {Number} notebook_id
 * @returns data
 */
export async function deleteNotebook(notebook_id) {
    try {
      const {data} = await api.delete(`notebooks/${notebook_id}`);
      if (data) {
        return data;
      }
    } catch (error) {
        console.log(error);
        return error;
    }
}