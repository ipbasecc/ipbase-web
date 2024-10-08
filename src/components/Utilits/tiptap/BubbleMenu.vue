<template>
    <q-card bordered class="q-pa-xs row gap-xs no-wrap">
      <q-btn flat dense icon="mdi-format-title">
        <q-menu>
          <q-list bordered class="radius-sm q-pa-xs tiptap">
            <template v-for="i in 6" :key="i">
              <q-item clickable v-close-popup class="radius-xs no-margin"
                @click="editor.chain().focus().toggleHeading({ level: i+1 }).run()">
                <q-item-section :class="`text-h${i+1}`">{{ $t('field_title') }}</q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn flat dense icon="mdi-format-color-text">
        <q-menu>
          <div class="row gap-xs radius-sm q-pa-xs border">
            <template v-for="i in uiStore.colors" :key="i">
                <div class="hover-op-none cursor-pointer radius-xs" style="height: 2rem; width: 2rem;" :style="`background-color: ${i}`"
                    @click="editor.chain().focus().setColor(i).run()"
                ></div>
            </template>
            <div class="hover-op-none cursor-pointer radius-xs flex flex-center transparent border" style="height: 2rem; width: 2rem;"
            @click="editor.chain().focus().unsetColor().run()"
            >{{ $t('clean') }}</div>
          </div>
        </q-menu>
      </q-btn>
      <q-btn flat dense icon="mdi-format-color-fill">
        <q-menu>
          <div class="row gap-xs radius-sm q-pa-xs border">
            <template v-for="i in uiStore.colors" :key="i">
                <div class="hover-op-none cursor-pointer radius-xs" style="height: 2rem; width: 2rem;" :style="`background-color: ${i}`"
                    @click="editor.chain().focus().toggleHighlight({ color: i }).run()"
                ></div>
            </template>
            <div class="hover-op-none cursor-pointer radius-xs flex flex-center transparent border" style="height: 2rem; width: 2rem;"
            @click="editor.chain().focus().toggleHighlight().run()"
            >{{ $t('clean') }}</div>
          </div>
        </q-menu>
      </q-btn>
      <q-btn flat dense icon="mdi-code-tags" @click="editor.chain().focus().toggleCode().run()" />
      <q-separator vertical />
      <q-btn flat dense icon="mdi-format-bold" @click="editor.chain().focus().toggleBold().run()" />
      <q-btn flat dense icon="mdi-format-italic" @click="editor.chain().focus().toggleItalic().run()" />
      <q-btn flat dense icon="mdi-format-strikethrough" @click="editor.chain().focus().toggleStrike().run()" />
      <q-btn flat dense icon="mdi-format-underline" @click="editor.chain().focus().toggleUnderline().run()" />
      <q-btn flat dense icon="mdi-format-superscript" @click="editor.chain().focus().toggleSuperscript().run()" />
      <q-btn flat dense icon="mdi-format-subscript" @click="editor.chain().focus().toggleSubscript().run()" />
      <q-separator vertical />
      <q-btn flat dense icon="mdi-format-list-bulleted" @click="editor.chain().focus().toggleBulletList().run()" />
      <q-btn flat dense icon="format_list_numbered" @click="editor.chain().focus().toggleOrderedList().run()" />
      <q-btn flat dense icon="checklist" @click="editor.chain().focus().toggleTaskList().run()" />
    </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { uiStore, userStore } from "src/hooks/global/useStore";

const { editor } = defineProps(['editor'])
</script>

<style scoped>
</style>