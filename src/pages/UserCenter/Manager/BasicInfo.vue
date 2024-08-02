<template>
  <div class="limit fit no-wrap" :class="style">
    <div class="q-pa-md">
      <div>
        <UpdateAvatar
          :oldAvatar="avatar"
          size="160px"
          @mouseleave="changeAvatar = false"
        />
      </div>
    </div>
    <div class="q-space column no-wrap gap-md">
      <q-toolbar class="transparent">
        <q-space />
        <q-btn
          v-if="!submitDisable"
          :disable="submitDisable"
          padding="xs sm"
          color="primary"
          dense
          icon="done_all"
          label="确认"
          @click="updateBasicinfo"
        />
      </q-toolbar>
      <q-input
        v-model="title"
        type="text"
        label="头衔 / 职业称谓"
        stack-label
        :placeholder="title"
      />
      <q-input
        v-model="bio"
        type="text"
        label="个性签名"
        stack-label
        :placeholder="bio"
      />
      <q-input
        v-model="description"
        type="text"
        label="简介"
        stack-label
        :placeholder="description"
      />

      <div class="row no-wrap gap-sm items-center">
        {{ $t('Language') }}:
        <q-btn flat dense padding="xs md">
          <div class="row no-wrap gap-md">
            <span :class="`fi fi-${langLabel.flag_key}`"></span>
            <span>{{ langLabel.label }}</span>
          </div>
          <q-menu class="transparent z-max">
            <q-list
              dense
              bordered
              class="radius-sm q-pa-xs"
              :class="$q.dark.mode ? 'bg-darker' : 'bg-grey-1'"
            >
              <q-item
                v-for="i in localeOptions"
                :key="i.val"
                clickable
                v-close-popup
                @click="setLocale(i.val)"
                class="radius-xs"
              >
                <q-item-section side>
                  <span :class="`fi fi-${i.flag_key}`"></span>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ i.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
      <div v-if="false" class="row gap-xs items-center">
        <q-chip
          v-for="(i, index) in self_tags"
          :key="index"
          :label="i"
          square
          size="md"
          icon="tag"
          color="primary"
          text-color="white"
          class="hovered-item"
        >
          <q-badge
            floating
            class="transparent no-padding hover-show transition"
          >
            <q-btn
              color="red"
              icon="close"
              dense
              size="xs"
              round
              @click="removeTag(i)"
            />
          </q-badge>
        </q-chip>
        <q-btn color="primary" icon="add" round dense flat>
          <q-menu v-model="addingTag">
            <q-card bordered>
              <q-card-section class="q-pa-xs">
                <q-input
                  v-model="newTagName"
                  dense
                  square
                  filled
                  type="text"
                  label="新增标签"
                  @keyup.enter="newTag"
                >
                  <template v-if="newTagName" v-slot:append>
                    <q-btn
                      color="primary"
                      icon="add"
                      round
                      dense
                      flat
                      size="sm"
                      @click="newTag"
                    />
                  </template>
                </q-input>
              </q-card-section>
            </q-card>
          </q-menu>
        </q-btn>
      </div>
      <div v-if="false" class="row no-wrap gap-md items-center q-py-sm">
        界面风格：
        <q-btn
          v-if="theme"
          flat
          color="primary"
          :icon="theme.icon"
          :label="theme.name"
        >
          <q-menu>
            <q-list style="min-width: 8rem">
              <q-item
                v-for="(i, index) in tehmeItems"
                :key="index"
                clickable
                v-close-popup
                @click="theme = i"
              >
                <q-item-section side><q-icon :name="i.icon" /></q-item-section>
                <q-item-section>{{ i.name }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
      <div v-if="false" class="row no-wrap gap-md items-start q-py-sm">
        横向形象：
        <div style="flex: 0 0 26rem" class="column no-wrap gap-sm">
          <template v-if="brand?.length > 0">
            <template v-for="i in brand" :key="i.id">
              <q-img
                :src="i.attributes?.url"
                :ratio="16 / 9"
                spinner-color="primary"
                spinner-size="82px"
                fit="contain"
                @mouseenter="showRemoveBrand = i.id"
                @mouseleave="showRemoveBrand = null"
              >
                <div
                  v-if="showRemoveBrand === i.id && !removedBrand.includes(i.id)"
                  class="absolute-full flex flex-center"
                >
                  <q-btn
                    rounded
                    label="删除"
                    padding="xs md"
                    dense
                    color="red"
                    icon="recycling"
                    @click="removeBrand(i.id)"
                  />
                </div>
                <div
                  v-if="removedBrand.includes(i.id)"
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
                      @click="reCoverRemovedBrand(i.id)"
                    />
                  </div>
                </div>
              </q-img>
            </template>
          </template>
          <UploadFile
            v-if="addBrand || brand?.length === 0"
            label="增加横向形象图"
            :accept="imageType.join(',')"
            :maxFiles="1"
            :autoUpload="true"
            @fileUploaded="brandUploaded"
            :class="'full-width'"
          />
          <q-btn
            v-if="brand?.length > 0"
            flat
            dense
            color="primary"
            icon="add"
            label="增加"
            @click="addBrand = !addBrand"
          />
        </div>
      </div>
      <div v-if="false" class="row no-wrap gap-md items-start q-py-sm">
        纵向形象：
        <div class="column no-wrap gap-sm" style="flex: 0 0 22rem">
          <q-img
            v-if="cover && !addCover"
            :src="cover"
            :ratio="9 / 16"
            spinner-color="primary"
            spinner-size="82px"
            fit="cover"
            @mouseenter="showAddCover = true"
            @mouseleave="showAddCover = false"
          >
            <div v-if="showAddCover" class="absolute-full flex flex-center">
              <q-btn
                padding="xs md"
                dense
                color="primary"
                icon="upgrade"
                label="修改"
                @click="addCover = !addCover"
              />
            </div>
          </q-img>
          <UploadFile
            v-if="addCover || !cover"
            label="修改纵向形象"
            :accept="imageType.join(',')"
            :maxFiles="1"
            :autoUpload="true"
            @fileUploaded="coverUploaded"
            :class="'full-width'"
          />
          <q-btn
            v-if="addCover"
            flat
            dense
            color="primary"
            icon="undo"
            label="取消"
            @click="addCover = !addCover"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, watchEffect } from "vue";
import useGetMyMatedate from "src/hooks/global/useGetMyMatedata.js";
import { updateUsersBasicinfo } from "src/apollo/api/api.js";
import UploadFile from "src/components/Utilits/UploadFile.vue";
import UpdateAvatar from "src/pages/Chat/components/user/Settings/UpdateAvatar.vue";

import useUserStore from "src/stores/user.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import localforage from "localforage";

const props = defineProps({
  style: {
    type: String,
    default: "row gap-xxl q-pa-xl",
  },
});

const $q = useQuasar();
const userStore = useUserStore();
const { me, userId } = useGetMyMatedate;

const imageType = inject("imageType");

const updateUsersBasicinfoParams = ref({
  updateUsersPermissionsUserId: null,
  data: {
    config: {},
    profile: {},
  },
});

const submitDisable = ref(true);

const title = ref();
const description = ref();
const bio = ref();
const self_tags = ref();
const newTagName = ref();
const addingTag = ref(false);
const newTag = () => {
  self_tags.value.push(newTagName.value);
  newTagName.value = "";
  addingTag.value = false;
};
const removeTag = (i) => {
  self_tags.value = self_tags.value.filter((item) => item !== i);
};
const theme = ref();
const tehmeItems = ref([
  { name: "lighter", icon: "light_mode", val: "lighter" },
  { name: "darker", icon: "dark_mode", val: "darker" },
]);
const { locale } = useI18n({ useScope: "global" });
const localeOptions = [
  { val: "zh-CN", label: "中文", flag_key: 'cn' },
  { val: "en-US", label: "English", flag_key: 'gb' },
  { val: "de-DE", label: "Deutsch", flag_key: 'de' },
];
const setLocale = async (val) => {
  locale.value = val;
  updateUsersBasicinfoParams.value.data.config.lang = val
  await localforage.setItem("locale", val);
};
const language = computed(() => locale.value)
const langLabel = computed(() => {
  if(language.value === "zh-CN"){
    return { val: "zh-CN", label: "中文", flag_key: 'cn' }
  }else if(language.value === "en-US"){
    return { val: "en-US", label: "English", flag_key: 'gb' }
  }else if(language.value === "de-DE"){
    return { val: "de-DE", label: "Deutsch", flag_key: 'de' }
  } else {
    return { val: "zh-CN", label: "中文", flag_key: 'cn' }
  }
})

const avatar = ref();
const cover = ref();
const brand = ref();
const addBrand = ref(false);
const showRemoveBrand = ref(null);
const removedBrand = ref([]);
const removeBrand = (val) => {
  removedBrand.value.push(val);
  updateUsersBasicinfoParams.value.data.profile.brand =
    updateUsersBasicinfoParams.value.data.profile.brand.filter((i) => i !== val);
};
const reCoverRemovedBrand = (val) => {
  removedBrand.value = removedBrand.value.filter((i) => i !== val);
  updateUsersBasicinfoParams.value.data.profile.brand.push(val);
};
const addCover = ref(false);
const showAddCover = ref(false);
const mm_profile = ref();

watch(
  [me, userId],
  () => {
    if (me && me.value && userId) {
      mm_profile.value = me.value.mm_profile;
      avatar.value = me.value?.profile?.avatar?.data?.attributes.url || "";
      title.value = me.value?.profile?.title || "";
      description.value = me.value?.profile?.description || "";
      bio.value = me.value?.profile?.bio || "";
      self_tags.value = me.value?.self_tags || [];
      theme.value = tehmeItems.value[0];
      brand.value = me.value?.profile?.brand.data || [];
      cover.value = me.value?.profile?.cover?.data?.attributes.url || null;

      updateUsersBasicinfoParams.value.updateUsersPermissionsUserId = userId;
      updateUsersBasicinfoParams.value.data.profile.avatar =
        me.value?.profile?.avatar?.data.id || null;
      updateUsersBasicinfoParams.value.data.profile.brand =
        me.value?.profile?.brand?.data.map((i) => i.id) || [];
      updateUsersBasicinfoParams.value.data.profile.cover =
        me.value?.profile?.cover?.data?.id || null;
    }
  },
  { immediate: true, deep: true }
);

watchEffect(() => {
  updateUsersBasicinfoParams.value.data.profile.title = title.value;
  updateUsersBasicinfoParams.value.data.profile.description = description.value;
  updateUsersBasicinfoParams.value.data.profile.bio = bio.value;
  updateUsersBasicinfoParams.value.data.config.theme =
    theme.value?.val || tehmeItems.value[0].val;
  updateUsersBasicinfoParams.value.data.self_tags = self_tags.value;
});

watch(
  updateUsersBasicinfoParams,
  () => {
    submitDisable.value = false;
  },
  { immediate: false, deep: true }
);

watch(
  userStore,
  () => {
    if (userStore.avatar) {
      avatar.value = userStore.avatar;
    }
  },
  { immediate: false, deep: true }
);

const changeAvatar = ref(false);

const brandUploaded = (id, obj) => {
  let img = {
    __typename: "UploadFileEntity",
    id: obj.id,
    attributes: {
      __typename: "UploadFile",
      url: obj.attributes.url,
      ext: obj.attributes.ext,
    },
  };
  brand.value = [...brand.value, img];
  updateUsersBasicinfoParams.value.data.profile.brand.push(id);
};
const coverUploaded = (id, obj) => {
  cover.value = obj.attributes.url;
  updateUsersBasicinfoParams.value.data.profile.cover = id;
  addCover.value = false;
};

const updateBasicinfo = async () => {
  submitDisable.value = true;
  const {
    mutate: updateUsersBasicinfoMutate,
    onDone,
    onError,
  } = updateUsersBasicinfo(updateUsersBasicinfoParams);

  const { data } = await updateUsersBasicinfoMutate();
  if (data) {
    console.log("用户资料已更新", data);
    // userStore.needRefetch = true;
    setTimeout(() => {
      submitDisable.value = false;
    }, 600);
    $q.notify("用户资料已更新");
  }
};
</script>

<style lang="scss" scoped></style>
