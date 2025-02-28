<template>
    <q-card bordered class="q-pa-xs row gap-xs no-wrap">
      <q-btn-dropdown flat dense :label="$t('field_title')" icon="mdi-format-title" :class="{ 'bg-primary': editor.isActive('heading') }">
        <q-list bordered class="radius-sm q-pa-xs tiptap">
            <template v-for="i in 6" :key="i">
              <q-item clickable v-close-popup class="radius-xs no-margin"
                :class="{ 'bg-primary': editor.isActive('heading', { level: i+1 }) }"
                @click="editor.chain().focus().toggleHeading({ level: i+1 }).run()">
                <q-item-section :class="`text-h${i+1}`">{{ $t('field_title') }}</q-item-section>
              </q-item>
            </template>
          </q-list>
      </q-btn-dropdown>
      <q-btn flat dense icon="mdi-format-color-text" :class="{ 'bg-primary': editor.isActive('textStyle') }">
        <q-menu>
          <div class="row gap-xs radius-sm q-pa-xs border">
            <template v-for="i in $ui().colors" :key="i">
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
      <q-btn flat dense icon="mdi-format-color-fill" :class="{ 'bg-primary': editor.isActive('highlight') }">
        <q-menu>
          <div class="row gap-xs radius-sm q-pa-xs border">
            <template v-for="i in $ui().colors" :key="i">
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
      <q-btn flat dense icon="mdi-code-tags" 
        :class="{ 'bg-primary': editor.isActive('code') }"
        @click="editor.chain().focus().toggleCode().run()" />
      <q-separator vertical />
      <q-btn flat dense icon="mdi-format-bold" 
        :class="{ 'bg-primary': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()" />
      <q-btn flat dense icon="mdi-format-italic"
        :class="{ 'bg-primary': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()" />
      <q-btn flat dense icon="mdi-format-strikethrough"
        :class="{ 'bg-primary': editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()" />
      <q-btn flat dense icon="mdi-format-underline"
        :class="{ 'bg-primary': editor.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()" />
      <q-btn flat dense icon="mdi-format-superscript"
        :class="{ 'bg-primary': editor.isActive('superscript') }"
        @click="editor.chain().focus().toggleSuperscript().run()" />
      <q-btn flat dense icon="mdi-format-subscript"
        :class="{ 'bg-primary': editor.isActive('subscript') }"
        @click="editor.chain().focus().toggleSubscript().run()" />
      <q-separator vertical />
      <q-btn flat dense icon="mdi-format-list-bulleted"
        :class="{ 'bg-primary': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()" />
      <q-btn flat dense icon="format_list_numbered"
        :class="{ 'bg-primary': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()" />
      <q-btn flat dense icon="checklist"
        :class="{ 'bg-primary': editor.isActive('taskList') }"
        @click="editor.chain().focus().toggleTaskList().run()" />
    </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { uiStore, userStore } from "src/hooks/global/useStore";

const { editor } = defineProps(['editor'])

// 定义标题选项
const headingOptions = [
  { label: 'Normal', value: 0, class: '' },
  { label: 'H1', value: 1, class: 'text-h1' },
  { label: 'H2', value: 2, class: 'text-h2' },
  { label: 'H3', value: 3, class: 'text-h3' },
  { label: 'H4', value: 4, class: 'text-h4' },
  { label: 'H5', value: 5, class: 'text-h5' },
  { label: 'H6', value: 6, class: 'text-h6' },
]

// 当前选中的标题级别
const currentHeading = ref(headingOptions[0])

// 更新标题
const updateHeading = (value) => {
  if (value === 0) {
    editor.chain().focus().setParagraph().run()
  } else {
    editor.chain().focus().toggleHeading({ level: value }).run()
  }
}

// 监听编辑器状态变化，更新选中的标题级别
watch(() => editor.isActive('heading'), (isActive) => {
  if (!isActive) {
    currentHeading.value = headingOptions[0]
    return
  }
  
  for (let i = 1; i <= 6; i++) {
    if (editor.isActive('heading', { level: i })) {
      currentHeading.value = headingOptions[i]
      break
    }
  }
}, { immediate: true })
</script>

<style scoped>
</style>