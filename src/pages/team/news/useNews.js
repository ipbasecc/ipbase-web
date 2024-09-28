import { teamStore } from "src/hooks/global/useStore.js";
import { useRouter } from 'vue-router';

export function useNews() {
    const router = useRouter();
  
    const openNews = (news) => {
      if (teamStore.active_news?.id === news.id) return;
      teamStore.active_news = news;
      router.push(`/teams/${teamStore.team?.id}/news/${news.id}`);
    };
  
    return {
      openNews
    };
}