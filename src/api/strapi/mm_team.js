import { api } from 'boot/axios';

// 为通讯频道创建Board
export async function createBoard(params) {
    try {
        const res = await api.post(`mattermost/boards`,params);
        if(res) {
          return res
        }
    } catch (error) {
        return error
    }
}

// 获取通讯频道Board
export async function getMmChannelBoard(mm_channel_id) {
    try {
        const res = await api.get(`mattermost/boards/${mm_channel_id}`);
        if(res?.data) {
          return res
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res
        } else {
          console.log(error);
        }
    }
}

// 获取与Mattermost Channel绑定的项目
export async function getMmChannelProject(mm_channel_id) {
    try {
        const res = await api.get(`mattermost/projects/${mm_channel_id}`);
        if(res?.data) {
          return res
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res
        } else {
          console.log(error);
        }
    }
}
