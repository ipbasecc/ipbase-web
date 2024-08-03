<template>
  <q-card
    class="full-width"
    bordered
    :class="`${highlight && !edge?.color ? 'card-selected' : ''} ${
      highlight ? 'shadow-focus z-fab' : 'no-shadow'
    }`"
    :style="`${highlight && edge?.color ? `border-color: ${edge?.color}` : ''}`"
    @click="enterCard(card)"
  >
    <q-card-section
      v-if="card.name"
      class="row no-wrap gap-sm q-pa-xs q-pr-sm border-bottom items-center hovered-item"
    >
      <StatusMenu
        v-if="card.type === 'task'"
        :modify="false"
        :status="card.status"
      />
      <div
        v-if="
          name_changing &&
          useAuths('name', ['card'], card?.card_members, card?.member_roles)
        "
        class="undrag text-medium q-space cursor-text q-px-sm z-fab"
        style="
          writing-mode: lr;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        "
        :contenteditable="true"
        autofocus
        @input="updateContent"
        :class="name_changing ? 'border-bottom' : ''"
        @blur="_updateCardName(card, updateParmars.data.name)"
        @keydown.esc="name_changing = false"
        @keyup.enter="_updateCardName(card, updateParmars.data.name)"
      >
        {{ card.name }}
      </div>
      <div
        v-else
        class="text-medium q-space text-line-1 q-px-sm cursor-pointer z-fab"
      >
        <!-- {{ card.id }} |  -->
        <span @click="name_changing = true" class="undrag cursor-text">{{
          card.name
        }}</span>
      </div>
    </q-card-section>
    <q-card-section>
      <TipTap
        :jsonContent="card.jsonContent"
        :editable="false"
        :need="'json'"
      />
    </q-card-section>
    <q-card-section
      class="row no-wrap gap-sm items-center q-px-sm q-py-xs border-top hovered-item dragBar"
    >
      <q-icon
        :name="
          color_marker && show_byPreference?.color_marker?.value
            ? 'mdi-checkbox-blank-circle'
            : 'more_vert'
        "
        :color="
          color_marker && show_byPreference?.color_marker?.value
            ? color_marker
            : 'grey'
        "
        class="cursor-pointer undrag"
      >
        <q-menu
          v-if="
            useAuths('name', ['card'], card?.card_members, card?.member_roles) ||
            useAuths(
              'color_marker',
              ['card'],
              card?.card_members,
              card?.member_roles
            ) ||
            useAuths('type', ['card'], card?.card_members, card?.member_roles) ||
            useAuths('status', ['card'], card?.card_members, card?.member_roles) ||
            useAuths('delete', ['card'], card?.card_members, card?.member_roles)
          "
          class="shadow-24"
        >
          <q-list bordered dense class="radius-sm q-pa-xs text-no-wrap">
            <template v-if="!content_channging">
              <q-item class="radius-xs">
                <q-item-section>
                  <div class="row no-wrap gap-sm">
                    <q-btn
                      v-if="
                        useAuths(
                          'name',
                          ['card'],
                          card?.card_members,
                          card?.member_roles
                        )
                      "
                      flat
                      dense
                      size="sm"
                      stack
                      class="op-5"
                      padding="sm"
                      v-close-popup
                      @click="name_changing = true"
                    >
                      <ReName />
                      <q-tooltip>
                        <span class="font-medium">{{ $t('rename_card') }}</span>
                      </q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </template>
            <template
              v-if="
                show_byPreference?.color_marker?.value &&
                useAuths(
                  'color_marker',
                  ['card'],
                  card?.card_members,
                  card?.member_roles
                )
              "
            >
              <q-separator spaced class="op-5" />
              <q-item>
                <q-item-section>
                  <div class="row no-wrap gap-sm">
                    <q-icon
                      v-for="marker in colorMarks"
                      :key="marker"
                      dense
                      :size="card?.color_marker === marker ? '24px' : '16px'"
                      flat
                      round
                      padding="none"
                      :color="marker"
                      :name="
                        card?.color_marker === marker
                          ? 'mdi-checkbox-marked-circle'
                          : 'mdi-checkbox-blank-circle'
                      "
                      class="cursor-pointer"
                      v-close-popup
                      @click="setCardColor(card, marker)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </template>
            <q-separator
              v-if="
                useAuths(
                  'name',
                  'type',
                  card?.card_members,
                  card?.member_roles
                ) ||
                useAuths(
                  'name',
                  'status',
                  card?.card_members,
                  card?.member_roles
                )
              "
              spaced
              class="op-5"
            />
            <q-item
              v-if="
                useAuths('name', 'type', card?.card_members, card?.member_roles)
              "
              class="radius-xs"
              clickable
            >
              <q-item-section>{{ $t('change_to') }}:</q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" />
              </q-item-section>
              <q-menu auto-close anchor="top end" self="top start">
                <q-list dense bordered class="radius-sm q-pa-xs text-no-wrap">
                  <q-item
                    v-for="i in cardTypes"
                    :key="i.val"
                    dense
                    clickable
                    class="radius-xs"
                    :class="i.val === card.type ? 'bg-primary' : ''"
                    @click="setCardType(card, i.val)"
                  >
                    <q-item-section side
                      ><q-icon :name="i.icon" size="xs"
                    /></q-item-section>
                    <q-item-section
                      ><span class="q-pr-md">{{
                        i.label
                      }}</span></q-item-section
                    >
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
            <q-item
              v-if="
                useAuths(
                  'name',
                  'status',
                  card?.card_members,
                  card?.member_roles
                ) &&
                card.type === 'task' &&
                show_byPreference?.status?.value
              "
              class="radius-xs"
              clickable
            >
              <q-item-section>{{ $t('status') }}:</q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" />
              </q-item-section>
              <q-menu auto-close anchor="top end" self="top start">
                <StatusMenu
                  :status="card.status"
                  @statusChange="_card_statusChange"
                  :isList="true"
                />
              </q-menu>
            </q-item>
            <template
              v-if="
                useAuths(
                  'name',
                  'delete',
                  card?.card_members,
                  card?.member_roles
                )
              "
            >
              <q-separator spaced class="op-5" />
              <q-item
                class="radius-xs"
                clickable
                v-close-popup
                @click="removeCard(card, belong_card)"
              >
                <q-item-section>{{ $t('delete_card') }}</q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-menu>
      </q-icon>
    </q-card-section>
    <!-- 重要度、紧急度 左边框颜色标记 -->
    <div
      v-if="edge"
      class="absolute-left full-height z-fab"
      :class="`${edge.highlight ? 'highlight transition' : ''}`"
      :style="`${edge.style}`"
    ></div>
  </q-card>
</template>
<script setup>
import { ref, reactive, toRefs, computed } from "vue";
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import StatusMenu from "src/pages/team/components/user/StatusMenu.vue";
import ReName from "../components/widgets/icons/ReName.vue";
import { teamStore } from "src/hooks/global/useStore.js";
import {
  clac_cardEdgeStyle,
  updateCardName,
  setCardType,
  setCardColor,
  removeCard,
  setStatus,
} from "src/hooks/team/useCard.js";
import { useProjectCardPreference } from "src/pages/team/hooks/useSettingTemplate.js";

const props = defineProps({
  card: {
    type: Object,
    default: null,
  },
});

const { card } = toRefs(props);

const color_marker = computed(
  () =>
    (card.value?.color_marker &&
      card.value.color_marker !== "clear" &&
      card.value.color_marker) ||
    null
);
const edge = clac_cardEdgeStyle(card.value);
const enterCard = (card) => {
  teamStore.card = card;
  teamStore.activedCard_id = card.id;
  // uiStore.externalCardsDrawer = false;
};
const highlight = computed(() => teamStore.card?.id === card.value?.id);

const project_card_preference = computed(
  () =>
    teamStore.project?.preferences?.card_settings || useProjectCardPreference()
);
const preferences = {
  status: "status",
  score: "score",
  percent: "percent",
  executor: "executor",
  follow: "follow",
  color_marker: "color_marker",
};
const show_inPreference = (val) => {
  return project_card_preference.value.find((item) => item.val === val);
};
const show_byPreference = {};
for (const key in preferences) {
  show_byPreference[key] = computed(
    () => show_inPreference(preferences[key])?.enable
  );
}
const _card_statusChange = async (val) => {
  await setStatus(card.value, val);
  if (val === "completed") {
    collapseCard();
  }
};
const name_changing = ref(false);
const updateParmars = reactive({
  project_id: teamStore.project?.id,
  data: {},
});
const updateContent = (event) => {
  updateParmars.data.name = event.target.innerHTML;
};
const _updateCardName = async (card, name) => {
  await updateCardName(card, name);
  name_changing.value = false;
};
</script>
<style scoped>
.card-selected {
  border-style: solid;
  border-color: var(--q-primary);
}
</style>
