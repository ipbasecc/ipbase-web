<template>
  <pre><code>{{ output }}</code></pre>
</template>

<script setup>
// Option 1: Browser + server-side
import Bold from '@tiptap/extension-bold'
// Option 2: Browser-only (lightweight)
// import { generateHTML } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { generateHTML } from '@tiptap/html'

import StarterKit from '@tiptap/starter-kit'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { computed } from 'vue'

const props = defineProps({
  jsonContent: {
    type: Object,
    default() {
      return {}
    }
  }
})


const output = computed(() => {
  return generateHTML(props.jsonContent, [
    Document,
    Paragraph,
    Text,
    Bold,
    TextStyle,
    Color,
    StarterKit,
    TaskList,
    TaskItem,
  ])}
)

</script>