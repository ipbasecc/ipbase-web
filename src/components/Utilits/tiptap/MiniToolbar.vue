<template>
    <template v-for="(i, index) in menu" :key="index">
      <q-separator
        v-if="i.type === '|' && i.always_show"
        spaced
        inset
        vertical
      />
      <q-btn
        v-else-if="
          i.type === 'Botton' &&
          i.always_show &&
          !i.disable &&
          !disable_btn.includes(i.label)
        "
        dense
        flat
        padding="xs"
        @click="i.handler"
      >
        <q-icon size="xs" v-if="i.icon" :name="i.icon" />
        <template v-else-if="i.label">{{ i.label }}</template>
        <template v-else
          ><q-icon size="xs" name="radio_button_checked"
        /></template>
      </q-btn>
      <q-btn
        v-else-if="i.type === 'menu' && i.always_show"
        dense
        flat
        padding="xs"
      >
        <q-icon size="xs" v-if="i.icon" :name="i.icon" />
        <template v-else-if="i.label">{{ i.label }}</template>
        <template v-else
          ><q-icon size="xs" name="radio_button_checked"
        /></template>
        <q-menu>
          <q-list dense style="max-width: 600px">
            <template v-for="(item, index) in i.children" :key="index">
              <q-item clickable v-close-popup @click="item.handler">
                <q-item-section
                  class="q-px-md"
                  :class="item.class ? item.class : ''"
                  >{{ item.label }}</q-item-section
                >
              </q-item>
            </template>
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn
        v-else-if="i.type === 'set_color' && i.always_show"
        dense
        flat
        padding="xs"
      >
        <q-icon size="xs" v-if="i.icon" :name="i.icon" />
        <template v-else-if="i.label">{{ i.label }}</template>
        <template v-else
          ><q-icon size="xs" name="radio_button_checked"
        /></template>
        <q-popup-proxy>
          <q-card
            class="row gap-xs q-pa-sm border"
            style="max-width: 256px"
          >
            <template v-for="(item, index) in i.children" :key="index">
              <div
                class="cursor-pointer"
                :style="`width: 2rem;height: 2rem;background-color: ${item.color};padding:1px`"
                v-close-popup
                @click="item.handler"
              />
            </template>
            <div
              class="col-12 font-small q-pa-xs cursor-pointer q-pt-sm"
              @click="editor.chain().focus().unsetColor().run()"
            >
              {{ $t('clean_color') }}
            </div>
          </q-card>
        </q-popup-proxy>
      </q-btn>

      <q-btn v-else-if="i.type === 'save' && i.always_show" flat dense size="sm" class="q-mr-md"
      :color="saving ? 'primary' : ''" :disable="saving" @click="tiptapSave">
        <q-spinner-dots v-if="saving"
          size="1em"
          :thickness="2"
        />
        <q-icon v-else name="save" />
      </q-btn>
      <q-space v-else-if="i.type === 'space'" />
    </template>
</template>

<script setup>
const {
    menu, editor, disable_btn, saving, tiptapSave
} = defineProps([
    'menu','editor', 'disable_btn', 'saving', 'tiptapSave'
])
</script>