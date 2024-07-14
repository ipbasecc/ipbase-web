<template>
    <div class="full-width column no-wrap">
        <template v-if="elements && doing == 'reading'">
            <q-toolbar :class="searchElements ? 'border-bottom' : ''">
                <q-btn
                    flat dense color="primary" class="q-px-md"
                    :icon="sort == 'desc' ? 'mdi-sort-descending' : 'mdi-sort-ascending'"
                    :label="sort == 'desc' ? '最新' : '最早'"
                    @click="toggleSort"
                />
                <q-btn flat dense icon="mdi-refresh" color="primary" label="刷新" @click="refetchElements()" />
                <q-space />
                <q-input
                    v-if="searchElements"
                    v-model="filterText"
                    dense
                    filled
                    square
                    type="text"
                    @keyup.enter = 'searchElementsFn'
                    @keyup.esc = "filterText = '', searchElements = false"
                >
                    <template v-slot:append>
                    <q-btn v-if="!filterText" flat round dense size="sm" icon="search" @click="searchElements = false" />
                    <q-btn v-else flat round dense size="sm" icon="search" @click="searchElementsFn" />
                    </template>
                </q-input>
                <q-btn v-if="!searchElements" flat round dense size="sm" icon="search" color="primary" @click="searchElements = true" />
                <q-btn v-if="canEdit" flat round dense color="primary" class="q-px-md" icon="mdi-plus" @click="doing = 'creating'" />
            </q-toolbar>
            <div v-if="elements" class="q-px-md q-pb-md">
                <ListPage :elements="elements" />
                <q-btn v-if="hasMore" flat dense class="full-width" color="primary" icon="mdi-chevron-double-down" label="更多" @click="showMoreElements()" />
                <div v-else class="full-width flex flex-center op-5">没有更多内容了</div>
            </div>
        </template>
        <AddElement v-if="doing == 'creating'" @closeCreate="closeCreate" />
    </div>
</template>
<script setup>
import { findElements } from "src/apollo/api/api.js";
import { ref, watch, toRef, watchEffect } from "vue";
import useChannelStore from 'src/stores/channel.js';
import AddElement from 'src/pages/ChannelPage/Elements/Components/AddElement.vue';
import ListPage from 'src/pages/ChannelPage/Elements/ListPage.vue';
import useUserStore from "src/stores/user.js";
import { useRoute } from 'vue-router'

const props = defineProps({
    where: {
        type: String,
        default: ''
    }
});
const whereRef = toRef(props,'where')

const route = useRoute();

const userStore = useUserStore();
const logged = ref(userStore && userStore.logged);
const userId = ref(userStore && userStore.userId);
const channelStore = useChannelStore();

const channel_ownerId = ref();

watch(channelStore,() => {
    channel_ownerId.value = channelStore.channel_ownerId;
    },{immediate: true, deep: true}
);

const queryId = ref(whereRef.value == 'userCenter' ? userId.value : channel_ownerId.value);
const canEdit = ref(whereRef.value == 'userCenter' || (logged.value && userId.value == channel_ownerId.value));

const doing = ref('reading');

const sort = ref('desc');
const toggleSort = () => {
    sort.value = sort.value == 'desc' ? 'asc' : 'desc';
    findElementsParmas.value.sort = [`publishedAt:${sort.value}`];
    findElementsParmas.value.pagination.page = 1
    refetchElements();
};

const meta = ref();
const page = ref(1);
const pageSize = ref(12);
const filterText = ref();
const filterType = ref();
const filterAuthor = ref({ author: { id: { eq: channel_ownerId.value }}});
watchEffect(() => {
    filterType.value = ref(whereRef.value == 'userCenter' ? route.meta && route.meta.type : route.name);
})
const findElementsParmas = ref({
    sort: [`publishedAt:${sort.value}`],
    pagination: {
        page: page.value,
        pageSize: pageSize.value,
    },
    filters: {
        and: [
            filterAuthor.value,
            { type: { eq: filterType.value } },
            { title: { containsi: filterText.value || '' } }
        ]
    },
    filterEveryBy: {
        id: {
            eq: userStore.userId // 赞 踩 查看、都只返回当前用户的，如果有数据，说明看过/赞过/踩过
        }
    },
    filterFavoriteBy: {
        owner: {
            id: {
                eq: userStore.userId // 只返回所有者是当前用户的收藏夹，如果有数据，说明当前内容被当前用户收藏过
            }
        }
    }
});
const elements = ref([]);
let refetchElements;
let fetchMoreElements;
const hasMore = ref(true);
const getElements = () => {
    const { loading, error, result, refetch:rf, fetchMore: fm }
        = findElements(findElementsParmas.value);
    refetchElements = rf;
    fetchMoreElements = fm;
    watch(result,() => {
        if(result.value) {
            elements.value = result.value?.elements?.data || [];
            meta.value = result.value?.elements.meta || {};
        }
    },{immediate: true, deep: true});
};
const showMoreElements = async () => {
    let old = elements.value;
    findElementsParmas.value.pagination.page++;
    fetchMoreElements({
        variables: findElementsParmas.value,
        updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previousResult;
        elements.value = [...old, ...elements.value];
        },
    });
    
};
watchEffect(() => {
    hasMore.value = elements.value?.length < meta.value?.pagination.total;
});

watch([queryId,filterType],() => {
    if(queryId.value && filterType.value) {
        findElementsParmas.value.filters = {
            and: [
                filterAuthor.value,
                { type: { eq: filterType.value } },
                { title: { containsi: filterText.value || '' } }
            ]
        }
        getElements();
    }
    },{immediate: true, deep: true}
);

const searchElements = ref(false)
const searchElementsFn = () => {
    findElementsParmas.value.filters = {
        and: [
            filterAuthor.value,
            { type: { eq: filterType.value } },
            { title: { containsi: filterText.value } }
        ]
    }
    getElements();
}
watch(filterText,() => {
    if(filterText.value) {
        setTimeout(() => {
            searchElementsFn();
        }, 600);
    } else {
        searchElementsFn();
    }
})

const closeCreate = () => {
    refetchElements();
    doing.value = 'reading';
}

</script>
<style scoped>
.article {
    background-color: rgba(189, 189, 189, 0);
}
.article:hover {
    background-color: rgba(189, 189, 189, 0.2);
}
</style>
