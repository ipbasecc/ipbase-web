<template>
    <q-layout container view="lHh LpR lFf"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
    >
        <q-drawer v-model="uiStore.newsLeftDrawer"
            :width="navDrawerWidth" side="left"
            class="column no-wrap q-pa-sm"
        >
            <q-scroll-area class="q-space">
                <AddingNewsCard v-if="createNews"
                    @newsCreated="newsCreated"
                />
                <EdittingNewsCard v-else-if="teamStore.edit_news"
                    @newsUpdated="newsUpdated"
                />
                <NewsList v-else />
            </q-scroll-area>
            <q-btn v-if="!teamStore.edit_news" @click="toggleAddnews()"
                :icon="!createNews ? 'mdi-plus' : 'mdi-close'" flat class="border"
                :label="!createNews ? $t('add_team_news') : $t('cancel')"
            />
        </q-drawer>

        <q-page-container>
            <q-page>
                <div
                    class="absolute-left full-height hover-col-resize flex flex-center toggle-container z-max"
                    :class="dragWidth ? 'bg-primary ' : ''"
                    :style="dragWidth ? 'width: 3px' : 'width: 10px'"
                    @mousedown="handleMouseDown"
                >
                    <q-icon
                        :name="`mdi-chevron-${uiStore.newsLeftDrawer ? 'left' : 'right'}`"
                        color="primary"
                        size="sm"
                        @click="toggleLeftDrawer()"
                        class="cursor-pointer toggle-btn transition z-max"
                        :style="`transform: translateX(${
                            uiStore.newsLeftDrawer ? -16 : 12
                        }px)`"
                    >
                    <q-tooltip class="border" :class="$q.dark.mode ? 'bg-darker text-white' : 'bg-grey-1 text-black'">
                        shift + {{ uiStore.newsLeftDrawer ? '<' : '>' }}
                    </q-tooltip>
                    </q-icon>
                </div>
                <template v-if="createNews">
                    <TipTap
                        :editable="useAuths('create', ['news'])"
                        :jsonContent="teamStore.adding_news?.jsonContent"
                        :withSaveBtb="true"
                        need="json"
                        @tiptapBlur="syncContent"
                    />
                </template>
                <template v-else-if="teamStore.edit_news">
                    <TipTap
                        :editable="useAuths('modify', ['news'])"
                        :jsonContent="teamStore.edit_news?.jsonContent"
                        :withSaveBtb="true"
                        need="json"
                        :contentChanged
                        @contentChanged="contentChanged = true"
                        @tiptapBlur="updateNews"
                    />
                </template>
                <router-view v-else />
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { updateDocument } from 'src/api/strapi/project.js'
import { useNews } from './useNews.js'
import {useMouse} from "@vueuse/core";
import {uiStore, teamStore} from "src/hooks/global/useStore.js";
import NewsList from './NewsList.vue'
import TipTap from 'src/components/Utilits/tiptap/TipTap.vue'
import localforage from 'localforage';
import AddingNewsCard from './AddingNewsCard.vue'
import EdittingNewsCard from './EdittingNewsCard.vue'

const { openNews } = useNews();
const createNews = ref(false);
const disableDragWidth = ref(false);
const cacheListWidth = ref();
const toggleAddnews = () => {
    createNews.value = !createNews.value;
    if(createNews.value) {
        cacheListWidth.value = navDrawerWidth.value;
        navDrawerWidth.value = navDrawerWidth.value + 18;
        disableDragWidth.value = true;
    } else {
        navDrawerWidth.value = cacheListWidth.value;
        disableDragWidth.value = false;
    }
}
const adding_news = computed(() => teamStore.adding_news);
const cacheAdding = async (val) => {
    const cacheVal = JSON.parse(JSON.stringify(val));
    await localforage.setItem('adding_news', cacheVal)
}
const removeAddingCache = async () => {
    await localforage.removeItem('adding_news')
}
watch(adding_news, async () => {
    if(adding_news.value) {
        cacheAdding(adding_news.value)
    }
},{immediate: false, deep: true})

const autoTitle = () => {
    if(!teamStore.adding_news.title && teamStore.adding_news.jsonContent){
        const heading = teamStore.adding_news.jsonContent.content?.find(i => i.type === 'heading');
        if(heading) {
            const title = heading.content?.find(i => i.type === 'text');
            teamStore.adding_news.title = title?.text;
        }
    }
}
const syncContent = async (jsonVal) => {
    teamStore.adding_news.jsonContent = jsonVal;
    autoTitle();
}
const closeCreate = () => {
    teamStore.adding_news = {
      title: void 0,
      cover: void 0,
      jsonContent: void 0,
    }
    removeAddingCache();
}
const newsCreated = (val) => {
    teamStore.news.push(val);
    closeCreate();
    toggleAddnews();
}

const contentChanged = ref(false);
const updateNews = async (jsonVal) => {
    if(!jsonVal || jsonVal === teamStore.edit_news.jsonContent) return;
    teamStore.edit_news.jsonContent = jsonVal;
    const params = {
        team_id: teamStore.team?.id,
        data: {
            jsonContent: teamStore.edit_news.jsonContent
        }
    }
    const news_id = teamStore.edit_news.id;
    const { data } = await updateDocument(news_id, params);
    if(data){
        teamStore.news.find(i => i.id === data.id).jsonContent = data.jsonContent;
        contentChanged.value = false;
    }
}
// const newsUpdated = (val) => {
//     let _news = teamStore.news.find(i => i.id === val.id);
//     _news = val;
//     openNews(_news)
// }
const newsUpdated = (val) => {
    const index = teamStore.news.findIndex(i => i.id === val.id);
    if (index !== -1) {
        // 使用索引来更新数组中的元素
        teamStore.news[index] = val;
        teamStore.edit_news = null;
        openNews(val); // 调用 openNews 函数
    }
}

const toggleLeftDrawer = () => {
    uiStore.newsLeftDrawer = !uiStore.newsLeftDrawer
}
const navDrawerWidth = ref(320);
const { x } = useMouse({ touch: false });
const navDrawerMinWidth = ref(280);
const navDrawerMaxWidth = ref(640);
const _ori_width = ref();
const dragWidth = ref(false);
const position = reactive({
  x: NaN,
  y: NaN,
});
const handleMouseDown = () => {
  position.x = x.value;
  dragWidth.value = true;
  _ori_width.value = navDrawerWidth.value;
  uiStore.dragging = true;
};
const handleMouseUp = () => {
  dragWidth.value = false;
  uiStore.dragging = false;
};
const handleMouseMove = () => {
  if (!position.x || !dragWidth.value || !_ori_width.value) return;

  const deltaX = x.value - position.x;
  if (
    _ori_width.value + deltaX >= navDrawerMinWidth.value &&
    _ori_width.value + deltaX <= navDrawerMaxWidth.value
  ) {
    navDrawerWidth.value = _ori_width.value + deltaX;
  } else if (_ori_width.value + deltaX > navDrawerMaxWidth.value) {
    navDrawerWidth.value = navDrawerMaxWidth.value;
  } else if (_ori_width.value + deltaX === navDrawerMaxWidth.value) {
    navDrawerWidth.value = navDrawerMinWidth.value;
  } else if (_ori_width.value + deltaX < 50) {
    uiStore.newsLeftDrawer = false;
  }
};

</script>