<template>
  <div v-if="authBase" class="fit q-space column no-wrap q-pb-lg">
    <template
      v-if="useAuths('manageRole', [authBase?.collection])"
    >
      <q-toolbar class="transparent overflow-hidden full-width" :class="isCardRef ? 'border-bottom' : ''">
        <q-tabs v-model="active_role" dense outside-arrows align="left" class="q-space scroll-x">
          <q-tab
            v-for="i in role"
            :key="i.id"
            :name="i.subject"
            :label="$t(`field_${i.subject}`)"
            no-caps
          >
            <q-menu
              v-if="!locked_role.includes(i.subject)"
              context-menu
              class="radius-sm"
            >
              <q-list
                bordered
                dense
                class="q-pa-xs radius-sm"
                style="min-width: 100px"
              >
                <q-item
                  clickable
                  v-close-popup
                  class="radius-xs"
                  @click="remove(i)"
                >
                  <q-item-section side><q-icon name="close" /></q-item-section>
                  <q-item-section>删除此角色</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-tab>
        </q-tabs>
        <template v-if="$q.screen.gt.xs">
          <q-input
            v-if="createRole_ing"
            v-model="createRole_params.data.subject"
            dense
            square
            filled
            type="text"
            :placeholder="$t('role_name')"
          >
            <template #append>
              <q-btn flat dense round icon="check" @click="createRole()" />
            </template>
          </q-input>
          <q-btn
            v-else
            flat
            dense
            round
            icon="add"
            @click="createRole_ing = !createRole_ing"
            class="q-px-sm"
          />
        </template>
        <slot name="toolbar-btn"></slot>
      </q-toolbar>
      <q-scroll-area
        v-if="active_role_detial"
        class="q-space column q-pa-md gap-lg"
      >
        <div
          v-for="collection in active_role_detial.ACL"
          :key="collection.id"
          class="column no-wrap gap-sm"
        >
          <span class="border-bottom q-py-sm font-larger font-bold-600">{{
            $t(`field_${collection.collection}`)
          }}</span>
          <div v-if="collection.collection !== 'project'" class="row gap-md">
            <q-checkbox
              v-model="collection.read"
              dense
              size="xs"
              :label="$t(`field_read`)"
              :disable="disable_checkbox_collection"
              :class="collection.read ? '' : 'op-3'"
              @click="update()"
            />
            <q-checkbox
              v-model="collection.create"
              dense
              size="xs"
              :label="$t(`field_create`)"
              :disable="disable_checkbox_collection"
              :class="collection.create ? '' : 'op-3'"
              @click="update()"
            />
            <q-checkbox
              v-model="collection.modify"
              dense
              size="xs"
              :label="$t(`field_modify`)"
              disable
              :class="collection.modify ? '' : 'op-3'"
              @click="update()"
              ><q-tooltip>
                {{ $t('permission_autoset_tip') }}
              </q-tooltip></q-checkbox
            >
            <q-checkbox
              v-model="collection.delete"
              dense
              size="xs"
              :label="$t(`field_delete`)"
              :disable="disable_checkbox_collection"
              :class="collection.delete ? '' : 'op-3'"
              @click="update()"
            />
          </div>
          <div class="column gap-sm">
            <div class="row gap-md">
              <template
                v-for="field in collection.fields_permission"
                :key="field.id"
              >
                <q-checkbox
                  v-model="field.modify"
                  dense
                  size="xs"
                  :label="$t(`field_${field.field}`)"
                  :disable="
                    disable_checkbox_collection ||
                    disable_checkbox_field(collection, field.field)
                  "
                  :class="field.modify ? '' : 'op-3'"
                  @click="update()"
                >
                  <q-tooltip
                    v-if="disable_checkbox_field(collection, field.field)"
                    :class="`border shadow-focus font-small ${
                      $q.dark.mode ? 'bg-grey-10' : 'bg-grey-1'
                    }`"
                  >
                  {{ $t('set_admin_only_tip') }}
                  </q-tooltip>
                </q-checkbox>
              </template>
            </div>
          </div>
        </div>
      </q-scroll-area>
    </template>
    <div v-else class="fit flex flex-center">
      <span class="op-5">{{ $t('set_no_permission_tip') }}</span>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
  toRef,
  watch,
  watchEffect,
} from "vue";
import { __dict } from "src/hooks/dict.js";
import {
  createMemberRole,
  updateMemberRole,
  deleteMemberRole,
} from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import { useQuasar } from "quasar";
import { userStore, teamStore } from "src/hooks/global/useStore.js";
import { i18n } from 'src/boot/i18n.js';

const props = defineProps({
  isCard: {
    type: Boolean,
    default: false,
  },
});
const $t = i18n.global.t;

const userId = computed(() => teamStore.init?.id);

const isCardRef = toRef(props, "isCard");
const $q = useQuasar();

const authBase = ref();

const role = ref();
const locked_role = ["creator", "owner", "member", "unconfirmed", "external"];

const active_role = ref();
const active_role_detial = ref();
const init = () => {
  active_role.value = role.value && role.value[0].subject;
};

const processData = () => {
  // console.log("processData");
  const members = teamStore.card?.card_members?.map((i) => i.by_user.id);
  if (members?.includes(userId.value)) {
    authBase.value = {
      collection: "card",
      of: "card",
    };
  } else {
    authBase.value = {
      collection: isCardRef.value ? "card" : "project",
      of: "project",
    };
  }
  if (teamStore?.card) {
    role.value = teamStore.card?.member_roles;
  } else if (teamStore?.project) {
    role.value = teamStore.project?.member_roles;
  }
};

const projectRole = ref();
const cardRole = ref();
watchEffect(() => {
  active_role.value = active_role.value
    ? active_role.value
    : role.value && role.value[0].subject;
  active_role_detial.value =
    active_role.value &&
    role.value?.find((i) => i.subject === active_role.value);

  projectRole.value = teamStore.project?.member_roles;
  cardRole.value = teamStore.card?.member_roles;
});

watch(
  [projectRole, cardRole],
  () => {
    if (projectRole.value || cardRole.value) {
      processData();
    }
  },
  { immediate: false, deep: false }
);

onBeforeMount(() => {
  processData();
});

onMounted(() => {
  init();
  // console.log('role', role.value);
});
const disable_checkbox_collection = computed(
  () =>
    active_role.value === "creator" ||
    active_role.value === "owner" ||
    active_role.value === "unconfirmed" ||
    active_role.value === "external"
);
const disable_checkbox_field = (collection, field) => {
  let disable_modify_fileds = ["author"];
  if (collection.collection === "project") {
    const _ = ["name", "type"];
    disable_modify_fileds = [...disable_modify_fileds, ..._];
  }
  return disable_modify_fileds.includes(field);
};

watchEffect(() => {
  if (active_role_detial.value) {
    // console.log("active_role_detial.value", active_role_detial.value);
    active_role_detial.value.ACL = active_role_detial.value?.ACL?.map((i) => ({
      ...i,
      modify: i.fields_permission.filter((j) => j.modify)?.length > 0,
    }));
  }
});

const loading = ref(false);
// 定义一个已变化变量，当用户修改时为真，在用户离开权限设置组件后发送ws消息给其它成员通知权限变化
// 如果此处实时修改变化数据，当前用户界面会实时触发鉴权判断，但是鉴权判断依赖的数据此时正在修改
// 导致修改期间鉴权结果均为false，UI会短暂闪烁，因此修改数据页面变化，但pinia中的数据在关闭组件时再更新，那时再触发鉴权判断时数据已经更新完毕，不会闪烁
const isChanged = ref(false);
const update = async () => {
  const params = active_role_detial.value;
  const role_id = params.id;
  // delete params.id; put时不需要ID，但是可能有连续操作，这里不删除ID，后端处理
  const res = await updateMemberRole(role_id, params);
  if (res) {
    isChanged.value = true;
  }
};

const remove = async (member_role) => {
  const _id = member_role.id;
  const res = await deleteMemberRole(_id);
  if (res?.data) {
    const removed_id = res.data.id;
    if (isCardRef.value) {
      teamStore.card.member_roles = teamStore.card?.member_roles.filter(
        (i) => i.id !== removed_id
      );
    } else {
      teamStore.project.member_roles = teamStore.project?.member_roles.filter(
        (i) => i.id !== removed_id
      );
    }
    init();
    isChanged.value = true;
  }
};

onBeforeUnmount(() => {
  if (isChanged.value) {
    // 手动更新数据 - 使用ws更新，这里注释
    // if (isCardRef.value) {
    //   teamStore.card.member_roles = teamStore.card?.member_roles?.map(
    //     (i) => (i.id === res.data.id ? res.data : i)
    //   );
    // } else {
    //   teamStore.project.member_roles =
    //     teamStore.project?.member_roles?.map((i) =>
    //       i.id === res.data.id ? res.data : i
    //     );
    // }
    let MsgParmas = {
      by_user: userStore.userId,
      action: "role_updated",
    };
    if (isCardRef.value) {
      MsgParmas.is = "card";
      MsgParmas.card_id = teamStore.card.id;
    } else {
      MsgParmas.is = "project";
      MsgParmas.project_id = teamStore.project.id;
    }
    let chat_Msg = {
      body: `${userStore.me?.username}更新了${
        teamStore.card ? "卡片" : "项目"
      }的权限系统`,
      props: {
        strapi: {
          data: MsgParmas,
        },
      },
    };
    send_chat_Msg(chat_Msg);
  }
});

const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};
const createRole_ing = ref(false);
const createRole_params = ref({
  data: {
    subject: "",
  },
});
const createRole = async () => {
  let role_alreadyIn = role.value.map((i) => i.subject);
  if (role_alreadyIn.includes(createRole_params.value.subject)) {
    $q.notify($t('same_role_exit_tip'));
    return;
  }
  if (isCardRef.value) {
    createRole_params.value.by_card = teamStore.card?.id;
  } else {
    createRole_params.value.by_project = teamStore.project?.id;
  }
  const res = await createMemberRole(createRole_params.value);
  if (res?.data) {
    // if (isCardRef.value) {
    //   teamStore.card.member_roles.push(res?.data);
    // } else {
    //   teamStore.project.member_roles.push(res?.data);
    // }
    role.value = [...role.value, res?.data];
    active_role.value = res?.data?.subject;
    createRole_ing.value = false;
  }
  isChanged.value = true;
};
const dict = __dict();
const translate = (i) => {
  return dict.find((item) => item.key === i)?.value || i;
};
</script>
