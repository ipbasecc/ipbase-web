import { getOneProject } from "src/api/strapi/project.js";
import useProjectStore from "src/stores/project.js";

const projectStore = useProjectStore();

export async function useGetProject(project_id) {
  try {
    let res = await getOneProject(project_id);
    if (res?.data) {
      // console.log('useGetProject',res.data);
      projectStore.project = res.data;
      projectStore.project_id = res.data.id;
      projectStore.project_members = res.data.project_members;
      // 在获取项目后，重置need_refecth_kanban的状态
      projectStore.need_refecth_kanban = false;

      // 如果pinia中的board包含在新请求的项目boards中，更新它
      if (
        projectStore.board &&
        projectStore.project.boards
          ?.map((i) => i.id)
          .includes(projectStore.board)
      ) {
        projectStore.board = projectStore.project.boards.find(
          (i) => i.id === projectStore.board.id
        );
      }
      return res.data;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
  }
}
