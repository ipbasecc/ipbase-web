<template>
  <div class="column no-wrap full-width">
    <div class="row no-wrap radius-xs border">
      <div class="col-5 column no-wrap items-center q-pa-md">
        <div class="q-pa-md full-width row flex-center">
          <template v-if="!motifyAvatar">
            <q-img
              v-if="readyFiles?.find(i => i.id === createBizcardParams.data?.avatar)?.attributes.url"
              :src="readyFiles?.find(i => i.id === createBizcardParams.data?.avatar)?.attributes.url"
              :ratio="1" spinner-color="primary" spinner-size="82px" size="120px" class="radius-full"
            >
              <div class="absolute-full flex flex-center">
                <q-btn flat dense color="primary" label="修改头像" @click="(updateImgFor = 'avatar'), (motifyAvatar = true)"/>
              </div>
            </q-img>
            <q-avatar v-else size="120px" class="border">
              <q-btn color="primary" label="上传头像" flat @click="(updateImgFor = 'avatar'), (motifyAvatar = true)"/>
            </q-avatar>
          </template>
          <template v-else>
            <StrapiUpload
              :accept="imageType.join(',')"
              :max-files="1"
              @uploaded="filesOfUploaded"
            ></StrapiUpload>
            <q-btn
              color="primary" label="放弃修改" flat @click="motifyAvatar = false"
            />
          </template>
        </div>
        <q-input v-model="createBizcardParams.data.name" filled square dense type="text" prefix="姓名:" ></q-input>
        <q-input v-model="createBizcardParams.data.title" filled square dense type="text" prefix="职称:" ></q-input>
        <q-input v-model="createBizcardParams.data.description" filled square dense type="text" prefix="简介:" ></q-input>
        <q-input v-model="createBizcardParams.data.phone" filled square dense type="text" prefix="电话:"
        :rules="[(val) => /^[0-9]*$/.test(val) || '必须是0-9的数字']" hide-bottom-space></q-input>
        <q-input v-model="createBizcardParams.data.email" filled square dense type="text" prefix="邮箱:" ></q-input>
        <q-input v-model="createBizcardParams.data.address" filled square dense type="text" prefix="地址:" ></q-input>
        <q-input v-model="createBizcardParams.data.alias" filled square dense type="text" prefix="标记:">
          <q-tooltip> 仅自己可见,方便自己明白用途 </q-tooltip>
        </q-input>
      </div>
      <div class="col-7 column no-warp border-left">
        <q-toolbar class="transparent border-bottom">
          <q-tabs v-model="defaultProvider" dense inline-label no-caps>
            <template v-for="(i, index) in createBizcardParams.data.providers" :key="index">
              <q-tab v-if="ProvidorOfChanging != index" :name="i.title">
                <q-img
                  v-if="i.provider_icon && readyFiles?.find((item) => item.id === i.provider_icon)?.attributes.url"
                  :src="readyFiles?.find((item) => item.id === i.provider_icon).attributes.url"
                  :ratio="1" spinner-color="primary" spinner-size="0.5rem" width="1rem" height="1rem"
                  @click.stop="toggleChangeProvidorFile(index,i.id)"/>
                <q-btn v-else color="primary" dense flat
                  :icon="changeProvidorIcon ? 'mdi-qrcode' : 'mdi-image-filter-tilt-shift'"
                  @click.stop="toggleChangeProvidorFile(index,i.id)"/>
                <span @click="defaultProvider = i.title"
                  @dblclick="(defaultProvider = i.title), (ProvidorOfChanging = index)">
                  {{ i.title }}
                </span>
              </q-tab>
              <template v-if="ProvidorOfChanging == index">
                <q-input
                  v-if="ProvidorOfChanging == index"
                  v-model="tilteOfChangingProvidor"
                  square filled dense type="text" label="平台名称">
                  <template v-slot:append v-if="tilteOfChangingProvidor">
                    <q-btn color="primary" dense flat icon="check"
                      @click.stop="
                        createBizcardParams.data.providers[index].title = tilteOfChangingProvidor,
                        defaultProvider = createBizcardParams.data.providers[index].title,
                        ProvidorOfChanging = null,
                        updateFn('providerQRcode', index)
                      "
                    />
                  </template>
                </q-input>
              </template>
            </template>
          </q-tabs>
          <q-btn color="primary" dense flat icon="mdi-plus"
            @click.stop="
              createBizcardParams.data.providers.push(provider),
                (ProvidorOfChanging =
                  createBizcardParams.data.providers.length - 1)
            "
          >
            <q-tooltip> 添加我的二维码 </q-tooltip>
          </q-btn>
          <q-space />
        </q-toolbar>
        <q-tab-panels
          v-if="createBizcardParams.data?.providers?.length > 0"
          v-model="defaultProvider"
          animated
          class="q-space"
        >
          <q-tab-panel
            v-for="(i, index) in createBizcardParams.data.providers"
            :key="index"
            :name="i.title"
            class="column flex-center gap-md"
          >
            <template v-if="changeProvidorIcon">
              <q-img
                v-if="readyFiles?.find(item => item.id === i.provider_icon)?.attributes.url"
                :src="readyFiles.find(item => item.id === i.provider_icon)?.attributes.url"
                :ratio="1"
                spinner-color="primary"
                spinner-size="82px"
                width="128px"
                height="128px"
              >
                <div v-if="i.provider_icon" class="absolute-full flex flex-center transparent">
                  <q-btn color="primary" dense rounded label="修改" padding="xs md" @click="i.provider_icon = (Number(i.provider_icon) * -1).toString()" />
                </div>
              </q-img>
              <template v-else>
                <StrapiUpload :accept="imageType.join(',')" :max-files="1"
                  @uploaded="filesOfUploaded" label="上传自媒体平台图标"
                ></StrapiUpload>
                <q-btn v-if="i.provider_icon" color="primary" dense rounded padding="xs md" label="取消修改" @click="i.provider_icon = (Number(i.provider_icon) * -1).toString()" />
              </template>
              
            </template>
            <template v-else>
              <q-img
                v-if="i.invite_qrcode && readyFiles.find(item => item.id === i.invite_qrcode)?.attributes.url"
                :src="readyFiles.find(item => item.id === i.invite_qrcode)?.attributes.url"
                :ratio="1" spinner-color="primary" spinner-size="82px" class="fit" fit="contain"
              >
                <div class="absolute-full flex flex-center transparent">
                  <q-btn color="negative" dense rounded padding="xs md" label="修改"
                    @click="i.invite_qrcode = (Number(i.invite_qrcode) * -1).toString()" />
                </div>
              </q-img>
              <template v-else>
                <StrapiUpload :accept="imageType.join(',')" :max-files="1"
                  @uploaded="filesOfUploaded" label="上传你在该平台的二维码"
                ></StrapiUpload>
                <q-btn v-if="i.invite_qrcode" color="primary" dense rounded padding="xs md" label="取消修改" @click="i.invite_qrcode = (Number(i.invite_qrcode) * -1).toString()" />
              </template>
            </template>
          </q-tab-panel>
        </q-tab-panels>
        <div v-else class="q-space column flex-center">
          <span class="font-larger q-mb-sm">尚未添加任何社交媒体二维码</span>
          <span class="op-7">请点击上方 “+” 按钮添加</span>
        </div>
      </div>
    </div>
    <div class="row q-mt-sm">
      <q-btn dense flat class="q-px-md" color="primary" icon="check" label="取消新建"
        @click="cannelCreate" />
      <q-space />
      <q-btn dense class="q-px-md" color="primary" icon="check" label="创建" :disable="cantSubmit"
        @click="submitCreate" />
    </div>
  </div>
</template>
<script setup>
import { ref, toRef, inject, watch, computed } from "vue";
import { createBizcard, createUploadFile } from "src/apollo/api/api.js";
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
const emit = defineEmits(["bizcardCreated", "bizcardCannelCreated"]);
const userStore = useUserStore();
const userId = computed(() => userStore.userId);
const cardDataRef = toRef(props, "cardData");
const defaultProvider = ref("mails");
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
const createBizcardParams = ref({
  data: {
    avatar: null,
    name: null,
    title: null,
    description: null,
    email: null,
    address: null,
    alias: null,
    phone: null,
    providers: [],
    publishedAt: new Date().toISOString(),
  },
});
const updateImgFor = ref();
const updateImgIndex = ref();
const changeProvidorIcon = ref(false);
const changeProvidorID = ref(-1);
const ProvidorOfChanging = ref();
const toggleChangeProvidorFile = (index,id) => {
  updateImgIndex.value = index;
  changeProvidorID.value = id
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
const filesOfUploaded = (val) => {
  let arr = val;
  console.log("接收到文件：", val);

  arr.map(file => {
    readyFiles.value.push(file);
    let RespsId = file.id;
    
    console.log("Strapi文件ID", RespsId);
    if (updateImgFor.value == "avatar") {
      createBizcardParams.value.data.avatar = RespsId;
      motifyAvatar.value = false;
    }
    if (updateImgFor.value == "providerQRcode") {
      createBizcardParams.value.data.providers[
        updateImgIndex.value
      ].invite_qrcode = RespsId;
    }
    if (updateImgFor.value == "providerIcon") {
      createBizcardParams.value.data.providers[
        updateImgIndex.value
      ].provider_icon = RespsId;
    }
  })
};
const {
  mutate: createBizcardMutate,
  onDone,
  onError,
} = createBizcard(createBizcardParams);
const cantSubmit = ref();
const submitCreate = async () => {
  cantSubmit.value = true;
  createBizcardParams.value.data.publishedAt = new Date().toISOString();
  const { data } = await createBizcardMutate();

  if (data) {
    emit("bizcardCreated", data);
  }
};
const cannelCreate = () => {
  emit("bizcardCannelCreated");
};
watch(
  createBizcardParams,
  () => {
    if (createBizcardParams.value) {
      if (
        createBizcardParams.value.data.title &&
        createBizcardParams.value.data.name &&
        (createBizcardParams.value.data.phone ||
          createBizcardParams.value.data.email)
      ) {
        cantSubmit.value = false;
      } else {
        cantSubmit.value = true;
      }
    }
  },
  { immediate: true, deep: true }
);

const pushProvider = () => {

}
</script>
