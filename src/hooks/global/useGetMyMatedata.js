import { ref, watch } from "vue";
import { findMe, FindUserMatedate } from "src/apollo/api/api.js";

import useUserStore from "src/stores/user.js";
import useChannelStore from "src/stores/channel.js";

import localforage from "localforage";
import { Dark } from "quasar";

const userStore = useUserStore();
const ChannelStore = useChannelStore();

// 检测用户是否登录，并获取登录用户资料
const jwt = ref(userStore.jwt || localStorage.getItem("jwt") || null);
const me = ref();
const profile = ref();
const userId = ref(userStore.userId);
const logged = ref(false);
const userChannelId = ref();
const userChannelPostId = ref();
const fineMeErr = ref();
const favorites = ref();
const viewed = ref();
const liked = ref();
const unliked = ref();
const follows = ref();
const followed = ref();
const mm_profile = ref();
const storages = ref();

const getMeData = async () => {
  const _cache = await localforage.getItem("__strapi_me").catch((e) => {
    console.error(e);
  });
  if (_cache) {
    me.value = _cache;
    userId.value = _cache.id;
    logged.value = true;
    await getUserData();
  } else {
    const { loading, error, result: getMe } = findMe();
    watch([error, getMe], async () => {
      if (error.value && !getMe.value) {
        fineMeErr.value = error;
        userStore.$reset();
        ChannelStore.$reset();
        localStorage.clear();
      } else if (!error.value && getMe.value) {
        userId.value = Number(getMe.value?.me.id);
        logged.value = true;
        await getUserData();
        me.value = getMe.value?.me;
        await localforage.setItem(
          "__strapi_me",
          JSON.parse(JSON.stringify(me.value))
        );
      }
    });
  }
};
const matedata = ref();
// 获取用户资料，strapi中通过me获取到基础数据后，用户的详细数据需要使用usersPermissionsUser的query来获取
let refetchMe; // 如果调用 refetchMe 时，还有没 getUserData ，那么直接执行 getMeData;
export const getUserData = async (prop) => {
  const _cache = await localforage
    .getItem("__strapi_userMatedate")
    .catch((e) => {
      console.error(e);
    });
  if (_cache && !prop) {
    me.value = _cache;
    matedata.value = _cache;
  } else {
    const parmas = userStore.queryParmars;
    parmas.userId = userId.value;
    const { loading, error, result, refetch } = FindUserMatedate(parmas);
    watch(
      result,
      () => {
        if (result.value) {
          userStore.needRefetch = false; // 及时取消激活，否则会循环refetch
          logged.value = true;
          me.value = result.value?.usersPermissionsUser?.data?.attributes;
          matedata.value = result.value?.usersPermissionsUser?.data?.attributes;
          refetchMe = refetch;
        }
      },
      { immediate: true, deep: true }
    );
  }
};

watch(
  matedata,
  async () => {
    if (matedata.value) {
      // 登陆者频道ID
      userChannelId.value = matedata.value.user_channel?.data?.id ?? null;
      // 登陆者频道的Post ID
      userChannelPostId.value =
        matedata.value.user_channel?.data?.attributes.post?.data?.id ?? null;
      // 格式化登陆者资料
      profile.value = {
        username: matedata.value.username,
        email: matedata.value.email,
        confirmed: matedata.value.confirmed,
        blocked: matedata.value.blocked,
        description: matedata.value.profile?.description,
        bio: matedata.value.profile?.bio,
        avatar: matedata.value.profile?.avatar?.data?.attributes?.url,
        brand: matedata.value.profile?.brand?.data?.attributes?.url,
        cover: matedata.value.profile?.cover?.data?.attributes?.url,
      };
      // 用户登录之后就获取收藏夹、点赞、点踩内容，方便内容组件上判断如何显示图标
      // 之后前端直接操作本地数据，判断视图更新
      favorites.value = matedata.value.favorites?.data || [];
      viewed.value = matedata.value.viewed_elements?.data || [];
      liked.value = matedata.value.liked_element?.data || [];
      unliked.value = matedata.value.unliked_element?.data || [];
      follows.value = matedata.value.follows?.data;
      followed.value = matedata.value.followed?.data;
      mm_profile.value = matedata.value.mm_profile;
      storages.value = matedata.value.storages;

      // 填充userStore
      fill_userStore();
      await localforage.setItem(
        "__strapi_userMatedate",
        JSON.parse(JSON.stringify(matedata.value))
      );
      await localforage.getItem("__theme_style_dark").then(async (res) => {
        if (!res) {
          const isDark = matedata.value.config?.theme === "dark" ? true : false;
          Dark.set(isDark);
          await localforage.setItem("__theme_style_dark", isDark);
        }
      });
    }
  },
  { immediate: true, deep: true }
);
const fill_userStore = () => {
  // me字段
  userStore.me = me.value;
  userStore.followed = me.value.profile?.avatar?.data?.attributes.url;
  // Mattermost profile
  userStore.mm_profile = me.value.mm_profile;
  // 是否登录了
  userStore.logged = logged.value;
  // 登陆者ID
  userStore.userId = userId.value;
  // 登陆者的频道ID
  userStore.channelId = userChannelId.value;
  // 登陆者的POST-ID
  userStore.userChannelPostId = userChannelPostId.value;
  // 预读的登陆者收藏夹
  userStore.favorites = favorites.value;
  // 阅读历史
  userStore.viewed = viewed.value;
  // 点赞内容
  userStore.liked = liked.value;
  // 点踩内容
  userStore.unliked = unliked.value;
  // 我订阅的
  userStore.follows = follows.value;
  // 订阅我的
  userStore.followed = followed.value;
  // 我的存储
  userStore.storages = storages.value;
};

watch(
  jwt,
  async () => {
    if (jwt.value) {
      await getMeData();
    } else {
      logged.value = false;
    }
  },
  { immediate: true, deep: true }
);

// 手动触发重新请求
watch(
  userStore,
  async () => {
    if (userStore.needRefetch) {
      if(!refetchMe){
        await getUserData('force');
      } else {
        await refetchMe()
      }
      userStore.needRefetch = false; // 及时取消激活，否则会循环refetch
    }
  },
  { immediate: false, deep: true }
);

// 手动触发重新请求
watch(
  userStore.queryParmars,
  async () => {
    if(!refetchMe){
      await getUserData('force');
    } else {
      await refetchMe()
    }
    userStore.needRefetch = false; // 防止意外、取消激活重获取
  },
  { immediate: false, deep: true }
);

export default {
  logged,
  userId,
  me,
  profile,
  userChannelId,
  userChannelPostId,
  fineMeErr,
  favorites,
  viewed,
  liked,
  unliked,
  follows,
  followed,
  mm_profile
};
