<template>
  <div class="column no-wrap full-width">
    <div v-if="readyFiles && updateBizcardParams && updateBizcardParams.data" class="row no-wrap radius-xs border">
      <div class="col-5 column no-wrap items-center q-pa-md">
        
        <div class="column no-wrap gap-sm items-center q-pa-md">
          <template v-if="!motifyAvatar">
            <q-img
              v-if="updateBizcardParams.data?.avatar &&
                readyFiles?.find((item) => item.id === updateBizcardParams.data.avatar)?.attributes.url &&
                !motifyAvatar"
              :src="readyFiles?.find((item) => item.id === updateBizcardParams.data.avatar)?.attributes.url"
              :ratio="1" width="8rem" fit="cover" spinner-color="primary" spinner-size="82px"
              class="radius-full"
            >
              <div class="absolute-full flex flex-center">
                <q-btn rounded dense padding="xs md" color="primary" label="修改头像"
                  @click="(updateImgFor = 'avatar'), (motifyAvatar = true)"/>
              </div>
            </q-img>
            <q-avatar v-else size="120px" class="border">
              <q-btn color="primary" label="上传头像" flat
                @click="(updateImgFor = 'avatar'), (motifyAvatar = true)"/>
            </q-avatar>
          </template>
          <template v-else>
            <StrapiUpload :accept="imageType.join(',')" :max-files="1" :class="'full-width'"
              @uploaded="filesOfUploaded"
            ></StrapiUpload>
            <div class="flex flex-center full-width">
              <q-btn v-if="motifyAvatar" color="primary" label="放弃修改" flat
                @click="motifyAvatar = false" />
            </div>
          </template>
        </div>
        <q-input
          v-model="updateBizcardParams.data.name"
          filled
          square
          dense
          type="text"
          prefix="姓名:"
        />
        <q-input
          v-model="updateBizcardParams.data.title"
          filled
          square
          dense
          type="text"
          prefix="职称:"
        />
        <q-input
          v-model="updateBizcardParams.data.description"
          filled
          square
          dense
          type="text"
          prefix="简介:"
        />
        <q-input
          v-model="updateBizcardParams.data.phone"
          filled
          square
          dense
          type="text"
          :rules="[(val) => /^[0-9]*$/.test(val) || '必须是0-9的数字']"
          prefix="电话:"
          hide-bottom-space
        />
        <q-input
          v-model="updateBizcardParams.data.email"
          filled
          square
          dense
          type="email"
          prefix="邮箱:"
        />
        <q-input
          v-model="updateBizcardParams.data.address"
          filled
          square
          dense
          type="text"
          prefix="地址:"
        />
        <q-input
          v-model="updateBizcardParams.data.alias"
          filled
          square
          dense
          type="text"
          prefix="标记:"
        >
          <q-tooltip> 仅自己可见,方便自己明白用途 </q-tooltip>
        </q-input>
      </div>
      <div class="col-7 column no-warp border-left">
        <q-toolbar class="transparent border-bottom">
          <q-tabs v-model="defaultProvider" dense inline-label no-caps>
            <template
              v-for="(i, index) in updateBizcardParams.data.providers"
              :key="index"
            >
              <q-tab v-if="ProvidorOfChanging != index" :name="i.title">
                <q-img
                  v-if="
                    i.provider_icon && i.provider_icon != 261 &&
                    readyFiles?.find((item) => item.id === i.provider_icon)?.attributes.url
                  "
                  :src="readyFiles.find((item) => item.id === i.provider_icon)?.attributes.url"
                  :ratio="1"
                  spinner-color="primary"
                  spinner-size="0.5rem"
                  width="1rem"
                  height="1rem"
                  class="hoverborder radius-full"
                  @click.stop="toggleChangeProvidorFile(index)"
                >
                  <q-tooltip>
                    修改图标
                  </q-tooltip>
                </q-img>
                <q-btn
                  v-else
                  color="primary"
                  dense
                  flat
                  :icon="
                    changeProvidorIcon
                      ? 'mdi-qrcode'
                      : 'mdi-image-filter-tilt-shift'
                  "
                  class="q-ml-sm"
                  @click.stop="toggleChangeProvidorFile(index)"
                />
                <span
                  @click="defaultProvider = i.title"
                  @dblclick="
                    (defaultProvider = i.title), (ProvidorOfChanging = index)
                  "
                  class="q-ml-sm"
                >
                  {{ i.title }}
                </span>
              </q-tab>
              <template v-if="ProvidorOfChanging == index">
                <q-input
                  v-if="ProvidorOfChanging == index"
                  v-model="tilteOfChangingProvidor"
                  square
                  filled
                  dense
                  type="text"
                  label="平台名称"
                >
                  <template v-slot:append v-if="tilteOfChangingProvidor">
                    <q-btn
                      color="primary"
                      dense
                      flat
                      icon="check"
                      @click.stop="
                        (updateBizcardParams.data.providers[index].title =
                          tilteOfChangingProvidor),
                          (defaultProvider =
                            updateBizcardParams.data.providers[index].title),
                            updateBizcardParams.data.providers[index].provider_icon = 261,
                            updateBizcardParams.data.providers[index].invite_qrcode = 263,
                          (ProvidorOfChanging = null),
                          updateFn('providerQRcode', index)
                      "
                    />
                  </template>
                </q-input>
              </template>
            </template>
          </q-tabs>
          <q-btn
            color="primary"
            dense
            flat
            icon="mdi-plus"
            @click.stop="
              updateBizcardParams.data.providers.push(provider),
                (ProvidorOfChanging =
                  updateBizcardParams.data.providers.length - 1)
            "
          >
            <q-tooltip> 添加我的二维码 </q-tooltip>
          </q-btn>
          <q-space />
        </q-toolbar>
        <q-tab-panels v-model="defaultProvider" animated class="q-space">
          <q-tab-panel
            v-for="(i, index) in updateBizcardParams.data.providers"
            :key="index"
            :name="i.title"
            class="flex flex-center"
          >
            <template v-if="changeProvidorIcon">
              <q-img
                v-if="i.provider_icon &&
                  readyFiles?.find((item) => item.id === i.provider_icon)?.attributes.url"
                :src="readyFiles.find((item) => item.id === i.provider_icon)?.attributes.url"
                :ratio="1"
                spinner-color="primary"
                spinner-size="82px"
                fit="contain"
              >
              </q-img>
              <StrapiUpload v-if="!i.provider_icon" :accept="imageType.join(',')"
                :max-files="1" :class="'full-width'" fit="contain"
                @uploaded="filesOfUploaded"
              ></StrapiUpload>
              <div v-if="i.provider_icon" class="absolute-full bg-black op-7" />
              <div v-if="i.provider_icon" class="absolute-full flex flex-center">
                <q-btn
                  color="primary" rounded
                  label="修改图标"
                  @click="i.provider_icon = null,updateImgFor = 'providerIcon',updateImgIndex = index"
                />
              </div>
            </template>
            <template v-else>
              <q-img
                v-if="
                  i.invite_qrcode &&
                  readyFiles?.find((item) => item.id === i.invite_qrcode)?.attributes.url
                "
                :src="readyFiles.find((item) => item.id === i.invite_qrcode).attributes.url"
                :ratio="1"
                spinner-color="primary"
                spinner-size="82px"
                fit="contain"
              >
              </q-img>
              <!-- <OssUploader
                v-if="!i.invite_qrcode"
                label="上传二维码图像"
                :accept="imageType.join(',')"
                :maxFiles="1"
                :autoUpload="true"
                @filesOfUploaded="filesOfUploaded"
                :class="'fit'"
              /> -->
              <StrapiUpload v-if="!i.invite_qrcode" :accept="imageType.join(',')"
                :max-files="1" class="fit" label="上传二维码图像"
                @uploaded="filesOfUploaded"
              ></StrapiUpload>
              <div v-if="i.invite_qrcode" class="absolute-full bg-black op-7" />
              <div v-if="i.invite_qrcode" class="absolute-full flex flex-center">
                <q-btn
                  color="primary" rounded
                  label="修改二维码"
                  @click="i.invite_qrcode = null,updateImgFor = 'providerQRcode',updateImgIndex = index"
                />
              </div>
            </template>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
    <div class="row q-mt-sm">
      <q-btn
        dense
        flat
        class="q-px-md"
        color="primary"
        label="取消修改"
        @click="cannelUpdate"
      />
      <q-space />
      <q-btn
        dense
        class="q-px-md"
        color="primary"
        icon="check"
        label="修改"
        :disable="cantSubmit"
        @click="submitCreate"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, toRef, inject, watch, onBeforeUnmount, onUnmounted } from "vue";
import { updateBizcard, createUploadFile } from "src/apollo/api/api.js";
import useUserStore from "src/stores/user.js";
import OssUploader from "src/components/Utilits/OssUploader.vue";
import StrapiUpload from 'src/components/Utilits/StrapiUpload.vue'

const props = defineProps({
  cardData: {
    type: Object,
    default() {
      return {};
    },
  },
});
const emit = defineEmits(["bizcardUpdate","cannelUpdate"]);
const userStore = useUserStore();
const userId = ref();
const cardDataRef = toRef(props, "cardData");
const defaultProvider = ref();
const changeQRcodeOfProvider = ref();

const imageType = inject("imageType");

const provider = ref({
  title: null,
  invite_uri: null,
  provider_icon: null,
  invite_qrcode: null,
});
const motifyAvatar = ref(false);
const tilteOfChangingProvidor = ref();
const updateBizcardParams = ref({
  updateBizcardId: null,
  data: {
    name: null,
    title: null,
    description: null,
    avatar: null,
    email: null,
    phone: null,
    address: null,
    alias: null,
    providers: [
      {
        title: null,
        provider_icon: null,
        invite_uri: null,
        invite_qrcode: null,
      },
    ],
    publishedAt: null,
  },
});
const updateImgFor = ref();
const updateImgIndex = ref();
const changeProvidorIcon = ref(false);
const ProvidorOfChanging = ref();
const toggleChangeProvidorFile = (index) => {
  updateImgIndex.value = index;
  changeProvidorIcon.value = !changeProvidorIcon.value;
  updateImgFor.value = changeProvidorIcon.value
    ? "providerIcon"
    : "providerQRcode";
};
const updateFn = (imgfor, index) => {
  console.log("收到上传完成信号", imgfor, index);
  updateImgFor.value = imgfor;
  updateImgIndex.value = index;
};
const readyFiles = ref([]);

watch(cardDataRef, () => {
  if (cardDataRef.value && cardDataRef.value.id) {
    updateBizcardParams.value.updateBizcardId = cardDataRef.value.id;

    let obj = cardDataRef.value.attributes;
    updateBizcardParams.value.data = {
      name: obj.name || null,
      title: obj.title || null,
      description: obj.description || null,
      avatar: obj.avatar?.data?.id || 262,
      email: obj.email || null,
      phone: obj.phone || null,
      address: obj.address || null,
      alias: obj.alias || null,
      providers: obj.providers.map((provider) => {
        return {
          title: provider.title || null,
          invite_qrcode: provider.invite_qrcode?.data?.id || 263,
          invite_uri: provider.invite_uri || null,
          provider_icon: provider.provider_icon?.data?.id || 261,
        };
      }),
      publishedAt: obj.publishedAt || null,
    };

    defaultProvider.value = obj.providers[0]?.title || null;

    const newArray = [
      obj.avatar.data,
      ...obj.providers.map((provider) => provider.invite_qrcode.data),
      ...obj.providers.map((provider) => provider.provider_icon.data),
    ];
    readyFiles.value = newArray.filter(i => i != null);
  }
},{ immediate: true, deep: true });

const filesOfUploaded = (val) => {
  let arr = val;
  console.log("接收到文件：", val);
  arr.map(file => {
    readyFiles.value.push(file);
    let RespsId = file.id;
    
    console.log("Strapi文件ID", RespsId);
    if (updateImgFor.value == "avatar") {
      updateBizcardParams.value.data.avatar = RespsId;
      motifyAvatar.value = false;
    }
    if (updateImgFor.value == "providerQRcode") {
      updateBizcardParams.value.data.providers[
        updateImgIndex.value
      ].invite_qrcode = RespsId;
    }
    if (updateImgFor.value == "providerIcon") {
      updateBizcardParams.value.data.providers[
        updateImgIndex.value
      ].provider_icon = RespsId;
    }
  })
};
const {
  mutate: updateBizcardMutate,
  onDone,
  onError,
} = updateBizcard(updateBizcardParams);
const cantSubmit = ref(false);
const submitCreate = async () => {
  cantSubmit.value = true;
  updateBizcardParams.value.data.user = userStore.userId;
  updateBizcardParams.value.data.publishedAt = new Date().toISOString();

  const { data } = await updateBizcardMutate();

  if (data) {
    emit("bizcardUpdate", data);
    console.log('updated emitit');
    setTimeout(() => {
      cantSubmit.value = false;
    }, 600);
  }
};
const cannelUpdate = () => {
  emit("cannelUpdate");
}
watch(
  userStore,
  () => {
    if (userStore.userId) {
      userId.value = userStore.userId;
      updateBizcardParams.value.data.user = userStore.userId;
    }
  },
  { immediate: true, deep: true }
);
</script>
