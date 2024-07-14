<template>
  <q-card v-if="props" bordered class="q-mt-xs">
    <q-card-section
      v-if="DefaultCreateCardType === 'todo' || name_onlyRef"
      class="undrag q-pa-xs"
    >
      <q-input
        v-model="params.data.name"
        type="text"
        placeholder="在此输入名称"
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
    <template v-if="DefaultCreateCardType != 'todo'">
      <q-card-section class="column no-wrap q-pa-none card no-padding">
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
        <q-btn dense padding="xs md" flat label="取消" @click="closeCreate()" />
        <q-space />
        <q-btn
          dense
          padding="xs md"
          color="primary"
          icon="done_all"
          label="创建"
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
import { ref, toRefs, watchEffect, computed } from "vue";
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import { createCard, updateCard } from "src/api/strapi/project.js";
import {
  send_MattersMsg,
  send_ProjectMsg,
  send_CardMsg,
  send_WelcomeMsg,
} from "src/hooks/utilits/useSendmsg.js";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import _ from "lodash";
const projectStore = useProjectStore();
const userStore = useUserStore();

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

const type_for_create = computed(
  () => createTypeRef.value || DefaultCreateCardTypeRef.value
);
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
  params.value.data.jsonContent = val;
};
const loading = ref(false);
const tipta_source = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};
const tiptapBlur = async (val) => {
  if (loading.value) return;

  const isChanged = !_.isEqual(tipta_source, val);
  if (!isChanged) {
    return;
  }

  params.value.data.jsonContent = val;
  createCardFn();
};

const emit = defineEmits(["closeCreate"]);
const chat_service = ref({});
const card = ref();

function getFirstText(jsonData) {
  if (jsonData.type === "text") {
    return jsonData.text;
  } else if (jsonData.content && jsonData.content.length > 0) {
    for (let i = 0; i < jsonData.content.length; i++) {
      const text = getFirstText(jsonData.content[i]);
      if (text !== null) {
        return text.slice(0, 18) + (text.length > 8 ? "..." : "");
      }
    }
  } else {
    return "未命名任务";
  }
}
const genName = (i) => {
  if (i.name) {
    return i.name.slice(0, 18) + (i.name.length > 8 ? "..." : "");
  } else {
    return getFirstText(i.jsonContent);
  }
};

const createCardFn = async () => {
  if (loading.value) {
    closeCreate();
    return;
  }
  loading.value = true;
  if (!name_onlyRef.value) {
    const isChanged = !_.isEqual(tipta_source, params.value.data.jsonContent);
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
    card.value = res.data;
    if (
      projectStore.card &&
      projectStore.card?.chat_service?.chatService_postId
    ) {
      let res_data = res.data;
      delete res_data.member_roles;
      createCard_in_cardFn(res_data);
    } else {
      let res_data = res.data;
      createCard_in_projectFn(res_data);
    }
  } else {
    console.log(res);
  }
};

const createCard_in_projectFn = async (res) => {
  let mmChannelId = projectStore.project.chat_service?.mmChannelId || null;
  chat_service.value.mmChannelId = mmChannelId;
  // 在项目的频道发布一条消息：**创建了卡片***
  let chat_Msg = {
    body: `${userStore.me.username} 创建了 卡片 ${genName(card.value)}`,
    props: {
      strapi: {
        data: {
          is: "card",
          by_user: userStore.userId,
          action: "cardCreated",
          column_id: column_idRef.value,
          body: res,
        },
      },
    },
  };

  // 看板要监听来自ws的消息，如果projectRootChatID与当前项目 或 chatService_postId于当前卡片关联的一致，则重新请求看板数据并刷新视图
  // 此消息将作为项目聊天的根节点，在项目的讨论组件内聊天，其实都是在回复这条消息
  await send_MattersMsg(chat_Msg)
    .then(async (res) => {
      // console.log(res);
      loading.value = false;

      // console.log('第一条消息已发布',root_post_res.data);
      // 消息发布成功后，将此消息ID提取存入项目的chat_service
      chat_service.value.chatService_postId = res.data.id;
      // 向Card的chat模块发布第一条消息
      let chat_Msg = {
        body: `欢迎加入 - ${genName(card.value)} 任务的讨论`,
      };
      const WelcomeMsg_post = await send_WelcomeMsg(chat_Msg, res.data.id);
      if (WelcomeMsg_post) {
        // console.log('Thread已转化',chat_service_post_res.data);
        let updateparams = {
          project_id: projectStore.project.id,
          data: {
            chat_service: chat_service.value,
          },
        };
        let updateCard_res = await updateCard(card.value.id, updateparams);
        if (updateCard_res) {
          // emit('closeCreate',updateCard_res.data);
        }
      }
    })
    .catch((err) => {
      console.error(err);
    });
  delete chat_Msg.props;
  await send_ProjectMsg(chat_Msg);
};
const createCard_in_cardFn = async (res) => {
  let mmChannelId = projectStore.project.chat_service?.mmChannelId || null;
  chat_service.value.mmChannelId = mmChannelId;
  // 发布项目动态消息
  // 在项目的频道发布一条消息：**创建了卡片***
  // 看板要监听来自ws的消息，如果projectRootChatID与当前项目 或 chatService_postId于当前卡片关联的一致，则重新请求看板数据并刷新视图
  // 此消息将作为项目聊天的根节点，在项目的讨论组件内聊天，其实都是在回复这条消息
  let chat_Msg = {
    body: `${userStore.me.username} 在卡片${genName(
      projectStore.card
    )}内，创建了卡片: ${genName(card.value)}`,
    props: {
      strapi: {
        data: {
          is: "card",
          by_user: userStore.userId,
          action: "cardCreated",
          column_id: column_idRef.value,
          body: res,
        },
      },
    },
  };
  await send_MattersMsg(chat_Msg)
    .then(async (res) => {
      loading.value = false;
      console.log("发往项目动态的消息已发布", res);
      // 项目动态消息发布成功后，将此消息ID提取存入项目的chat_service
      chat_service.value.chatService_postId = res.id;
      // h回复项目动态消息，将此消息转化为Thread
      // 将此Thread作为卡片讨论窗口的根节点
      let welcomeMsg = {
        body: `欢迎加入 - ${genName(card.value)} 任务的讨论`,
      };
      const welcome_post = await send_WelcomeMsg(welcomeMsg, res.id);
      if (welcome_post) {
        // console.log('Thread已转化',chat_service_post_res.data);
        let updateparams = {
          project_id: projectStore.project.id,
          data: {
            chat_service: chat_service.value,
          },
        };
        let updateCard_res = await updateCard(card.value.id, updateparams);
        if (updateCard_res) {
          // emit('closeCreate',updateCard_res.data);
        }
      }
    })
    .catch((err) => {
      console.error(err);
    });
  delete chat_Msg.props;
  await send_CardMsg(chat_Msg);
};
const closeCreate = async () => {
  emit("closeCreate");
};
</script>

<style lang="scss" scoped></style>
