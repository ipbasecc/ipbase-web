<template>
  <q-card
    v-if="props"
    bordered
    class="q-mt-xs column no-wrap"
    :style="$q.screen.gt.xs ? 'width: 322px' : 'width: 100%'"
    @mouseenter="uiStore.dragKanbanScrollEnable = false"
    @mouseleave="uiStore.dragKanbanScrollEnable = true"
  >
    <q-card-section
      v-if="create_with_name || name_onlyRef"
      class="q-pa-xs"
    >
      <q-input
        v-model="params.data.name"
        type="text"
        :placeholder="$t('type_name_here')"
        dense
        square
        filled
        autofocus
        class="full-width"
        @keydown.esc="closeCreate()"
        @keyup.enter="createCardFn"
        @keyup.ctrl.enter="createCardFn"
      >
        <template v-if="params.data.name" v-slot:append>
          <q-btn
            icon="check"
            dense
            size="sm"
            flat
            round
            @click="createCardFn"
          />
        </template>
      </q-input>
    </q-card-section>
    <template v-else>
      <q-card-section class="column no-wrap q-space q-pa-none card no-padding">
        <TipTap
          :square="true"
          need="json"
          :toolbarHeight="34"
          @tiptapBlur="tiptapBlur"
          @tiptapUpdate="tiptapUpdate"
          @keyup.ctrl.enter="createCardFn"
        />
      </q-card-section>
      <q-card-section class="row no-wrap q-pa-xs border-top">
        <q-btn
          dense
          padding="xs md"
          flat
          :label="$t('cancel')"
          @click.stop="closeCreate()"
        />
        <q-space />
        <q-btn
          dense
          padding="xs md"
          color="primary"
          icon="done_all"
          :label="$t('create')"
          :disable="loading"
          @click="createCardFn"
        />
      </q-card-section>
    </template>
    <div v-if="loading" class="absolute-full bg-black op-5 flex flex-center">
      <q-spinner-orbit color="primary" size="2em" />
    </div>
  </q-card>
</template>

<script setup>
import {ref, toRefs, watchEffect, computed, watch, onMounted, onBeforeUnmount} from 'vue';
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import { createCard } from "src/api/strapi/project.js";
import { board_type } from "src/pages/team/kanban/BoradsList.js";
import { isEqual } from "lodash-es";
import {uiStore} from "src/hooks/global/useStore";

const props = defineProps({
  column_id: {
    type: Number,
    default: NaN,
  },
  name_only: {
    type: Boolean,
    default: false,
  },
  DefaultCreateCardType: {
    type: String,
    default: "note",
  },
  createType: {
    type: String,
    default: null,
  },
});
const {
  column_id: column_idRef,
  name_only: name_onlyRef,
  DefaultCreateCardType: DefaultCreateCardTypeRef,
  createType: createTypeRef,
} = toRefs(props);

// 新建卡片的类型
const type_for_create = computed(() => {
  const _cardType =
    board_type.value === "kanban"
      ? createTypeRef.value || DefaultCreateCardTypeRef.value
      : board_type.value;
  let _type;
  const cardTypes_byKanban = ["task", "note", "todo"];
  if (cardTypes_byKanban.includes(_cardType)) {
    _type = _cardType;
  } else {
    _type = board_type.value;
  }
  return _type;
});
// 新建表单是不是只需要 name 字段
const create_with_name = computed(() => {
  const asNames = ["todo", "classroom"];
  let _asName = false;
  if (asNames.includes(type_for_create.value)) {
    _asName = true;
  }
  return _asName;
});

const params = ref();
watchEffect(() => {
  params.value = {
    column_id: column_idRef.value,
    data: {
      status: "pending",
      type: type_for_create.value,
      name: "",
      jsonContent: "",
    },
  };
});

// 此处同步接收Tiptap的内容，用户在输入内容后直接点击新建按钮可能不会触发Blur事件
const tiptapUpdate = (val) => {
  if (isCannel.value) return;
  console.log("tiptapUpdate");

  params.value.data.jsonContent = val;
};
const loading = ref(false);
const isCannel = ref(false);
const isBlur = ref(false);
const tipta_source = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};
const tiptapBlur = async (val) => {
  if (loading.value || isCannel.value) return;
  console.log("tiptapBlur");

  const isChanged = !isEqual(tipta_source, val);
  if (!isChanged) {
    return;
  }

  params.value.data.jsonContent = val;
  isBlur.value = true;
};
watch([isBlur, isCannel], () => {
  if (isBlur.value) {
    setTimeout(() => {
      if (!isCannel.value) {
        createCardFn();
      }
    }, 100);
  }
});

const emit = defineEmits(["closeCreate"]);

const createCardFn = async () => {
  if (isCannel.value) return;
  if (loading.value) {
    closeCreate();
    return;
  }
  loading.value = true;
  if (!name_onlyRef.value) {
    const isChanged = !isEqual(tipta_source, params.value.data.jsonContent);
    if (
      (!isChanged || !params.value.data.jsonContent) &&
      !params.value.data.name &&
      !params.value.data.content
    ) {
      closeCreate();
      return;
    }
  } else if (!params.value.data.name && !params.value.data.content) {
    closeCreate();
    return;
  }
  let res = await createCard(params.value);
  if (res?.data) {
    closeCreate(); // 父组件关闭创建窗口
  } else {
    console.log(res);
  }
};
const closeCreate = () => {
  isCannel.value = true;
  emit("closeCreate");
};
onMounted(() => {
  uiStore.disable_shortcut = true
})
onBeforeUnmount(() => {
  uiStore.disable_shortcut = false
})
</script>

<style lang="scss" scoped></style>
