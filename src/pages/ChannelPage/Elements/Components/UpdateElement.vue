<template>
  <div v-if="userStore && UpdateElementParmas" class="column no-wrap gap-sm">
    <q-toolbar class="transparent border-bottom">
      <q-btn
        padding="xs md"
        flat
        color="primary"
        icon="mdi-close-circle"
        label="放弃"
        @click="MotifyCompleted"
      />
      <q-space />
      <q-btn
        padding="xs md"
        color="primary"
        icon="mdi-check-all"
        label="确认修改"
        :disable="disable"
        @click="MotifyElement"
      />
    </q-toolbar>
    <q-toolbar class="transparent">
      <span class="q-mx-md">{{ UpdateElementParmas.data.type ? '类型：' : '请选择类型：' }}</span>
      <q-btn dense flat padding="xs md" color="primary" icon-right="mdi-chevron-down"
      :label="UpdateElementParmas.data.type ? type.find((i) => i.val == UpdateElementParmas.data.type).name : '未指定'">
        <q-menu class="tansparent shadow-0">
          <q-list style="min-width: 100px">
            <q-item v-for="i in type" :key="i.id" clickable v-close-popup @click="UpdateElementParmas.data.type = i.val">
              <q-item-section>{{ i.name }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <span class="q-mx-md">{{ belongedName ? '类别：' : '请选择类别：' }}</span>
      <q-btn
        flat dense padding="xs sm" color="primary" icon-right="mdi-chevron-down"
        :label="belongedName ? belongedName : '未指定'"
      >
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
        {{ UpdateElementParmas.data.tags ? '标签：' : '请添加标签：' }}
      </span>
      <template v-if="tags?.length > 0">
        <q-chip v-for="i in tags" :key="i.id" :label="i.attributes.name" class="hovered-item">
          <q-badge floating rounded @click="removeTag(i.id)" class="hover-show cursor-pointer">x</q-badge>
        </q-chip>
      </template>
      <q-btn flat dense round size="sm" color="primary" icon="add">
        <q-popup-proxy>
          <q-card bordered>
            <q-card-section>
              <Tags @putTag="putTag" :selected="UpdateElementParmas.data.tags" />
            </q-card-section>
          </q-card>
        </q-popup-proxy>
      </q-btn>
    </q-toolbar>
    <div class="column no-wrap gap-sm q-pa-md">
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
        <q-toggle v-model="UpdateElementParmas.data.is_opus" color="green" label="作为作品" />
      </q-bar>
      <template v-if="tab == 'content'">
        <q-input
          v-model="UpdateElementParmas.data.title"
          filled
          square
          type="text"
          label="标题"
          replaceholder="请在此输入文章标题"
          :rules="[(val) => val != '' || '标题不能为空']"
        />
        <q-input
          v-model="UpdateElementParmas.data.description"
          filled
          square
          autogrow
          type="textarea"
          label="摘要"
          replaceholder="请在此输入文章摘要"
        />
        <q-editor
          v-model="UpdateElementParmas.data.content"
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
          <div class="q-pa-xl relative-position" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-grey-2'">
            <template v-if="cover && !changeCover">
              <FileViewer :file="cover" />
              <div class="absolute-full bg-black op-5" />
              <div class="absolute-full column gap-sm flex-center">
                <q-btn dense padding="xs md" rounded color="primary" icon="mdi-swap-horizontal" label="修改封面" @click="changeCover = !changeCover" />
                <q-btn dense padding="xs md" rounded color="negative" icon="close" label="删除封面" @click="deleteCover" />
              </div>
            </template>
            <template v-else>
              <div class="row">
                <q-btn dense flat color="primary" icon="mdi-undo" label="放弃修改" class="q-mb-sm" @click="reCoverDeleteCover" />
              </div>
              <UploadCover @coverUploaded="coverUploaded" />
            </template>
          </div>
      </template>
      <template v-if="tab == 'media'">
          <div class="q-pa-xl relative-position" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-grey-2'">
            <template v-if="media && !changeMedia">
              <FileViewer :file="media" />
              <div class="absolute-full bg-black op-5" />
              <div class="absolute-full column gap-sm flex-center">
                <q-btn dense padding="xs md" rounded color="primary" icon="mdi-swap-horizontal" label="修改媒体" @click="changeMedia = !changeMedia" />
                <q-btn dense padding="xs md" rounded color="negative" icon="close" label="删除媒体" @click="deleteMedia" />
              </div>
            </template>
            <template v-else>
              <div class="row">
                <q-btn dense flat color="primary" icon="mdi-undo" label="放弃修改" class="q-mb-sm" @click="reCoverDeleteMedia" />
              </div>
              <UploadMedia @mediaUploaded="mediaUploaded" />
            </template>
          </div>
      </template>
      <template v-if="tab == 'attachments'">
          <div class="q-pa-xl" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-grey-2'">
            <div class="column no-wrap gap-sm">
            <q-btn dense flat color="primary" :icon="addAttachments ? 'close' : 'mdi-plus'" :label="addAttachments ? '关闭添加' : '添加附件'" @click="addAttachments = !addAttachments" />
            <UploadAttachments v-if="addAttachments" @attachmentsUploaded="attachmentsUploaded" />
              <template v-if="resps && resps.length > 0">
                <div v-for="(i,index) in resps" :key="index" class="row items-center radius-sm overflow-hidden q-mb-sm">
                  <div class="q-space">
                    <FileViewer :file="i.attributes" :noPreview="true" />
                  </div>
                  <!-- <div class="col-8 q-pa-md">{{ genFilename(i.attributes.url) }}</div> -->
                  <div class="q-pa-md">
                    <q-btn dense size="sm" round flat color="primary" icon="close" @click="deleteAttachmentItem(i,'isResps')" />
                  </div>
                </div>
              </template>
              <div v-for="(i,index) in attachments" :key="index" class="row items-center radius-sm overflow-hidden">
                <div class="q-space">
                  <FileViewer :file="i.attributes" :noPreview="true" />
                </div>
                <!-- <div class="col-8 q-pa-md">{{ genFilename(i.attributes.url) }}</div> -->
                <div class="q-pa-md">
                  <q-btn dense size="sm" round flat color="primary" icon="close" @click="deleteAttachmentItem(i)" />
                </div>
              </div>
            </div>
          </div>
      </template>
      <template v-if="tab == 'makers'">
        <Makers :makers="editTargetRef.makers" @conformMakers="conformMakers" />
      </template>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, toRef } from "vue";
import { UpdateElement } from "src/apollo/api/api.js";
import UploadCover from "src/pages/ChannelPage/Elements/Components/UploadCover.vue";
import UploadMedia from "src/pages/ChannelPage/Elements/Components/UploadMedia.vue";
import UploadAttachments from "src/pages/ChannelPage/Elements/Components/UploadAttachments.vue";
import Makers from 'src/components/VIewComponents/Maker/MakerBlock.vue';
import Tags from "src/components/VIewComponents/TagBlock.vue";
import Gategory from "src/components/VIewComponents/GategoryBlock.vue";
import useUserStore from "src/stores/user.js";
import FileViewer from "src/components/VIewComponents/FileViewer.vue";
import { genFilename } from 'src/hooks/global/useGenFilename.js'
import { useQuasar, uid } from "quasar";

const props = defineProps({
  editTarget: {
    type: Object,
    default() {
      return {}
    }
  },
  editTargetId: {
    type: String,
    default: ''
  }
});
const editTargetRef = toRef(props,'editTarget');
const makersParmas = ref();
const editTargetIdRef = toRef(props,'editTargetId');

const $q = useQuasar();

const userStore = useUserStore();
const emit = defineEmits(["MotifyCompleted"]);

const type = [
  {id: 0, name: '文章', icon: '', val: 'article'},
  {id: 1, name: '视频', icon: '', val: 'video'},
  {id: 2, name: '音频', icon: '', val: 'audio'},
]
const tab = ref('content');
const tags = ref(editTargetRef.value.tags.data);
const putTag = (i) => {
  if(!tags.value.map(item => item.id).includes(i.id)) {
    tags.value = [i,...tags.value];
    UpdateElementParmas.value.data.tags.push(i.id);
  }
}
const removeTag = (id) => {
  if(tags.value.map(item => item.id).includes(id)) {
    tags.value = tags.value.filter(i => i.id != id);
    UpdateElementParmas.value.data.tags = UpdateElementParmas.value.data.tags.filter(i => i != id);
  }
}
const filterIds = ref();
const activeId = ref();
const belongedId = ref();
const belongedName = ref();
const setGetagory = (id,name,belongId,ids) => {
  UpdateElementParmas.value.data.category = id;
  filterIds.value = ids;
  activeId.value = id;
  belongedId.value = belongId;
  belongedName.value = name;
};

const UpdateElementParmas = ref({
  updateElementId: editTargetIdRef.value,
  data: {
    type: editTargetRef.value.type,
    title: editTargetRef.value.title,
    description: editTargetRef.value.description,
    is_opus: editTargetRef.value.is_opus,
    category: editTargetRef.value.category?.data?.id || null,
    tags:  editTargetRef.value.tags.data.map(i => i.id),
    cover: editTargetRef.value.cover?.data?.id || null,
    content: editTargetRef.value.content,
    author: userStore.userId,
    publishedAt: new Date().toISOString(),
    media: editTargetRef.value.media?.data?.id || null,
    attachments: editTargetRef.value.attachments?.data.map((i) => i.id) || null,
    makers:editTargetRef.value.makers
  },
});
const cover = ref(editTargetRef.value.cover && editTargetRef.value.cover.data?.attributes || null);
const media = ref(editTargetRef.value.media && editTargetRef.value.media.data?.attributes || null);
const attachments = ref(editTargetRef.value.attachments.data.length > 0 && editTargetRef.value.attachments.data || []);
const MotifyElement = async () => {
  disable.value = true;
  if (
    !UpdateElementParmas.value.data.title ||
    !UpdateElementParmas.value.data.content
  ) {
    $q.notify("标题与正文不能为空");
    return;
  };

  UpdateElementParmas.value.data.makers = makersParmas.value;

  const {
    mutate: UpdateElementMutate,
    onDone: UpdateElementOnDone,
    onError,
  } = UpdateElement(UpdateElementParmas);
  const { data } = await UpdateElementMutate();
  if (data) {
    disable.value =
      UpdateElementParmas.value &&
      (!UpdateElementParmas.value.data.title ||
        !UpdateElementParmas.value.data.content);
    emit("MotifyCompleted");
  }
};

const MotifyCompleted = () => {
  emit("MotifyCompleted");
};

const coverUploaded = (val,mediaObj) => {
  UpdateElementParmas.value.data.cover = val;
  cover.value = mediaObj.attributes;
  changeCover.value = false;
};
const mediaUploaded = (val,mediaObj) => {
  UpdateElementParmas.value.data.media = val;
  media.value = mediaObj.attributes;
  changeMedia.value = false;
};
const resps = ref()
const attachmentsUploaded = (val,media) => {
  let arr = UpdateElementParmas.value.data.attachments;
  UpdateElementParmas.value.data.attachments = [...arr, ...val];
  resps.value = media;
};
const disable = ref(
  UpdateElementParmas.value &&
    (!UpdateElementParmas.value.data.title ||
      !UpdateElementParmas.value.data.content)
);
watch(
  UpdateElementParmas,
  () => {
    if (UpdateElementParmas.value) {
      disable.value =
        !UpdateElementParmas.value.data.title ||
        !UpdateElementParmas.value.data.content;
    }
  },
  { immediate: true, deep: true }
);
const deleteAttachmentItem = (item,who) => {
  UpdateElementParmas.value.data.attachments = UpdateElementParmas.value.data.attachments.filter((i) => i != item.id);
  if(who != 'isResps'){
    attachments.value = attachments.value.filter((i) => i.id != item.id);
  } else {
    resps.value = resps.value.filter((i) => i.id != item.id);
  }
}
const addAttachments = ref(false);
const changeCover = ref(false);
const changeMedia = ref(false);
const deleteCover = () => {
  UpdateElementParmas.value.data.cover = null
  cover.value = null
}
const reCoverDeleteCover = () => {
  changeCover.value = false;
  UpdateElementParmas.value.data.cover = editTargetRef.value.cover?.data?.id || null;
  cover.value = editTargetRef.value.cover && editTargetRef.value.cover.data?.attributes || null;
}

const deleteMedia = () => {
  UpdateElementParmas.value.data.media = null
  media.value = null
}
const reCoverDeleteMedia = () => {
  changeMedia.value = false;
  UpdateElementParmas.value.data.media = editTargetRef.value.media?.data?.id || null;
  media.value = editTargetRef.value.media && editTargetRef.value.media.data?.attributes || null;
}

const conformMakers = (val) => {
  makersParmas.value = val;
}


</script>
