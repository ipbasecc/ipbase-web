import useUIStore from "src/stores/ui.js";
import useMmws from "src/stores/mmws.js";
import useWorkStore from "src/stores/work.js";
import useTeamStore from "src/stores/team.js";
import useUserStore from "src/stores/user.js";
import useChannelStore from "src/stores/channel.js";

import useMmstore from "src/stores/mmstore.js";
import mmUserStore from "src/stores/mmuser.js";
import useDealStore from "src/stores/deal.js";
import useOss from "src/stores/oss.js";
import useDiscoverStore from "src/stores/discover.js";
import useNotifyStore from "src/stores/notify.js";
import useChatStore from "src/stores/chat.js";

export const uiStore = useUIStore();
export const mm_wsStore = useMmws();
export const workStore = useWorkStore();
export const teamStore = useTeamStore();
export const userStore = useUserStore();
export const channelStore = useChannelStore();

export const mmstore = useMmstore();
export const mmUser = mmUserStore();
export const dealStore = useDealStore();
export const ossStore = useOss();
export const discoverStore = useDiscoverStore();
export const notifyStore = useNotifyStore();
export const chatStore = useChatStore();