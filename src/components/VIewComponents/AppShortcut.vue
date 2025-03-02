<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const shortcuts = [
  {
    description: t("shortcut_expand_next_nav"),
    shortcut: "shift >",
    props: t("shortcut_expand_next_nav_props"),
  },
  {
    description: t("shortcut_collapse_next_nav"),
    shortcut: "shift <",
    props: t("shortcut_collapse_next_nav_props"),
  },
  {
    description: t("hide_atom_chat"),
    shortcut: "ESC",
    props: t("hide_atom_chat_props"),
  },
  {
    description: t("quick_create_card"),
    shortcut: t("quick_create_card_shortcut"),
    props: t("quick_create_card_props"),
  },
  {
    description: t("cancel_quick_create_card"),
    shortcut: "ESC",
    props: t("cancel_quick_create_card_props"),
  },
  {
    description: t("window_zoomin"),
    shortcut: "Ctrl / Command + Shift + +",
    props: t("window_zoomin_props"),
  },
  {
    description: t("window_zoomout"),
    shortcut: "Ctrl / Command + Shift + -",
    props: t("window_zoomout_props"),
  },
  {
    description: t("window_zoom_rest"),
    shortcut: "Ctrl / Command + Shift + 0",
    props: t("window_zoom_rest_props"),
  },
];
</script>

<template>
  <q-markup-table flat class="no-shadow">
    <thead>
      <tr>
        <th class="text-left">{{ $t("shortcut_table_header_desc") }}</th>
        <th class="text-right">{{ $t("shortcut_table_header_key") }}</th>
        <th class="text-right">{{ $t("shortcut_table_header_props") }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="i in shortcuts" :key="i.description">
        <td class="text-left">{{ i.description }}</td>
        <td class="text-right">{{ i.shortcut }}</td>
        <td class="text-right">{{ i.props }}</td>
      </tr>
    </tbody>
  </q-markup-table>
</template>

<style scoped lang="scss"></style>
