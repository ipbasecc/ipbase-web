import { watch } from "vue";
import { getTeamByID, getChannelByID } from "src/api/strapi/team.js";
import { teamStore, mm_wsStore } from "src/hooks/global/useStore.js";

export default function useWatcher() {
  const refetchTeam = async () => {
    if (!teamStore.team) return;
    const team = await getTeamByID(teamStore.team?.id);
    if (team?.data) {
      teamStore.team = team.data;
      if (teamStore.channel) {
        const _channel = await getChannelByID(teamStore.channel.id);
        teamStore.channel = _channel?.data;
      }
    }
  };
  watch(
    mm_wsStore,
    async () => {
      // 团队、频道、项目、卡片成员角色变化时，响应的团队成员角色也会变化，此处需要监听并获取最新数据
      // todo 此处需要防抖，这里监听的是加入频道事件，当有新用户加入团队后，会自动加入所有开放团队，因此会多次触发此事件
      // 这里只需要请求一次即可
      const needRefetchTeam = [
        "user_added",
      ];
      const mm_event = mm_wsStore.event?.event;
      // console.log("mm_event", mm_event);
      if (needRefetchTeam.includes(mm_event) && teamStore?.team) {
        await refetchTeam();
      }
    },
    { immediate: false, deep: true }
  );
}
