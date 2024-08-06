<template>
    <svg
        t="1722952087259" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9409"
        :width="`${width}px`"
        :height="`${height}px`"
        :fill="color"
    >
        <path :fill="color" d="M704 928v-32 32zM224 928v32-32zM96 320H64h32z m0 480h32-32zM640 224a32 32 0 1 0 0-64v64zM224 192v32-32z m640 192a32 32 0 1 0-64 0h64z m-32 416h32-32z m64-560a112 112 0 0 1-112 112v64A176 176 0 0 0 960 240h-64zM784 352A112 112 0 0 1 672 240h-64a176 176 0 0 0 176 176v-64zM672 240A112 112 0 0 1 784 128V64A176 176 0 0 0 608 240h64zM784 128A112 112 0 0 1 896 240h64A176 176 0 0 0 784 64v64zM704 896H224v64h480v-64zM64 320v480h64V320H64z m576-160H224v64h416V160z m160 224v416h64V384h-64zM128 320a96 96 0 0 1 96-96V160a160 160 0 0 0-160 160h64z m96 576a96 96 0 0 1-96-96H64a160 160 0 0 0 160 160v-64z m480 64a160 160 0 0 0 160-160h-64a96 96 0 0 1-96 96v64z" fill="#000000" p-id="9411"></path>
    </svg>
</template>
<script setup>
const props = defineProps({
  width: {
    type: Number,
    default: 18,
  },
  height: {
    type: Number,
    default: 18,
  },
  color: {
    type: String,
    default: "#0c0c0c",
  },
});
</script>
  