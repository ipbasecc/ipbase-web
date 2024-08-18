<template>
  <div class="full-width q-space column no-wrap gap-md q-pa-xl">
    <template v-if="querycompleted">
      <span>频道栏目与导航：</span>
      <q-toolbar v-if="navigation" class="transparent">
        <VueDraggable v-model="navigation"
          :animation="300" :delay="50" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
          chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
          class="row no-wrap gap-sm forbid"
          @update="motifyChannelNavigation()"
        >
          <div
            v-for="element in navigation" :key="element.val"
            class="row items-center no-wrap gap-lg q-py-sm q-px-md radius-sm border cursor-move"
            :class="
              element.enable
                ? 'bg-primary-gdt text-white'
                : 'bg-grey-3 text-grey-7'
            "
            @click="motifyChannelNavigation()"
          >
            <div class="fit">{{ element.name }}</div>
            <q-toggle
              v-model="element.enable"
              dense
              size="xs"
              color="green"
              @click="motifyChannelNavigation()"
            />
          </div>
        </VueDraggable>
        <q-space />
        <q-btn
          v-if="!submitDisable"
          :disable="submitDisable"
          padding="xs md"
          color="primary"
          dense
          icon="done_all"
          label="确认"
          @click="motifyChannel"
        />
      </q-toolbar>
      <q-input
        v-model="UpdateChannelParams.data.title"
        type="text"
        label="频道名称"
        stack-label
        :placeholder="UpdateChannelParams.data.title"
      />
      <q-input
        v-model="UpdateChannelParams.data.description"
        type="text"
        label="频道介绍"
        stack-label
        :placeholder="UpdateChannelParams.data.description"
      />
      <q-input
        v-model="UpdateChannelParams.data.slogan"
        type="text"
        label="频道口号"
        stack-label
        :placeholder="UpdateChannelParams.data.slogan"
      />

      <div class="row no-wrap gap-md items-start q-py-sm">
        频道头像：
        <div class="column no-wrap gap-sm" style="flex: 0 0 22rem">
          <q-avatar size="220px" v-if="avatar && !addAvatar">
            <q-img
              :src="avatar"
              :ratio="9 / 16"
              spinner-color="primary"
              spinner-size="82px"
              fit="cover"
              class="fit"
              @mouseenter="showAddAvatar = true"
              @mouseleave="showAddAvatar = false"
            >
              <div v-if="showAddAvatar" class="absolute-full flex flex-center">
                <q-btn
                  padding="xs md"
                  dense
                  color="primary"
                  icon="upgrade"
                  label="修改"
                  @click="addAvatar = !addAvatar"
                />
              </div>
            </q-img>
          </q-avatar>
          <UploadFile
            v-if="addAvatar"
            label="修改频道头像"
            :accept="imageType.join(',')"
            :maxFiles="1"
            :autoUpload="true"
            @fileUploaded="avatarUploaded"
            :class="'full-width'"
          />
          <q-btn
            v-if="addAvatar"
            flat
            dense
            color="primary"
            icon="undo"
            label="取消"
            @click="addAvatar = !addAvatar"
          />
        </div>
      </div>
      <div class="row no-wrap gap-md items-start q-py-sm">
        频道轮播图：
        <div style="flex: 0 0 26rem" class="column no-wrap gap-sm">
          <template v-if="cover?.length > 0">
            <template v-for="i in cover" :key="i.id">
              <q-img
                :src="i.attributes?.url"
                :ratio="16 / 9"
                spinner-color="primary"
                spinner-size="82px"
                fit="contain"
                @mouseenter="showRemoveCover = i.id"
                @mouseleave="showRemoveCover = null"
              >
                <div
                  v-if="showRemoveCover === i.id && !removedCover.includes(i.id)"
                  class="absolute-full flex flex-center"
                >
                  <q-btn
                    rounded
                    label="删除"
                    padding="xs md"
                    dense
                    color="red"
                    icon="recycling"
                    @click="removeCover(i.id)"
                  />
                </div>
                <div
                  v-if="removedCover.includes(i.id)"
                  class="bg-delete absolute-full"
                >
                  <div class="bg-delete absolute-full flex flex-center">
                    <q-btn
                      rounded
                      label="恢复"
                      padding="xs md"
                      dense
                      color="primary"
                      icon="settings_backup_restore"
                      @click="reCoverRemovedCover(i.id)"
                    />
                  </div>
                </div>
              </q-img>
            </template>
          </template>
          <UploadFile
            v-if="addCover || cover?.length === 0"
            label="增加频道轮播图"
            :accept="imageType.join(',')"
            :maxFiles="1"
            :autoUpload="true"
            @fileUploaded="coverUploaded"
            :class="'full-width'"
          />
          <q-btn
            v-if="cover?.length > 0"
            flat
            dense
            color="primary"
            icon="add"
            label="增加"
            @click="addCover = !addCover"
          />
        </div>
      </div>
      <div class="row no-wrap gap-md items-start q-py-sm">
        频道封面图：
        <div class="column no-wrap gap-sm" style="flex: 0 0 26rem">
          <q-img
            v-if="brand && !addBrand"
            :src="brand"
            :ratio="16 / 9"
            spinner-color="primary"
            spinner-size="82px"
            fit="cover"
            @mouseenter="showAddBrand = true"
            @mouseleave="showAddBrand = false"
          >
            <div v-if="showAddBrand" class="absolute-full flex flex-center">
              <q-btn
                padding="xs md"
                dense
                color="primary"
                icon="upgrade"
                label="修改"
                @click="addBrand = !addBrand"
              />
            </div>
          </q-img>
          <UploadFile
            v-if="addBrand"
            label="频道封面图"
            :accept="imageType.join(',')"
            :maxFiles="1"
            :autoUpload="true"
            @fileUploaded="brandUploaded"
            :class="'full-width'"
          />
          <q-btn
            v-if="addBrand"
            flat
            dense
            color="primary"
            icon="undo"
            label="取消"
            @click="addBrand = !addBrand"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, inject, watch } from "vue";
import { VueDraggable } from 'vue-draggable-plus'
import { findChannelMatedataByID, UpdateChannel } from "src/apollo/api/api.js";
import useUserStore from "src/stores/user.js";
import useChannelStore from "src/stores/channel.js";

import UploadFile from "src/components/Utilits/UploadFile.vue";
import { useQuasar } from "quasar";

const $q = useQuasar();

const userStore = useUserStore();
const channelStore = useChannelStore();

const imageType = inject("imageType");
const navigationBase = inject("navigationBase");
const navigation = ref();

const submitDisable = ref(true);
const UpdateChannelParams = ref({
  data: {
    title: "",
    slogan: "",
    description: "",
    avatar: null,
    cover: null,
    brand: null,
    navigation: {},
  },
});

const motifyChannelNavigation = () => {
  UpdateChannelParams.value.data.navigation = navigation.value;
};

const avatar = ref();
const showAddAvatar = ref(false);
const addAvatar = ref(false);
const avatarUploaded = (val) => {
  UpdateChannelParams.value.data.avatar = val;
  addAvatar.value = false;
};

const cover = ref();
const addCover = ref(false);
const showRemoveCover = ref(null);
const removedCover = ref([]);
const removeCover = (val) => {
  removedCover.value.push(val);
  UpdateChannelParams.value.data.cover =
    UpdateChannelParams.value.data.cover.filter((i) => i !== val);
};
const reCoverRemovedCover = (val) => {
  removedCover.value = removedCover.value.filter((i) => i !== val);
  UpdateChannelParams.value.data.cover.push(val);
};

const coverUploaded = (id, obj) => {
  let img = {
    __typename: "UploadFileEntity",
    id: obj.id,
    attributes: {
      __typename: "UploadFile",
      url: obj.attributes.url,
      ext: obj.attributes.ext,
    },
  };
  cover.value.push(img);
  UpdateChannelParams.value.data.cover.push(id);
};

const brand = ref();
const addBrand = ref(false);
const showAddBrand = ref(false);

const brandUploaded = (id, obj) => {
  brand.value = obj.attributes.url;
  UpdateChannelParams.value.brand.cover = id;
  addBrand.value = false;
};
// 为判断是否完成了数据请求准备的变量
const querycompleted = ref(false);
let refetchChannel;
const queryChannelMatedata = async () => {
  const { loading, error, result, refetch } = findChannelMatedataByID({
    id: userStore.channelId,
  });

  const motifyData = () => {
    let obj = result.value.channel.data.attributes;
    UpdateChannelParams.value.data.title = obj.title;
    UpdateChannelParams.value.data.slogan = obj.slogan;
    UpdateChannelParams.value.data.description = obj.description;
    UpdateChannelParams.value.data.avatar = obj.avatar?.data?.id || null;
    avatar.value = obj.avatar?.data?.attributes.url || null;
    UpdateChannelParams.value.data.cover =
      obj.cover?.data?.map((i) => i.id) || null;
    cover.value = obj.cover?.data || [];

    UpdateChannelParams.value.data.brand = obj.brand?.data?.id || null;
    brand.value = obj.brand?.data?.attributes.url || null;

    navigation.value = obj.navigation.map(item => ({
        ...item,
        enable: !!item.enable, // 确保 enable 是响应式的
      }));
    UpdateChannelParams.value.data.navigation = navigation.value;
    channelStore.navigation = navigation.value;

    querycompleted.value = true;
  };
  watch(
    result,
    () => {
      if (result.value) {
        refetchChannel = refetch;
        motifyData();
      }
    },
    { immediate: true, deep: true }
  );
};
watch(
  userStore,
  () => {
    if (userStore.channelId) {
      queryChannelMatedata();
    }
  },
  { immediate: true, deep: true }
);

watch(
  UpdateChannelParams,
  () => {
    submitDisable.value = false;
  },
  { immediate: false, deep: true }
);

const motifyChannel = async () => {
  submitDisable.value = true;
  const {
    mutate: UpdateChannelMutate,
    onDone,
    onError,
  } = UpdateChannel(UpdateChannelParams);

  const { data } = await UpdateChannelMutate();
  if (data) {
    channelStore.navigation = navigation.value;
    channelStore.needRefetch = true;
    // console.log("用户资料已更新");
    setTimeout(() => {
      submitDisable.value = false;
    }, 600);
    $q.notify("用户资料已更新");
  }
};
</script>

<style lang="scss" scoped>
.ghostClass {
  background: $grey-4 !important;
  border: 3px inset dotted $primary;
}
.chosenClass {
  background-color: $primary;
  opacity: 1 !important;
}
.ghostClass * {
  opacity: 0 !important;
}
</style>
