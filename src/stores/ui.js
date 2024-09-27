import {defineStore} from "pinia";
import {Platform} from 'quasar'

export default defineStore("ui", {
  state: () => ({
    apps: [
      {
        val: "teams",
        label: 'team',
        icon: "developer_board",
        description: 'app_team_purpose',
        to: "teams",
        enable: true,
      },
      {
        val: "affairs",
        label: 'affairs',
        icon: "mdi-checkbox-marked-circle-outline",
        description: 'app_affairs_purpose',
        to: "affairs",
        enable: true,
      },
      {
        val: "chats",
        label: 'chats',
        icon: "mark_chat_read",
        description: 'app_chat_purpose',
        to: "chats",
        enable: true,
      },
      {
        val: "threads",
        label: 'threads',
        icon: "mdi-message-bulleted",
        description: 'app_threads_purpose',
        to: "threads",
        enable: Platform.is.mobile,
      },
      {
        val: "brand",
        label: 'brand',
        icon: "mdi-creation",
        description: 'app_brand_purpose',
        to: "brand",
        enable: !Platform.is.mobile
      },
    ],
    colorMarks: [
      "primary",
      "secondary",
      "accent",
      "positive",
      "red",
      "info",
      "warning",
      "clear",
    ],
    app: void 0,
    axiosStauts: void 0,
    axiosStautsCode: void 0,
    axiosError: void 0,
    serverResfused: false,
    pageLoaded: false,
    pageTitle: null,
    message: null,
    topbarClass: null, // 仅供CleanLayout调用
    topbarShow: true, // 仅供CleanLayout调用
    avatarChange: null,
    showToggleTeam: false,
    externalCardsDrawer: true,
    enterCardID: void 0,
    activeReel: NaN,
    mainWindowSize: void 0,
    mainWindowOffset: void 0,
    reelHeight: 160,
    reelHeight_SC: NaN,
    dragReelscrollEnable: true, // Reel拖拽横向滚动
    dragKanbanScrollEnable: true, // 看板拖拽横向滚动
    dragscrollmove: false,
    dropIn: void 0,
    createCard_in: void 0,
    scrollX_byWheel: false,
    draging: false, // 正在拖拽排序，或者拖拽横向滚动
    edittingCard: void 0,
    isShared: false,
    dragging: false,
    appDrawer: true,
    navigatorDrawer: true,
    threadsDrawer: true,
    segmentDrawer: true,
    projectLeftDrawer: true,
    projectRightDrawer: false,
    projectRightDrawerContent: void 0,
    isFocusMode: false,
    kanban_view_model: "kanban",
    disable_shortcut: false,
    appFooter: false,
    project_chat_list: true, // just for mobile
    hide_footer: false,
    edittingTodo: void 0,
    showDocumentsList: true,
    showMainContentList: true,
    project_settings: false,
    serverInfo: void 0,
    setServer: false,
    unreads: {
      team: void 0,
      channels: []
    },
    disableBgEffects: false,
    suportExts: [
      "jpg", "png", "jpeg", "gif", "bmp", "svg", "webp",
      "mp4", "mov", "avi", "mkv", "flv", "wmv", "webm", "m4v", "mxf", "quicktime", "3gp", "3g2",
      "mp3", "wav", "flac", "aac", "ogg",
      "fbx", "obj", "abc", "gltf", "glb", "stl", "ply",
      "zip", "rar", "7z", "tar", "gz", "lz4",
      "doc", "docx", "ppt", "pptx", "xls", "xlsx", "csv", "txt", "pdf", "md", "mdx"
    ],
    unsupportFiles: [],
    showUnsupportFiles: false,
    only_electron: ['classroom'],
    split_kanban_active: void 0,
    splitterView: false,
    emojis:[
      "💋",
      "🔥",
      "💗",
      "💢",
      "💯",
      "😬",
      "😍",
      "😇",
      "🤔",
      "😓",
      "🥵",
      "🤪",
      "🤬",
      "💩",
      "",
    ],
    chat_pannel: false,
    topPannel: false,
    columnWidth: 322,
  }),
  actions: {
    $reset() {
      this.projectLeftDrawer = true;
      this.pageLoaded = false;
      this.pageTitle = null;
      this.message = null;
      this.topbarClass = null;
      this.topbarShow = true;
      this.avatarChange = null;
      this.showToggleTeam = false;
      this.activeReel = NaN;
      this.reelHeight_SC = NaN;
      this.mainWindowSize = void 0;
      this.dropIn = void 0;
      this.createCard_in = void 0;
      this.scrollX_byWheel = false;
      this.draging = false;
      this.edittingCard = void 0;
      this.isShared = false;
      this.isFocusMode = false;
    },
    $pageloaded() {
      this.pageLoaded = true;
    },
  },
});
