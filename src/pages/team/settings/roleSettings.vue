<template>
  <div v-if="authBase" class="absolute-full q-space column no-wrap q-pb-lg">
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
            class="radius-xs overflow-hidden"
            @keydown.esc="createRole_ing = false"
          >
            <template #append>
              <q-btn v-if="createRole_params.data.subject" flat dense round icon="check" @click="createRole()" />
              <q-btn v-else flat dense round icon="close" @click="createRole_ing = false" />
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
  onMounted,
  ref,
  toRef,
  watch,
  watchEffect,
  nextTick
} from "vue";
import { __dict } from "src/hooks/dict.js";
import {
  createMemberRole,
  updateMemberRole,
  deleteMemberRole,
} from "src/api/strapi/project.js";
import { useQuasar } from "quasar";
import { teamStore } from "src/hooks/global/useStore.js";
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

const processData = () => {
  // console.log("processData");
  if (teamStore?.card) {
    role.value = teamStore.card?.member_roles;
  } else if (teamStore?.project) {
    role.value = teamStore.project?.member_roles;
  }
  const hideRoles = [ 'blocked', 'unconfirmed', 'external', 'creator', 'owner'];
  role.value = role.value.filter(i => !hideRoles.includes(i.subject));
};

const projectRole = computed(() => teamStore.project?.member_roles);
const cardRole = computed(() => teamStore.card?.member_roles);
watchEffect(() => {
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

  active_role.value = active_role.value || role.value && role.value[0].subject;
  active_role_detial.value = active_role.value && role.value?.find((i) => i.subject === active_role.value);
});
watch([projectRole, cardRole], () => {
  if (projectRole.value || cardRole.value) {
    processData();
  }
},{ immediate: true, deep: true });

onMounted(() => {
  active_role.value = role.value && role.value[0].subject;
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
    isChanged.value = true;
  }
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
    createRole_ing.value = false;
  }
  isChanged.value = true;
};
const dict = __dict();
const translate = (i) => {
  return dict.find((item) => item.key === i)?.value || i;
};
</script>
