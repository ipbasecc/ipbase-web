<template>
  <q-card
    bordered
    style="min-width: 28rem"
    :class="$q.dark.mode ? 'text-grey-1 bg-grey-10' : 'text-grey-9 bg-grey-1'"
  >
    <q-card-section class="row items-center border-bottom">
      <div class="column no-wrap gap-xs q-pr-md">
        <span class="text-h6">{{ `共享此${target}` }}</span>
        <span v-if="user_shareCode" class="op-7">{{
          `你已共享过该${target},您可以直接分享此连接，或修改共享`
        }}</span>
      </div>
      <q-space />
      <q-btn-group v-if="user_shareCode" class="q-mr-sm border">
        <q-btn
          v-if="modify"
          dense
          flat
          padding="xs md"
          label="返回"
          @click="showBeforeShare()"
        />
        <q-btn
          v-else
          dense
          :flat="!waring"
          :color="waring ? 'deep-orange' : ''"
          padding="xs md"
          label="修改"
          @click="editeShare()"
        />
        <q-btn dense flat size="sm" icon="mdi-menu-down" class="border-left">
          <q-menu class="radius-sm" ref="moreActionRef">
            <q-list
              dense
              bordered
              class="radius-sm q-pa-xs"
              :class="$q.dark.mode ? '' : 'text-grey-9'"
            >
              <q-item
                clickable
                v-close-popup
                class="radius-xs"
                @click="deleteShare()"
              >
                <q-item-section side><q-icon name="close" /></q-item-section>
                <q-item-section>删除并创建新共享</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-btn-group>
    </q-card-section>
    <q-card-section v-if="waring" class="bg-deep-orange row">
      该共享已失效，如有需要，请点击修改按钮更新共享连接
      <q-space />
      <q-btn flat dense size="sm" round icon="close" @click="waring = false" />
    </q-card-section>
    <q-card-section v-if="confirmRemove" class="bg-info row">
      您并没有新建“共享”，旧“共享”将依然存在
      <q-space />
      <q-btn
        flat
        dense
        icon="close"
        label="知道了"
        @click="confirmRemoveFn()"
      />
    </q-card-section>
    <template v-if="!share_url || modify">
      <q-card-section
        class="row items-center q-px-xl q-py-lg"
        :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-3'"
      >
        <form class="column no-wrap gap-md fit">
          <q-input
            v-model="share_code.code"
            outlined
            type="text"
            label="分享码"
            :readonly="user_shareCode && !remove"
          >
            <template v-slot:append>
              <q-btn
                v-if="!user_shareCode || remove"
                flat
                dense
                round
                icon="mdi-refresh"
                @click="share_code.code = randomKey(6)"
              />
              <q-btn
                v-if="user_shareCode && !remove"
                flat
                dense
                round
                icon="info"
              >
                <q-tooltip v-if="user_shareCode" class="no-padding">
                  <q-card bordered class="q-pl-none q-py-xs q-pr-xs">
                    <q-card-section>
                      <ul class="font-medium">
                        <li>{{ `您已经共享过此“${target}”了，不可以修改共享码` }}</li>
                        <li>否则其它用户将不能使用其访问</li>
                        <li>您可以删除此共享</li>
                        <li>
                          您可以在删除后重新共享，从而废弃旧共享，使用新共享
                        </li>
                      </ul>
                    </q-card-section>
                  </q-card>
                </q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <q-input
            v-model.number="share_code.max_count"
            type="number"
            step="1"
            outlined
            label="最大查看次数"
            :rules="[val => val > 0 || '不能小于0']"
            @input="checkInput(share_code.max_count)"
          />
          <q-input
            v-model="share_code.up_time"
            type="text"
            outlined
            label="有效期"
            mask="date"
          >
            <template v-slot:append>
              <q-btn flat dense round icon="event">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="share_code.up_time"
                    minimal
                    bordered
                    mask="YYYY-MM-DD"
                    :class="$q.dark.mode ? 'text-grey-1' : 'text-grey-9'"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-btn>
            </template>
          </q-input>
        </form>
      </q-card-section>
      <q-card-section
        class="column gap-md q-px-xl q-pt-lg q-pb-xl border-top"
        :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-3'"
      >
        <div class="font-medium">选择共享的功能模块</div>
        <div class="row gap-md">
          <q-checkbox v-for="i in share_code.props" :key="i.val" dense v-model="i.enable" :label="i.label" @update:model-value="setShareEnable(share_code.props)" />
        </div>
      </q-card-section>
    </template>
    <template v-else>
      <q-card-section class="row no-wrap justify-around" :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-3'">
        <q-list>
          <q-item>
            <q-item-section side>提取码：</q-item-section>
            <q-item-section>{{user_shareCode?.code}}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section side>可用次数：</q-item-section>
            <q-item-section>{{user_shareCode?.max_count}}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section side>过期时间：</q-item-section>
            <q-item-section>{{user_shareCode?.up_time ? user_shareCode?.up_time : '永久 '}}</q-item-section>
          </q-item>
        </q-list>
        <qrcode-vue :value="share_url" :size="240" level="H" />
      </q-card-section>
      <q-card-section>
        <div
            class="border cursor-pointer full-width q-pa-md radius-sm scroll"
            @click="copy_uri(share_url)"
            @mouseenter="autoSeletURL"
        >
          <span ref="urlRef">{{ share_url }}</span>
        </div>
      </q-card-section>
    </template>
    <q-card-section class="row items-center q-pa-sm border-top">
      <q-btn flat dense padding="xs md" label="返回" v-close-popup />
      <q-space />
      <q-btn
        dense
        padding="xs md"
        color="primary"
        icon="check"
        label="确认"
        :disable="!share_code.code || !userStore.userId || !isChanged"
        @click="createShare(share_code)"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { copyToClipboard, useQuasar } from "quasar";
import QrcodeVue from "qrcode.vue";
import {computed, onMounted, ref, toRefs, watch, watchEffect} from 'vue';
import { randomKey } from "src/hooks/utilits.js";
import { userStore } from "src/hooks/global/useStore.js";

const props = defineProps({
  share_item: {
    type: Object,
    default: null,
  },
  is: {
    type: String,
    default: null,
  },
  share_props: {
    type: Array,
    default: null,
  }
});
const { share_item, is, share_props } = toRefs(props);
const target = ref();
watchEffect(() => {
  if (is.value === "card") {
    target.value = "卡片";
  }
});
const emit = defineEmits(["createShare"]);

const $q = useQuasar();
const user_shareCode = computed(() =>
  share_item.value?.share_codes?.find(
    (i) => i.creator?.id === Number(userStore.userId)
  )
);

const share_code = ref({
  code: user_shareCode.value ? user_shareCode.value?.code : randomKey(6),
  max_count: user_shareCode.value ? user_shareCode.value?.max_count : 20,
  up_time: user_shareCode.value ? user_shareCode.value?.up_time : "",
  props: user_shareCode.value?.props || share_props.value
});
const modulesChanged = ref(false);
const setShareEnable = (_share_props) => {
  share_code.value.props = _share_props
  modulesChanged.value = true
}
const isChanged = computed(() => share_code.value?.code !== user_shareCode.value?.code
  || share_code.value?.up_time !== user_shareCode.value?.up_time
  || share_code.value?.max_count !== user_shareCode.value?.max_count
  || modulesChanged.value
)
const genShareUrl = (code) => {
  share_url.value = `${process.env.APP_URI}${is.value}/share/${share_item.value?.id}?share_code=${code}&share_by=${userStore.userId}`;
};
const share_url = ref();
const createShare = async (share_code) => {
  if (!share_code.code) return;
  share_code.up_time = share_code.up_time?.replace(/\//g, "-") || null;
  emit("createShare", share_code);
  modify.value = false;
};
const modify = ref(false);
const editeShare = () => {
  share_url.value = "";
  modify.value = true;
};
const moreActionRef = ref();
const confirmRemove = ref(false);
const confirmRemoveFn = () => {
  confirmRemove.value = false;
  remove.value = false;
  showBeforeShare();
};
const showBeforeShare = () => {
  if (remove.value) {
    confirmRemove.value = true;
  }
  genShareUrl(user_shareCode.value?.code);
  modify.value = false;
  moreActionRef.value.hide();
};
const remove = ref(false);
const deleteShare = () => {
  share_url.value = "";
  modify.value = true;
  remove.value = true;
};
const checkInput = (count) => {
  if (count < 0) {
    share_code.value.max_count = 0;
  }
};
const copy_uri = (val) => {
  copyToClipboard(val)
    .then(() => {
      $q.notify("邀请链接已复制到剪贴板");
    })
    .catch(() => {
      $q.notify("复制出错，请手动复制");
    });
};
const waring = ref(false);
const urlRef = ref(false);
const autoSeletURL = () => {
  if (window.getSelection && document.createRange) {
    const range = document.createRange();
    range.selectNodeContents(urlRef.value);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
onMounted(() => {
  waring.value =
    share_item.value?.share_codes?.filter((i) => i.max_count < 1)?.length > 0;
});
watch(
  user_shareCode,
  () => {
    if (user_shareCode.value?.code) {
      genShareUrl(user_shareCode.value?.code);
    }
  },
  { immediate: true, deep: false }
);
</script>

<style lang="scss" scoped></style>
