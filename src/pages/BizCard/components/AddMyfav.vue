<template>
    <q-btn flat dense round icon="new_label" color="orange" @click="motifyAdd">
        <q-menu class="tranparent shadow-12" >
            <q-card bordered>
                <q-card-section class="font-bold-600 border-bottom q-pa-sm">
                    收藏这个名片
                </q-card-section>
                <q-card-section class="column no-wrap gap-xs q-pa-lg">
                    <q-input v-model="favName" type="text" label="修改名称" />
                    <q-input v-model="favComment" type="text" label="修改名称" />
                    <div class="column">
                        <div class="row items-center gap-xs q-py-md">
                            <q-chip v-for="(i,index) in tags" :key="index" :label="i" removable @remove="removeTag(i)" />
                        </div>
                        <q-input v-model="tag" dense filled square type="text" label="添加标签">
                            <template v-if="tag" v-slot:append>
                                <q-btn dense size="sm" flat icon="mdi-plus" @click="addTag" />
                            </template>
                        </q-input>
                    </div>
                </q-card-section>
                <q-card-section class="row q-pa-xs border-top">
                    <q-space />
                    <q-btn dense padding="xs md" color="primary" icon="check" label="收藏" :disable="disable" @click="addToMyFav" v-close-popup />
                </q-card-section>
            </q-card>
        </q-menu>
    </q-btn>
</template>
<script setup>
import { CreateBizcardCollection } from "src/apollo/api/api.js";
import { ref, toRef, watch } from "vue";

const props = defineProps({
  userId: {
    type: String,
    defatlt: "",
  },
  cardName: {
    type: String,
    defatlt: "",
  },
  bizCardId: {
    type: String,
    defatlt: "",
  },
  comment: {
    type: String,
    defatlt: "",
  },
});
const emit = defineEmits(["favCardAdded"]);
const userIdRef = toRef(props, "userId");

const bizCardIdRef = toRef(props, "bizCardId");
const cardNameRef = toRef(props, "cardName");
const commentRef = toRef(props, "comment");

const favName = ref();
const favComment = ref();
const tag = ref();
const tags = ref([]);

const addTag = () => {
    tags.value.push(tag.value);
    tag.value = ''
}
const removeTag = (val) => {
    tags.value = tags.value.filter(item => item !== val)
}
const disable = ref(true);
const motifyAdd = () => {
    favName.value = cardNameRef.value;
    favComment.value = commentRef.value;
    disable.value = false
}
const addToMyFav = async () => {
  disable.value = true;
  const CreateBizcardCollectionParams = ref({
    data: {
      name: favName.value,
      comment: favComment.value,
      tags: tags.value.map((item) => ({ tag: item })),
      publishedAt: new Date().toISOString(),
      bizcard: bizCardIdRef.value,
      user: userIdRef.value,
    },
  });
  const {
    mutate: CreateBizcardCollectionMutate,
    onDone,
    onError,
  } = CreateBizcardCollection(CreateBizcardCollectionParams);

  const { data } = await CreateBizcardCollectionMutate();

  if (data) {
    disable.value = false;
    emit("favCardAdded");
  }
};

// watch(
//     userIdRef,
//   () => {
//     if (userIdRef.value) {
//       favName.value = cardNameRef;
//       favComment.value = commentRef.value;
//       disable.value = false
//     }
//   },
//   { immediate: true, deep: true }
// );
</script>
