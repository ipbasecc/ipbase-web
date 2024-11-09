// services/folderService.js
import { api } from "boot/axios";
class FolderService {
  // 创建文件夹
  async createFolder(name, parentId = null) {
    return api.post('upload/actions/folder/create', {
      name,
      parent: parentId
    });
  }

  // 获取文件夹结构
  async getFolderStructure() {
    return api.get('upload/folders/structure');
  }

  // 更新文件夹
  async updateFolder(id, data) {
    return api.post('upload/actions/folder/update', {
      id,
      ...data
    });
  }

  // 删除文件夹
  async deleteFolder(id) {
    return api.post('upload/actions/folder/delete', {
      id
    });
  }
}

export const folderService = new FolderService();