import { defineStore } from "pinia";

const queryParmars = {
  // 收藏夹内条目
  bizcardCollectionItemsPagination: {
    page: 1,
    pageSize: 999,
  },
  // follow我的用户
  followsPagination2: {
    page: 1,
    pageSize: 999,
  },
  // 喜欢的element条目
  favoritesPagination: {
    page: 1,
    pageSize: 999,
  },
  // 用户微名片列表条目
  bizCardsPagination: {
    page: null,
    pageSize: null,
  },
  // 我follow的用户
  followedPagination2: {
    page: null,
    pageSize: null,
  },
  // 我点赞的
  likedElementPagination2: {
    page: null,
    pageSize: null,
  },
  // 我点踩的
  unlikedElementPagination2: {
    page: null,
    pageSize: null,
  },
  // 我看过的
  viewedElementsPagination2: {
    page: null,
    pageSize: null,
  },
  // 看过的内容的排序参数
  viewedElementsSort: null,
  viewedElementsFilters: {
    and: [
      {
        title: {
          containsi: null,
        },
        type: {
          in: null,
        },
      },
    ],
  },
};

export default defineStore("user", {
  state: () => ({
    logged: false,
    needRefetch: false, //当前登陆用户自身数据改变时，需要重新获取数据时激活此处
    userId: null,
    userMatedate: null,
    channelId: null, //登陆者的频道ID
    userChannelPostId: null,
    me: null,
    init: null,
    profile: null,
    avatar: "", // 暂时使用Mattermost头像
    brand: "",
    cover: "",
    config: null,
    self_tags: [],
    mm_profile: null,
    favorites: [], //登陆者的收藏夹，可以有多个收藏夹，收藏夹下关联收藏的内容
    viewed: null, // 查看过的内容，读取用户的内容来判断是否读过，用户内容数据量小，效率更好
    liked: null, // 点赞的内容，读取用户的内容来判断是否点赞过，用户内容数据量小，效率更好
    unliked: null, // 点踩的内容，读取用户的内容来判断是否点踩过，用户内容数据量小，效率更好
    follows: null,
    followed: null,
    readingCategory: null,
    readingTags: [],
    queryParmars: queryParmars,
    replyTo: null,
    storages: null,
    todogroups: void 0,
    affairsFilters: null,
    affairsFilterIDs: [],
  }),
  persist: true,
  actions: {
    async $waitRestore(){
      await this.$restore();
    },
    $reset() {
      this.logged = false;
      this.needRefetch = false;
      this.userId = null;
      this.userMatedate = null;
      this.channelId = null;
      this.userChannelPostId = null;
      this.me = null;
      this.profile = null;
      this.avatar = "";
      this.mm_profile = null;
      this.favorites = null;
      this.viewed = null;
      this.liked = null;
      this.unliked = null;
      this.follows = null;
      this.followed = null;
      this.readingCategory = null;
      this.readingTags = [];
      this.replyTo = null;
      this.storages = null;
    },
    $process(_init) {
      this.logged = true;
      this.me = _init;
      this.userId = _init.id;
      this.init = _init;
      this.profile = _init.profile;
      this.avatar = _init.profile?.avatar?.url;
      this.brand = _init.profile?.brand;
      this.cover = _init.profile?.cover?.url;
      this.config = _init.config;
      this.self_tags = _init.self_tags;
      this.mm_profile = _init.mm_profile;
      this.channelId = _init.user_channel?.id || void 0;
      this.userChannelPostId = _init.user_channel?.post?.id || void 0;
    }
  },
});
