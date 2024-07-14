<template>
  <div v-if="!editting" class="full-width row radius-xs border no-wrap radius-xs" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-grey-1'">
    <template v-if="cardDataRef">
      <div class="col-5 column no-wrap flex-center q-pa-md relative-position">
        <q-avatar v-if="item.avatar" size="100px" class="radius-full border q-mb-lg">
          <q-img
            :src="item.avatar"
            :ratio="1"
            spinner-color="primary"
            spinner-size="82px"
            fit="cover"
          />
        </q-avatar>
        <q-avatar
            v-else size="100px" font-size="44px" text-color="white" class="radius-full border q-mb-lg"
            :style="`background-color: ${genTextAvatar(item.name).colorCode};`"
        >
            <span>{{ genTextAvatar(item.name).char }}</span>
        </q-avatar>
        <div class="font-large font-bold-600">{{ item.name }}</div>
        <div class="font-large font-bold-600">{{ item.title }}</div>
        <div class="font-medium">{{ item.description }}</div>
        <div class="font-medium">{{ item.email }}</div>
        <div class="font-medium">{{ item.phone }}</div>
        <div class="font-medium">{{ item.address }}</div>
        <div v-if="canFav" class="absolute-top-right q-pa-md">
          <AddMyfav
            :userId="userId" :bizCardId="cardDataRef.id" :cardName="item.name" :comment="item.title"
            @favCardAdded="favCardAdded"
          />
        </div>
      </div>
      <div class="q-space column no-warp border-left" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-grey-3'">
        <div class="full-width row border-bottom">
          <q-tabs v-model="defaultProvider" dense inline-label no-caps shrink>
            <q-tab
              v-for="(i, index) in item.providers"
              :key="index"
              :name="i.title"
              class="q-px-sm"
            >
              <q-avatar v-if="i.provider_icon.data?.attributes.url" size="1.2rem">
                <q-img
                  :src="i.provider_icon.data?.attributes.url"
                  :ratio="1"
                  spinner-color="primary"
                  spinner-size="0.7rem"
                />
              </q-avatar>
              <span :class="i.provider_icon.data?.attributes.url ? 'q-ml-sm' : ''">{{ i.title }}</span>
            </q-tab>
          </q-tabs>
          <q-space />
        </div>
        <q-tab-panels v-model="defaultProvider" animated class="q-space transparent">
          <q-tab-panel
            v-for="(i, index) in item.providers"
            :key="index"
            :name="i.title"
            class="column flex-center"
            @mouseenter="toggleSetDefaultProvider(true)"
            @mouseleave="toggleSetDefaultProvider(false)"
          >
            <q-img
              v-if="i.invite_qrcode.data?.attributes.url"
              :src="i.invite_qrcode.data?.attributes.url"
              :ratio="1"
              spinner-color="primary"
              spinner-size="82px"
              fit="contain"
            />
            <template v-if="canMotify && showMotifywarpper && i.invite_qrcode" >
              <div class="absolute-full bg-black op-7" />
              <div class="absolute-full flex flex-center">
                <q-btn
                  round
                  dense
                  color="primary"
                  :icon="item.default_provider == i.title ? 'mdi-star' : 'mdi-star-outline'"
                  @click="SetDefaultProvider(cardDataRef.id,i.title)"
                />
              </div>
            </template>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </template>
    <q-card v-else flat class="full-width q-pa-lg">
      <q-card-section class="q-py-xl flex flex-center">
        该用户未设置“微名片” 或 不愿展示自己的“微名片”
      </q-card-section>
    </q-card>
  </div>
</template>
<script setup>
import { ref, toRef, watch } from "vue";
import { UpdateBizcardDefaultProvider } from "src/apollo/api/api.js";
import AddMyfav from "src/pages/BizCard/components/AddMyfav.vue";
import useUserStore from "src/stores/user.js";
import { genTextAvatar } from "src/hooks/global/useGenTextAvatar.js";
const userStore = useUserStore();

const props = defineProps({
  cardData: {
    type: Object,
    default() {
      return {};
    },
  }
});
const canMotify = ref(false);
const canFav = ref(false);
const userId = ref();
const cardDataRef = toRef(props, "cardData");
const item = ref({});
const defaultProvider = ref();
const editting = ref(false);
const SetDefaultProvider = (cardID,Provider) => {
  if(!canMotify.value){
    return
  }
  if(Provider == item.value.default_provider) {
    return
  }

  const UpdateBizcardDefaultProviderParams = ref({
    updateBizcardId: cardID,
    data: {
      default_provider: Provider,
    },
  });
  const {
    mutate: UpdateBizcardDefaultProviderMutate,
    onDone,
    onError,
  } = UpdateBizcardDefaultProvider(UpdateBizcardDefaultProviderParams);

  UpdateBizcardDefaultProviderMutate();
  item.value.default_provider = Provider;
};

const tmp = ref()
watch(
  [userStore,cardDataRef],
  () => {
    if (userStore && cardDataRef.value) {
      userId.value = userStore.userId.toString();
      let arr = userStore.me?.bizcard_collection_items?.data || null;
      let myBizardFavs = arr && arr.length > 0 && arr?.map((i) => i.id) || [];
      canFav.value = userStore.me && !myBizardFavs.includes(cardDataRef.value.id);
      
      let str = cardDataRef.value;
      tmp.value = str
      canMotify.value = str.attributes.user?.data.id == userStore.userId;
      item.value.avatar = str.attributes?.avatar?.data?.attributes.url;
      item.value.name = str.attributes.name;
      item.value.title = str.attributes.title;
      item.value.description = str.attributes.description;
      item.value.phone = str.attributes.phone;
      item.value.email = str.attributes.email;
      item.value.address = str.attributes.address;
      item.value.alias = str.attributes.alias;
      item.value.providers = str.attributes.providers;
      item.value.default_provider = str.attributes.default_provider ? str.attributes.default_provider : null;
      defaultProvider.value = str.attributes.default_provider ? str.attributes.default_provider : item.value.providers[0]?.title || null;
    }
  },
  { immediate: true, deep: true }
);
const updateData = ref();
const bizcardUpdate = (val) => {
  console.log("收到修改完成信号");
  updateData.value = val.updateBizcard.data;

  let str = updateData.value;
  item.value.avatar = str.attributes.avatar?.data?.attributes.url;
  item.value.name = str.attributes.name;
  item.value.title = str.attributes.title;
  item.value.description = str.attributes.description;
  item.value.phone = str.attributes.phone;
  item.value.email = str.attributes.email;
  item.value.address = str.attributes.address;
  item.value.alias = str.attributes.alias;
  item.value.providers = str.attributes.providers;
  item.value.default_provider = str.attributes.default_provider;
  defaultProvider.value = str.attributes.providers[0].title;

  editting.value = false;
};

const showMotifywarpper = ref(false);
const toggleSetDefaultProvider = (val) => {
  if(canMotify.value && item.value?.providers.length > 1) {
    showMotifywarpper.value = val
  } else {
    showMotifywarpper.value = false
  }
}
const favCardAdded = () => {
  
}
</script>
