<template>
  <div class="fit column no-wrap full-width">
    <q-toolbar class="transparent border-bottom">
      <q-tabs v-model="tab" inline-label no-caps>
        <q-tab name="myCards" icon="mdi-cards" label="我的微名片" />
        <q-tab name="myFavCards" icon="mdi-bookmark-plus" label="收藏夹" />
      </q-tabs>
    </q-toolbar>
    <div v-if="tab == 'myCards'" class="q-space row no-wrap gap-md">
      <div class="column no-wrap">
        <q-btn color="primary" flat dense icon="mdi-plus" class="full-width" align="left"
          :label="addingCard ? '取消添加' : '添加微名片'"
          @click="addingCard = !addingCard"
        />
        <q-input square dense filled v-model="filterText" type="text" label="搜索微名片" class="q-my-xs" />
        <q-scroll-area style="min-width: 16rem;" class="q-space">
          <q-list v-if="myBizCards?.length>0" class="full-width q-py-md">
            <q-item
              v-for="(i) in myBizCards"
              :key="i.id"
              clickable
              v-ripple
              @click="(addingCard = false), (cardData = i),active = i.id"
              @dblclick="editting = !editting"
              class="radius-sm hovered-item"
              :class="`${active == i.id ? 'active-listitem text-white text-bold-600' : ''}`"
            >
              <q-item-section side>
                <q-avatar
                  v-if="i.attributes?.avatar?.data?.attributes.url"
                  size="2rem"
                >
                  <q-img
                    :src="i.attributes.avatar.data.attributes.url"
                    :ratio="1"
                    spinner-color="primary"
                    spinner-size="1rem"
                  />
                </q-avatar>
                <q-avatar
                  v-else
                  size="2rem"
                  font-size="1.2rem"
                  text-color="white"
                  class="border"
                  :style="`background-color: ${i.attributes?.name &&
                    genTextAvatar(i.attributes.name)?.colorCode
                  };`"
                >
                  <span>{{ i.attributes?.name && genTextAvatar(i.attributes.name)?.char }}</span>
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ i.attributes?.title }}</q-item-label>
                <q-item-label lines="1" class="op-5">{{
                  i.attributes?.name
                }}</q-item-label>
              </q-item-section>
              <q-item-section side top>
                <SetDefault
                  :userId="userId"
                  :bizCardId="i.id"
                  :defatltBizcardId="defatltBizcardId"
                  @defaultBizcardSet="defaultBizcardSet"
                />
              </q-item-section>
            </q-item>
            <q-btn v-if="hasMoreBizcards" color="primary" dense flat icon="mdi-chevron-double-down" label="更多" class="full-width q-mt-sm" @click="showMorBizcards" />
            <span v-if="!hasMoreBizcards && findBizcardsByUserIDParmars.pagination.page != 1" class="full-width q-mt-sm font-small op-5 flex flex-center">已经到底了</span>
          </q-list>
        </q-scroll-area>
      </div>
        <div class="q-space column no-wrap flex-center q-py-xl">
          <div v-if="myBizCards" class="fit" style="max-width: 960px; min-height: 28rem">
            <bizCard
              v-if="cardData && !addingCard && !editting"
              :cardData="cardData"
              :canMotify="canMotify"
            />
            <CreateBizcard
              v-if="addingCard"
              @bizcardCreated="bizcardCreated"
              @bizcardCannelCreated="bizcardCannelCreated"
            />
            <UpdateBizcard
              v-if="canMotify && editting"
              :cardData="cardData"
              @bizcardUpdate="bizcardUpdate"
              @cannelUpdate="editting = false"
            />
            <div v-if="canMotify" class="row">
              <q-space />
              <q-btn
                v-if="cardData && !editting && !addingCard"
                color="primary"
                flat
                :label="editting ? '放弃修改' : '修改名片'"
                @click="editting = !editting"
              />
            </div>
          </div>
        </div>
    </div>
    <div v-if="tab == 'myFavCards'" class="row no-wrap gap-md">
        <q-scroll-area style="min-width: 12rem; min-height: 28rem">
          <q-list class="full-width q-py-md">
            <q-item
              v-for="(i,index) in myFavBizCards"
              :key="i.id"
              clickable
              v-ripple
              @click="cardDataOfmyfav = i.attributes.bizcard.data,activeCol = index"
              class="radius-sm"
              :class="activeCol == index ? 'active-listitem text-white text-bold-600' : ''"
            >
              <q-item-section side>
                <q-avatar size="2rem">
                  <q-img
                    :src="
                      i.attributes.bizcard.data.attributes.avatar.data
                        .attributes.url
                    "
                    :ratio="1"
                    spinner-color="primary"
                    spinner-size="1rem"
                  />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ i.attributes.title }}</q-item-label>
                <q-item-label lines="1">{{ i.attributes.name }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-btn v-if="hasMoreFavBizcards" color="primary" dense flat icon="mdi-chevron-double-down" label="更多" class="full-width q-mt-sm" @click="showMorFavBizcards" />
            <span v-if="!hasMoreBizcards && findBizcardsByUserIDParmars.bizcardCollectionItemsPagination.page != 1" class="full-width q-mt-sm font-small op-5 flex flex-center">已经到底了</span>
          </q-list>
        </q-scroll-area>
        <div class="q-space flex flex-center q-py-xl">
          <div class="fit" style="max-width: 960px;">
            <bizCard v-if="cardDataOfmyfav" :cardData="cardDataOfmyfav" />
          </div>
        </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
import { findBizcardsByUserID } from "src/apollo/api/api.js";
import useUserStore from "src/stores/user.js";
import bizCard from "src/pages/BizCard/components/BizCard.vue";
import CreateBizcard from "src/pages/BizCard/components/CreateBizcard.vue";
import UpdateBizcard from "src/pages/BizCard/components/UpdateBizcard.vue";
import SetDefault from "src/pages/BizCard/components/SetDefault.vue";
import { genTextAvatar } from "src/hooks/global/useGenTextAvatar.js";
import { computed } from "vue";
import { watchEffect } from "vue";

const userStore = useUserStore();
const tab = ref("myCards");

const addingCard = ref(false);
const active = ref();
const activeCol = ref();

const userId = computed(() => userStore.userId?.toString());
const myBizCards = ref([]);
const myFavBizCards = ref([]);
const canMotify = ref(false);
const cardData = ref();
const cardDataOfmyfav = ref();
const findBizcardsByUserIDParmars = ref({
  usersPermissionsUserId: null,
  pagination: {
    page: 1,
    pageSize: 12,
  },
  bizcardCollectionItemsPagination: {
    page: 1,
    pageSize: 12,
  },
});

const filterText = ref()
const filters = ref({
  filters: {
    or: [
      {
        name: {
          containsi: filterText.value,
        },
        title: {
          containsi: filterText.value,
        },
        alias: {
          containsi: filterText.value,
        },
        address: {
          containsi: filterText.value,
        },
        phone: {
          containsi: filterText.value,
        },
        description: {
          containsi: filterText.value,
        },
        email: {
          containsi: filterText.value,
        },
      },
    ],
  },
});

let refetchBizcards;
let fetchMoreBizcards;
const oldBizcardsData = ref();
const hasMoreBizcards = ref(false);
const hasMoreFavBizcards = ref(false);
const queryBizCards = async () => {
  const { loading, error, result, refetch, fetchMore: fm } = findBizcardsByUserID(
    findBizcardsByUserIDParmars.value
  );
  refetchBizcards = refetch;
  fetchMoreBizcards = fm;
  watch(
    result,
    () => {
      if (result.value) {
        oldBizcardsData.value = result.value;
        myBizCards.value =
          result.value?.usersPermissionsUser?.data?.attributes.bizcards.data ||
          [];
        myFavBizCards.value =
          result.value?.usersPermissionsUser?.data?.attributes
            .bizcard_collection_items.data || [];
        hasMoreBizcards.value = myBizCards.value.length == findBizcardsByUserIDParmars.value.pagination.page * findBizcardsByUserIDParmars.value.pagination.pageSize;
        hasMoreFavBizcards.value = myBizCards.value.length == findBizcardsByUserIDParmars.value.bizcardCollectionItemsPagination.page * findBizcardsByUserIDParmars.value.bizcardCollectionItemsPagination.pageSize;
      }
    },
    { immediate: true, deep: true }
  );
};
const tmp = ref();
const showMorBizcards = () => {
    // page.value++;
    findBizcardsByUserIDParmars.value.pagination.page++;
    fetchMoreBizcards({
      variables: findBizcardsByUserIDParmars.value,
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previousResult;
        tmp.value = fetchMoreResult.usersPermissionsUser.data.attributes.bizcards.data.length;
        return {
          usersPermissionsUser: {
            ...oldBizcardsData.value.usersPermissionsUser,
            data: {
              ...oldBizcardsData.value.usersPermissionsUser.data,
              attributes: {
                ...oldBizcardsData.value.usersPermissionsUser.data.attributes,
                bizcards: {
                  ...oldBizcardsData.value.usersPermissionsUser.data.attributes.bizcards,
                  data: [
                    ...oldBizcardsData.value.usersPermissionsUser.data.attributes.bizcards.data,
                    ...fetchMoreResult.usersPermissionsUser.data.attributes.bizcards.data
                  ]
                }
              }
            }
          }
        };
      },
    });
};
const showMorFavBizcards = () => {
  // page.value++;
  findBizcardsByUserIDParmars.value.bizcardCollectionItemsPagination.page++;
  fetchMoreBizcards({
    variables: findBizcardsByUserIDParmars.value,
    updateQuery: (previousResult, { fetchMoreResult }) => {
      if (!fetchMoreResult) return previousResult;
      return {
        usersPermissionsUser: {
          ...oldBizcardsData.value.usersPermissionsUser,
          data: {
            ...oldBizcardsData.value.usersPermissionsUser.data,
            attributes: {
              ...oldBizcardsData.value.usersPermissionsUser.data.attributes,
              bizcard_collection_items: {
                ...oldBizcardsData.value.usersPermissionsUser.data.attributes.bizcard_collection_items,
                data: [
                  ...oldBizcardsData.value.usersPermissionsUser.data.attributes.bizcard_collection_items.data,
                  ...fetchMoreResult.usersPermissionsUser.data.attributes.bizcard_collection_items.data
                ]
              }
            }
          }
        }
      };
    },
  });
};
const bizcardCreated = (val) => {
  // 关闭新建状态
  addingCard.value = false;
  // 指定正在查看的Card为刚刚新建的
  active.value = val.id;
  // 重新获取数据
  refetchBizcards();
};
const bizcardCannelCreated = () => {
  addingCard.value = false;
};
const editting = ref(false);
const defatltBizcardId = ref();
const defaultBizcardSet = (val) => {
  defatltBizcardId.value = val;
};
const bizcardUpdate = () => {
  editting.value = false;
  refetchBizcards();
}
watch(userId, () => {
    if (userId.value) {
      findBizcardsByUserIDParmars.value.usersPermissionsUserId = userId.value;
      defatltBizcardId.value = userStore.me.config?.default_bizcard?.data?.id || null;
      !active.value && defatltBizcardId.value && (active.value = defatltBizcardId.value)
      queryBizCards();
    }
  }, { immediate: true, deep: false }
);
watchEffect(() => {
  canMotify.value = myBizCards.value?.map(i => i.id)?.includes(active.value);
  cardData.value = myBizCards.value?.find(i => i.id === active.value)
})

watch(filterText,() => {
    if(filterText.value) {
        findBizcardsByUserIDParmars.value.filters = filters.value;
        setTimeout(() => {
            queryBizCards();
        }, 600);
    }
},{ immediate: false, deep: true });
</script>
