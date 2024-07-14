<template>
  <div class="absolute-full column items-center" :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-2'" style="padding-top: 68px">
    <div
      class="container limit full-width q-space row no-wrap gap-md q-pa-md overflow-hidden"
    >
      <div class="column no-wrap gap-sm" style="flex: 0 0 12rem;">
        <q-list bordered class="q-pa-sm radius-sm" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-white'">
          <q-item clickable v-ripple
            class="radius-sm"
            :class="findElementsParams.filters == null || !activeId ? 'active-listitem text-white' : ''"
            @click="getAll()"
          >
            <q-item-section side>
              <q-icon :color="findElementsParams.filters == null || !activeId ? 'white' : 'primary'" name="explore" />
            </q-item-section>
            <q-item-section>综合</q-item-section>
          </q-item>
          <Gategory
            :filterIds="filterIds"
            :activedId="activeId"
            :belongedId="belongedId"
            :belongedName="belongedName"
            @setGetagory="setGetagory"
          />
        </q-list>
        <q-list v-if="follows && follows.length > 0" bordered class="q-pa-sm radius-sm" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-white'">
          <template v-for="(i,index) in follows" :key="index">
            <q-item
              v-if="i.attributes"
              class="radius-sm"
              :clickable="i.attributes?.user_channel?.data?.id && true || false"
              @click="i.attributes.user_channel?.data?.id && $router.push(`/${i.attributes.user_channel.data.id}`)"
            >
              <q-item-section side>
                <AutoAvatar
                  :size="32"
                  :attributes="i.attributes"
                />
              </q-item-section>
              <q-item-section>
                {{ i.attributes?.username || i.attributes?.email }}
              </q-item-section>
              <q-tooltip v-if="!i.attributes?.user_channel?.data?.id">
                该用户没有创建自己的频道
              </q-tooltip>
            </q-item>
          </template>
        </q-list>
      </div>
      <div class="q-space column no-wrap gap-sm radius-sm q-pl-sm q-pr-xs q-py-xs" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-white'">
        <q-toolbar class="transparent border-bottom">
          <q-tabs v-model="filterTab">
            <q-tab v-for="(i,index) in filterOptions" :key="index" inline-label
            :name="i.name" :label="i.label"
            @click="changeList()"
          />
          </q-tabs>
        </q-toolbar>
        <div :key="filterTab" class="q-space q-pr-sm scroll-y">
          <ListPage :elements="elements" />
          <q-btn
            v-if="meta?.pagination?.total > findElementsParams.pagination.page * pageSize"
            flat dense class="full-width q-my-sm" color="primary"
            icon="mdi-chevron-double-down" label="更多"
            @click="showMoreElements()"
          />
          <div v-else class="full-width q-my-sm flex flex-center op-5">没有更多内容了</div>
        </div>
      </div>
      <div class="column no-wrap gap-sm" style="flex: 0 0 16rem">
        <div v-if="popularizes.filter(item => item.attributes.position === 'homepage_right_top').length > 0" class="column no-wrap gap-sm">
          <template v-for="i in popularizes.filter(item => item.attributes.position === 'homepage_right_bottom')" :key="i.id">
            <a v-if="i.attributes" :href="i.attributes.uri" target="_blank" rel="noopener noreferrer">
              <q-card bordered flat>
                <template v-if="i.attributes.medias.data.length > 0">
                    <q-img
                      v-if="i.attributes.medias.data.length === 1"
                      :src="i.attributes.medias.data[0].attributes.url"
                      spinner-color="primary"
                      spinner-size="82px"
                    >
                      <section class="absolute-full column flex-center">
                        <span v-if="i.attributes.title" class="text-black font-bold-600 font-x-large">{{ i.attributes.title }}</span>
                        <span v-if="i.attributes.description" class="text-black font-bold-400 font-medium">{{ i.attributes.description }}</span>
                      </section>
                    </q-img>
                  <q-carousel
                    v-else
                    transition-prev="jump-right"
                    transition-next="jump-left"
                    swipeable
                    animated
                    control-color="white"
                    prev-icon="arrow_left"
                    next-icon="arrow_right"
                    navigation-icon="radio_button_unchecked"
                    navigation
                    padding
                    arrows
                    height="300px"
                    class="bg-purple text-white shadow-1 rounded-borders"
                  >
                    <q-carousel-slide v-for="img in i.attributes.medias.data" :key="img.id" name="style" class="column no-wrap flex-center">
                        <q-img
                          :src="img.attributes.url"
                          spinner-color="primary"
                          spinner-size="82px"
                        >
                        <section class="absolute-full column flex-center">
                          <span v-if="i.attributes.title" class="text-black font-bold-600 font-x-large">{{ i.attributes.title }}</span>
                          <span v-if="i.attributes.description" class="text-black font-bold-400 font-medium">{{ i.attributes.description }}</span>
                        </section>
                      </q-img>
                    </q-carousel-slide>
                  </q-carousel>
                </template>
              </q-card>
            </a>
          </template>
        </div>
        <q-card bordered flat>
          <q-card-section class="q-py-sm border-bottom">
            话题
          </q-card-section>
          <q-card-section class="row q-pa-xs">
            <Tags
              :readonly="true"
              :dense="true"
              :square="true"
              :inline="false"
              :selected="selectedTags || []"
              @putTag="putTag"
              :itemClass="`radius-sm`"
            />
          </q-card-section>
        </q-card>
        <div v-if="popularizes.filter(item => item.attributes.position === 'homepage_right_center').length > 0" class="column no-wrap gap-sm">
          <template v-for="i in popularizes.filter(item => item.attributes.position === 'homepage_right_bottom')" :key="i.id">
            <a v-if="i.attributes" :href="i.attributes.uri" target="_blank" rel="noopener noreferrer">
              <q-card bordered flat>
                <template v-if="i.attributes.medias.data.length > 0">
                    <q-img
                      v-if="i.attributes.medias.data.length === 1"
                      :src="i.attributes.medias.data[0].attributes.url"
                      spinner-color="primary"
                      spinner-size="82px"
                    >
                      <section class="absolute-full column flex-center">
                        <span v-if="i.attributes.title" class="text-black font-bold-600 font-x-large">{{ i.attributes.title }}</span>
                        <span v-if="i.attributes.description" class="text-black font-bold-400 font-medium">{{ i.attributes.description }}</span>
                      </section>
                    </q-img>
                  <q-carousel
                    v-else
                    transition-prev="jump-right"
                    transition-next="jump-left"
                    swipeable
                    animated
                    control-color="white"
                    prev-icon="arrow_left"
                    next-icon="arrow_right"
                    navigation-icon="radio_button_unchecked"
                    navigation
                    padding
                    arrows
                    height="300px"
                    class="bg-purple text-white shadow-1 rounded-borders"
                  >
                    <q-carousel-slide v-for="img in i.attributes.medias.data" :key="img.id" name="style" class="column no-wrap flex-center">
                        <q-img
                          :src="img.attributes.url"
                          spinner-color="primary"
                          spinner-size="82px"
                        >
                        <section class="absolute-full column flex-center">
                          <span v-if="i.attributes.title" class="text-black font-bold-600 font-x-large">{{ i.attributes.title }}</span>
                          <span v-if="i.attributes.description" class="text-black font-bold-400 font-medium">{{ i.attributes.description }}</span>
                        </section>
                      </q-img>
                    </q-carousel-slide>
                  </q-carousel>
                </template>
              </q-card>
            </a>
          </template>
        </div>
        <q-card bordered flat>
          <q-card-section class="q-py-sm border-bottom">
            牛人
          </q-card-section>
          <q-card-section class="q-pa-xs">
            <TopUsers />
          </q-card-section>
        </q-card>
        <div v-if="popularizes.filter(item => item.attributes.position === 'homepage_right_bottom').length > 0" class="column no-wrap gap-sm">
          <template v-for="i in popularizes.filter(item => item.attributes.position === 'homepage_right_bottom')" :key="i.id">
            <a v-if="i.attributes" :href="i.attributes.uri" target="_blank" rel="noopener noreferrer">
              <q-card bordered flat>
                <template v-if="i.attributes.medias.data.length > 0">
                    <q-img
                      v-if="i.attributes.medias.data.length === 1"
                      :src="i.attributes.medias.data[0].attributes.url"
                      spinner-color="primary"
                      spinner-size="82px"
                    >
                      <section class="absolute-full column flex-center">
                        <span v-if="i.attributes.content" v-html="marked(i.attributes.content)" class="text-black" />
                        <template v-if="!i.attributes.content">
                          <span v-if="i.attributes.title" class="text-black font-bold-600 font-x-large">{{ i.attributes.title }}</span>
                          <span v-if="i.attributes.description" class="text-black font-bold-400 font-medium">{{ i.attributes.description }}</span>
                        </template>
                      </section>
                    </q-img>
                  <q-carousel
                    v-else
                    transition-prev="jump-right"
                    transition-next="jump-left"
                    swipeable
                    animated
                    control-color="white"
                    prev-icon="arrow_left"
                    next-icon="arrow_right"
                    navigation-icon="radio_button_unchecked"
                    navigation
                    padding
                    arrows
                    height="300px"
                    class="bg-purple text-white shadow-1 rounded-borders"
                  >
                    <q-carousel-slide v-for="img in i.attributes.medias.data" :key="img.id" name="style" class="column no-wrap flex-center">
                        <q-img
                          :src="img.attributes.url"
                          spinner-color="primary"
                          spinner-size="82px"
                        >
                        <section class="absolute-full column flex-center">
                          <span v-if="i.attributes.title" class="text-black font-bold-600 font-x-large">{{ i.attributes.title }}</span>
                          <span v-if="i.attributes.description" class="text-black font-bold-400 font-medium">{{ i.attributes.description }}</span>
                        </section>
                      </q-img>
                    </q-carousel-slide>
                  </q-carousel>
                </template>
              </q-card>
            </a>
          </template>
        </div>
        <!-- {{ popularizes.filter(i => i.attributes.position == 'homepage_right_bottom') }} -->
      </div>
    </div>
  </div>
</template>
<script setup>
import { findElements, findPopularizes } from "src/apollo/api/api.js";
import { ref, watch, watchEffect } from "vue";
import ListPage from "src/pages/ChannelPage/Elements/ListPage.vue";
import Gategory from "src/components/VIewComponents/GategoryBlock.vue";
import Tags from "src/components/VIewComponents/TagBlock.vue";
import TopUsers from "src/components/VIewComponents/TopUsers.vue";
import AutoAvatar from 'src/components/VIewComponents/AutoAvatar.vue';
import useUserStore from 'src/stores/user.js';
import {marked} from 'marked'

const userStore = useUserStore();
const follows = ref();
const filterTab = ref('publishedAt');
const filterOptions = ref([
  {name:'publishedAt', icon: 'mail', label: '最新'},
  {name:'viewed_count', icon: 'mail', label: '最热'},
]);
const filterIds = ref();
const activeId = ref();
const belongedId = ref();
const belongedName = ref();
const selectedTags = ref([]);

const elements = ref();
const meta = ref();

const page = ref(1);
const pageSize = ref(12);

const findElementsParams = ref({
  pagination: {
    page: page.value,
    pageSize: pageSize.value,
  },
  sort: [`${filterTab.value || 'publishedAt'}:desc`],
  filters: null
});
const isIn = ref();
const putTag = (i) => {
  if(!findElementsParams.value.filters) {
    const filterTags = {tags: {id: {in: []}}}
    findElementsParams.value.filters = filterTags;
  }
  if(!findElementsParams.value.filters.tags) {
    const filterTags = {tags: {id: {in: []}}}
    findElementsParams.value.filters.tags = filterTags.tags;
  }
  let tagIds = Array.isArray(findElementsParams.value.filters.tags.id.in) && findElementsParams.value.filters.tags.id.in || [];
  isIn.value = tagIds.includes(i.id);
  if(isIn.value) {
    findElementsParams.value.filters.tags.id.in = findElementsParams.value.filters.tags.id.in.filter(item => item !== i.id);
    if(findElementsParams.value.filters.tags.id.in.length === 0) {
      delete findElementsParams.value.filters.tags;
      findElementsParams.value.filters = {...findElementsParams.value.filters}
    }
  } else {
    findElementsParams.value.filters.tags.id.in = [...findElementsParams.value.filters.tags.id.in, i.id];
  }
}
const changeList = () => {
  findElementsParams.value.pagination.page = 1;
  findElementsParams.value.sort = [`${filterTab.value}:desc`];
}

const isLoading = ref(false);
let fetchMoreElements;
let refetchElements;
const queryElements = () => {
  isLoading.value = true;
  // console.log('首页内容列表请求被触发');
  const { loading: ling, error, result, refetch, fetchMore } = findElements(
    findElementsParams.value
  );
  watch(
    result,
    () => {
      refetchElements = refetch;
      fetchMoreElements = fetchMore;
      elements.value = result.value?.elements?.data || [];
      meta.value = result.value?.elements.meta || {};
      isLoading.value = false;
    },
    { immediate: true, deep: true }
  );
};
const showMoreElements = async () => {
  let old = elements.value;
  findElementsParams.value.pagination.page++;
  console.log('加载第',findElementsParams.value.pagination.page,'页');
  fetchMoreElements({
    variables: findElementsParams.value,
    updateQuery: (previousResult, { fetchMoreResult }) => {
      if (!fetchMoreResult) return previousResult;
      elements.value = [...old, ...elements.value];
    },
  });
};

const setGetagory = (id,name,belongId,ids) => {
  findElementsParams.value.filters = {
    category: {
      id: {
        in: ids
      }
    }
  };
  filterIds.value = ids;
  activeId.value = id;
  belongedId.value = belongId;
  belongedName.value = name;
};
watchEffect(() => {
  follows.value = userStore.follows;
  selectedTags.value = Array.isArray(findElementsParams.value.filters?.tags?.id?.in) && findElementsParams.value.filters.tags.id.in || [];
});

watch(userStore,() => {
  if(userStore.readingCategory) {
    let category = userStore.readingCategory;
    setGetagory(category.id, category.name, category.belong, category.ids);
    userStore.readingCategory = null;
  }
  if(userStore.readingTags && userStore.readingTags.length > 0) {
    let filterTag = { tags: {id: {in: userStore.readingTags}}}
    findElementsParams.value.filters = filterTag;
    userStore.readingTags = [];
  }
},{immediate:true,deep:true})

const getAll = () => {
  findElementsParams.value.filters = null;
  belongedId.value = null;
  belongedName.value = null;
  filterIds.value = null;
  activeId.value = null;
}

queryElements();
// 滚动到底部加载下一页事件，
// 问题：触发时会一次加载多页，暂时禁用
// const scrollEvent = (e) => {
//   const { scrollTop, offsetHeight, scrollHeight } = e.target;
//   setTimeout(() => {
//     console.log(scrollTop, offsetHeight, scrollHeight);
//     if (
//       scrollTop + offsetHeight >= scrollHeight - 10 &&
//       meta.value?.pagination.total > findElementsParams.value.pagination.page * pageSize.value &&
//       !isLoading.value
//     ) {
//       showMoreElements();
//     }
//   }, 1000);
// }

const popularizes = ref();
const queryPopularizes = () => {
  const { loading, error, result } = findPopularizes();
  watch(
    result,
    () => {
      popularizes.value = result.value?.popularizes?.data || [];
    },
    { immediate: true, deep: true }
  );
};
queryPopularizes();
</script>
