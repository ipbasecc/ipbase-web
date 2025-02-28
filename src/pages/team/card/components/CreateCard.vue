<template>
    <q-card v-if="view_model === 'kanban'"
      v-bind="$attrs" bordered
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
          v-model="name"
          type="text"
          :placeholder="$t('type_name_here')"
          dense
          square
          filled
          autofocus
          class="full-width"
          @keydown.esc="closeCreate()"
          @keyup.enter="createTodoCard()"
        >
          <template v-if="params.data.name && !$team().saleTypes.includes(type_for_create)" v-slot:append>
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
      <template v-if="$team().saleTypes.includes(type_for_create)">
        <q-card-section v-if="type_for_create === 'classroom'" class="q-pa-xs">
          <q-checkbox v-model="allow_discover" :label="$t('show_in_discover')" />
        </q-card-section>
        <q-card-section class="border cursor-pointer q-pa-xs">
          <q-img
            v-if="cover"
            :src="cover"
            :ratio="16/9"
            spinner-color="primary"
            spinner-size="82px"
          />
          <DrapUpload v-else :isOSS="true"
          :allowedFormats="['image/jpg','image/jpeg','image/png','video/mp4','video/m4v']"
          @uploaded="setCover" style="min-height: 8rem;" :caption="$t('drop_or_pick_preview')" :maxFileSize="15 * 1024 * 1024" />
        </q-card-section>
        <q-card-section v-if="type_for_create === 'classroom'" class="q-pa-xs">
          <span class="op-5 q-pl-xs">{{ $t('price_limit') }}</span>
          <q-input
            v-model="price"
            type="number"
            :placeholder="$t('type_price_here')"
            dense
            square
            filled
            class="full-width"
            @keydown.esc="closeCreate()"
          >
            <template #prepend><q-icon color="orange" name="mdi-sale" /></template>
          </q-input>
        </q-card-section>
      </template>
      <template v-else-if="type_for_create === 'note' || type_for_create === 'task'">
        <q-card-section class="column no-wrap q-space q-pa-none card no-padding">
          <TipTap
            :square="true"
            need="json"
            :toolbarHeight="34"
            :contentChanged
            @contentChanged="contentChanged = true"
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
      <template v-else-if="$team().saleTypes.includes(type_for_create)">
        <q-card-section class="border-top q-pa-sm">
          <q-btn color="primary" :label="$t('create')" class="full-width" @click="createCardFn" />
        </q-card-section>
      </template>
    </q-card>

    <tr v-if="view_model === 'list'" class="hovered-item relative-position" :class="$q.dark.mode ? 'bg-darker' : 'bg-grey-4'">
      <td>
        <div class="fit flex flex-center hover-show op-0">
          <q-icon name="drag_indicator" />
        </div>
      </td>
      <!-- 状态 -->
      <td class="status no-padding">
      </td>
      <!-- 预览图 -->
      <td class="thumbnial no-padding">
      </td>
      <!-- 名称 -->
      <td class="name no-padding">
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
      </td>
      <!-- 内容 -->
      <td class="content q-pa-xs">
        <TipTap
          :square="true"
          need="json"
          class="border"
          :toolbarHeight="34"
          @tiptapBlur="tiptapBlur"
          @tiptapUpdate="tiptapUpdate"
          @keyup.ctrl.enter="createCardFn"
        />
      </td>
      <!-- 清单 -->
      <td class="todos no-padding">
      </td>
      <!-- 分值 -->
      <td class="score no-padding">
      </td>
      <!-- 进度 -->
      <td class="progress no-padding">
      </td>
      <!-- 关注者 -->
      <td class="follow no-padding">
      </td>
      <!-- 操作 -->
      <td class="more no-padding">
      </td>
    </tr>
</template>

<script setup>
import {ref, toRefs, nextTick, watchEffect, computed, watch, onMounted, onBeforeUnmount} from 'vue';
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import { createCard } from "src/api/strapi/project.js";
import { board_type } from "src/pages/team/kanban/BoradsList.js";
import { isEqual } from "lodash-es";
import {teamStore, uiStore} from "src/hooks/global/useStore";
import DrapUpload from 'src/components/VIewComponents/DrapUpload.vue'
import { $team } from "src/boot/service";

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
  view_model: {
    type: String,
    default: 'kanban',
  },
});
const {
  column_id: column_idRef,
  name_only: name_onlyRef,
  DefaultCreateCardType: DefaultCreateCardTypeRef,
  createType: createTypeRef,
  view_model
} = toRefs(props);

// 新建卡片的类型
/**
 * 任务看板卡片类型： "task", "note", "todo"
 * 其它看板卡片类型与board类型一致： 'classroom', 'resource', 'segment'
 */
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
  const asNames = ["todo", ...$team().saleTypes];
  let _nameOnly = false;
  if (asNames.includes(type_for_create.value)) {
    _nameOnly = true;
  }
  return _nameOnly;
});

const params = ref({});
const cover = ref()
const cover_id = ref()
const setCover = (val) => {
  // console.log('setCover', val);
  if(val?.id){
    cover_id.value = val.id
    cover.value = val.attributes?.url
  }
}
const price = ref();
const allow_discover = ref(true);
const name = ref();
const jsonContent = ref();
watchEffect(() => {
  params.value = {
    column_id: column_idRef.value,
    data: {
      status: $team().saleTypes.includes(type_for_create.value) ? 'completed' : "pending",
      type: type_for_create.value,
      name: name.value,
      jsonContent: jsonContent.value,
      price: price.value * 100,
      cover: cover_id.value,
    },
  };
});

// 此处同步接收Tiptap的内容，用户在输入内容后直接点击新建按钮可能不会触发Blur事件
const tiptapUpdate = (val) => {
  if (isCannel.value) return;
  // console.log("tiptapUpdate");

  jsonContent.value = val;
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
const contentChanged = ref(false);
const tiptapBlur = async (val) => {
  if (loading.value || isCannel.value) return;
  // console.log("tiptapBlur", val);

  const isChanged = !isEqual(tipta_source, val);
  if (!isChanged) {
    return;
  }

  jsonContent.value = val;
  isBlur.value = true;
  contentChanged.value = false;
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

const emit = defineEmits(["closeCreate", "created"]);

const createCardFn = async () => {
  // console.log('createCardFn 1');
  if (isCannel.value || loading.value) return;
  loading.value = true;
  // console.log('createCardFn 2');
  if (!name_onlyRef.value && !create_with_name.value) {
    // console.log('createCardFn 3');
    const isChanged = !isEqual(tipta_source, jsonContent.value);
    if (!isChanged || !jsonContent.value) return;
  } else {
    // console.log('createCardFn 4');
    if (!params.value.data.name) return;
  }
  // console.log('createCardFn 5');
  let {data} = await createCard(params.value);
  if (data) {
    if($team().saleTypes.includes(type_for_create.value)){
      emit('created', data)
    }
    closeCreate(); // 父组件关闭创建窗口
  }
};
const createTodoCard = () => {
  if($team().saleTypes.includes(type_for_create.value)) return;
  createCardFn(); 
}
const closeCreate = async () => {  
  await nextTick();
  if(!uiStore.slashMenuOpen){
    isCannel.value = true;
    emit("closeCreate");
  }
};
onMounted(() => {
  uiStore.disable_shortcut = true
})
onBeforeUnmount(() => {
  uiStore.disable_shortcut = false
})
</script>

<style lang="scss" scoped></style>
