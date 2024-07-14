<template>
  <div v-if="userStore && CreateElementParmas" class="column no-wrap">
    <q-toolbar class="transparent border-bottom">
      <q-btn
        dense
        padding="xs md"
        flat
        color="primary"
        icon="arrow_back_ios"
        label="放弃"
        @click="closeCreate"
      />
      <q-space />
      <q-btn
        v-if="CreateElementParmas.data.type"
        padding="xs md"
        color="primary"
        icon="mdi-check-all"
        label="新建"
        :disable="disable"
        @click="CreateElementFn"
      />
    </q-toolbar>
    <q-toolbar class="transparent">
      <span class="q-mx-md">{{ CreateElementParmas.data.type ? '类型：' : '请选择类型：' }}</span>
      <q-btn dense flat padding="xs md" color="primary" icon-right="mdi-chevron-down"
      :label="CreateElementParmas.data.type ? type.find((i) => i.val == CreateElementParmas.data.type).name : '未指定'">
        <q-menu class="tansparent shadow-0">
          <q-list style="min-width: 100px">
            <q-item v-for="i in type" :key="i.id" clickable v-close-popup @click="CreateElementParmas.data.type = i.val">
              <q-item-section>{{ i.name }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <template v-if="CreateElementParmas.data.type">
        <span class="q-mx-md">{{ belongedName ? '类别：' : '请选择类别：' }}</span>
        <q-btn flat dense padding="xs sm" color="primary" icon-right="mdi-chevron-down"
        :label="belongedName ? belongedName : '未指定'">
          <q-menu>
            <Gategory
              :filterIds="filterIds"
              :activedId="activeId"
              :belongedId="belongedId"
              :belongedName="belongedName"
              @setGetagory="setGetagory"
            />
          </q-menu>
        </q-btn>
        <span class="q-mx-md">
          {{ CreateElementParmas.data.tags ? '标签：' : '请添加标签：' }}
        </span>
        <q-chip v-for="i in tags" :key="i.id" :label="i.attributes.name" class="hovered-item">
          <q-badge floating rounded @click="removeTag(i.id)" class="hover-show cursor-pointer">x</q-badge>
        </q-chip>
        <q-btn flat dense round size="sm" color="primary" icon="add">
          <q-popup-proxy>
            <q-card bordered>
              <q-card-section>
                <Tags @putTag="putTag" :selected="CreateElementParmas.data.tags" />
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </q-btn>
      </template>
    </q-toolbar>
    <div class="column no-wrap gap-sm q-pa-md relative-position">
      <q-bar class="transparent border-bottom">
        <q-tabs
          v-model="tab"
          dense
        >
          <q-tab name="content" label="内容" />
          <q-tab name="cover" label="封面" />
          <q-tab name="media" label="媒体" />
          <q-tab name="attachments" label="附件" />
          <q-tab name="makers" label="创作者" />
        </q-tabs>
        <q-space />
        <q-toggle v-model="CreateElementParmas.data.is_opus" color="green" label="作为作品" />
      </q-bar>
      <template v-if="tab == 'content'">
        <q-input
          v-model="CreateElementParmas.data.title"
          filled
          square
          type="text"
          label="标题"
          replaceholder="请在此输入文章标题"
          :rules="[(val) => val != '' || '标题不能为空']"
        />
        <q-input
          v-model="CreateElementParmas.data.description"
          filled
          square
          autogrow
          type="textarea"
          label="摘要"
          replaceholder="请在此输入文章摘要"
        />
        <q-editor
          v-model="CreateElementParmas.data.content"
          class="column fit flex q-space"
          content-class="q-space article"
          :dense="$q.screen.lt.md"
          :toolbar="[
            [
              {
                label: $q.lang.editor.align,
                icon: $q.iconSet.editor.align,
                fixedLabel: true,
                list: 'only-icons',
                options: ['left', 'center', 'right', 'justify'],
              },
              {
                label: $q.lang.editor.align,
                icon: $q.iconSet.editor.align,
                fixedLabel: true,
                options: ['left', 'center', 'right', 'justify'],
              },
            ],
            ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
            ['token', 'hr', 'link', 'custom_btn'],
            ['print', 'fullscreen'],
            [
              {
                label: $q.lang.editor.formatting,
                icon: $q.iconSet.editor.formatting,
                list: 'no-icons',
                options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'],
              },
              {
                label: $q.lang.editor.fontSize,
                icon: $q.iconSet.editor.fontSize,
                fixedLabel: true,
                fixedIcon: true,
                list: 'no-icons',
                options: [
                  'size-1',
                  'size-2',
                  'size-3',
                  'size-4',
                  'size-5',
                  'size-6',
                  'size-7',
                ],
              },
              {
                label: $q.lang.editor.defaultFont,
                icon: $q.iconSet.editor.font,
                fixedIcon: true,
                list: 'no-icons',
                options: [
                  'default_font',
                  'arial',
                  'arial_black',
                  'comic_sans',
                  'courier_new',
                  'impact',
                  'lucida_grande',
                  'times_new_roman',
                  'verdana',
                ],
              },
              'removeFormat',
            ],
            ['quote', 'unordered', 'ordered', 'outdent', 'indent'],

            ['undo', 'redo'],
            ['viewsource'],
          ]"
          :fonts="{
            arial: 'Arial',
            arial_black: 'Arial Black',
            comic_sans: 'Comic Sans MS',
            courier_new: 'Courier New',
            impact: 'Impact',
            lucida_grande: 'Lucida Grande',
            times_new_roman: 'Times New Roman',
            verdana: 'Verdana',
          }"
        />
      </template>
      <template v-if="tab == 'cover'">
          <div class="q-pa-xl" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-grey-2'">
            <UploadCover @coverUploaded="coverUploaded" />
          </div>
      </template>
      <template v-if="tab == 'media'">
          <div class="q-pa-xl" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-grey-2'">
            <UploadMedia @mediaUploaded="mediaUploaded" />
          </div>
      </template>
      <template v-if="tab == 'attachments'">
          <div class="q-pa-xl" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-grey-2'">
            <UploadAttachments @attachmentsUploaded="attachmentsUploaded" />
          </div>
      </template>
      <template v-if="tab == 'makers'">
        <Makers @conformMakers="conformMakers" />
      </template>
      <div v-if="!CreateElementParmas.data.type" class="absolute-full column flex-center bg-white op-9">
        <div class="row flex-center">
          {{ CreateElementParmas.data.type ? '类型：' : '请选择类型：' }}
          <q-btn dense flat padding="xs md" color="primary" icon-right="mdi-chevron-down"
          :label="CreateElementParmas.data.type ? type.find((i) => i.val == CreateElementParmas.data.type).name : '未指定'">
            <q-menu class="tansparent shadow-0">
              <q-list style="min-width: 100px">
                <q-item v-for="i in type" :key="i.id" clickable v-close-popup @click="CreateElementParmas.data.type = i.val">
                  <q-item-section>{{ i.name }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { CreateElement } from "src/apollo/api/api.js";
import Gategory from "src/components/VIewComponents/GategoryBlock.vue";
import Tags from "src/components/VIewComponents/TagBlock.vue";
import UploadCover from "src/pages/ChannelPage/Elements/Components/UploadCover.vue";
import UploadMedia from "src/pages/ChannelPage/Elements/Components/UploadMedia.vue";
import UploadAttachments from "src/pages/ChannelPage/Elements/Components/UploadAttachments.vue";
import Makers from 'src/components/VIewComponents/Maker/MakerBlock.vue';
import useUserStore from "src/stores/user.js";
import { useQuasar, uid } from "quasar";

const $q = useQuasar();
const route = useRoute();
console.log(route.name);

const userStore = useUserStore();
const emit = defineEmits(["closeCreate"]);

const type = [
  {id: 0, name: '文章', icon: '', val: 'article'},
  {id: 1, name: '视频', icon: '', val: 'video'},
  {id: 2, name: '音频', icon: '', val: 'audio'},
]
const tab = ref('content');

const filterIds = ref();
const activeId = ref();
const belongedId = ref();
const belongedName = ref();

const CreateElementParmas = ref({
  data: {
    type: route.name,
    title: "",
    description: "",
    is_opus: false,
    category: null,
    tags: [],
    cover: null,
    content: "",
    author: userStore.userId,
    publishedAt: new Date().toISOString(),
    media: null,
    attachments: [],
    uid: uid(),
    makers: []
  },
});

const setGetagory = (id,name,belongId,ids) => {
  CreateElementParmas.value.data.category = id;
  filterIds.value = ids;
  activeId.value = id;
  belongedId.value = belongId;
  belongedName.value = name;
};

const tags = ref([]);
const putTag = (i) => {
  if(!tags.value.map(item => item.id).includes(i.id)) {
    tags.value = [...tags.value,i];
    CreateElementParmas.value.data.tags.push(i.id)
  }
}
const removeTag = (id) => {
  if(tags.value.map(item => item.id).includes(id)) {
    tags.value = tags.value.filter(i => i.id != id);
    CreateElementParmas.value.data.tags = CreateElementParmas.value.data.tags.filter(i => i != id);
  }
}

const tmpresps = ref();
const CreateElementFn = async () => {
  disable.value = true;
  if (
    !CreateElementParmas.value.data.title ||
    !CreateElementParmas.value.data.content
  ) {
    $q.notify("标题与正文不能为空");
    return;
  }

  CreateElementParmas.value.data.type = CreateElementParmas.value.data.type ? CreateElementParmas.value.data.type : 'article';

  const {
    mutate: CreateElementMutate,
    onDone: CreateElementOnDone,
    onError,
  } = CreateElement(CreateElementParmas);
  const { data } = await CreateElementMutate();
  if (data) {
    disable.value =
      CreateElementParmas.value &&
      (!CreateElementParmas.value.data.title ||
        !CreateElementParmas.value.data.content);
    emit("closeCreate",data);
  }
};

const closeCreate = () => {
  emit("closeCreate");
};

const coverUploaded = (val) => {
  CreateElementParmas.value.data.cover = val;
};
const mediaUploaded = (val) => {
  CreateElementParmas.value.data.media = val;
};
const attachmentsUploaded = (val) => {
  CreateElementParmas.value.data.attachments = val;
};
const disable = ref(
  CreateElementParmas.value &&
    (!CreateElementParmas.value.data.title ||
      !CreateElementParmas.value.data.content)
);
watch(
  CreateElementParmas,
  () => {
    if (CreateElementParmas.value) {
      disable.value =
        !CreateElementParmas.value.data.title ||
        !CreateElementParmas.value.data.content;
    }
  },
  { immediate: true, deep: true }
);
const conformMakers = (val) => {
  CreateElementParmas.value.data.makers = val;
}
</script>
