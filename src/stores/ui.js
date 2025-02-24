import {defineStore} from "pinia";
import {Platform,Screen} from 'quasar'
import teamStore from './team'; // 引入 team store

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
        val: "deliver",
        label: 'deliver',
        icon: "mdi-cards",
        description: 'app_deliver_purpose',
        to: "deliver",
        enable: true,
      },
      {
        val: "discover",
        label: 'discover',
        icon: "mdi-compass-outline",
        description: 'app_discover_purpose',
        to: "discover",
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
        val: "notebooks",
        label: 'notebooks',
        icon: "mdi-book-open-page-variant",
        description: 'app_notebooks_purpose',
        to: "notebooks",
        enable: true,
      },
      {
        val: "chats",
        label: 'chats',
        icon: "contacts",
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
        enable: false
      },
      {
        val: "aichat",
        label: 'aichat',
        icon: "mdi-message-bulleted",
        description: 'app_aichat_purpose',
        to: "aichat",
        enable: Platform.is.desktop
      },
    ],
    localeOptions: [
      { val: "zh-CN", label: "中文", flag_key: 'cn' },
      { val: "en-US", label: "English", flag_key: 'gb' },
      { val: "de-DE", label: "Deutsch", flag_key: 'de' },
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
    dragReelscrollEnable: true, // 允许Reel拖拽横向滚动
    dragKanbanScrollEnable: true, // 允许看板拖拽横向滚动
    dragscrollmove: false,
    dropIn: void 0,
    createCard_in: void 0,
    scrollX_byWheel: false,
    edittingCard: void 0,
    isShared: false,
    dragging: false, // 正在拖拽排序
    todoDragging: false, // 正在拖拽排序
    draggingScroll: false, // 正在拖拽横向滚动
    appDrawer: true,
    navigatorDrawer: true,
    navDrawerWidth: 210,
    rightDrawerWidth: 420,
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
    hide_top: false,
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
    no_image_url: 'https://airspace.oss-cn-shanghai.aliyuncs.com/app/no_image.jpeg',
    supportExts: [
      "jpg", "png", "jpeg", "gif", "bmp", "svg", "webp",
      "mp4", "mov", "avi", "mkv", "flv", "wmv", "webm", "m4v", "mxf", "quicktime", "3gp", "3g2",
      "mp3", "wav", "flac", "aac", "ogg",
      "fbx", "obj", "abc", "gltf", "glb", "stl", "ply",
      "zip", "rar", "7z", "tar", "gz", "lz4",
      "doc", "docx", "ppt", "pptx", "xls", "xlsx", "csv", "txt", "pdf", "md", "mdx"
    ],
    allowedFormatsImage: ['image/jpg', 'image/jpeg', 'image/png', 'image/svg', 'image/webp'],
    allowedFormatsVideo: ['video/mp4', 'video/m4v', 'video/mov', 'video/flv', 'video/webm'],
    allowedFormatsFile: ['text/plain', 'application/zip', 'application/tar', 'application/gzip'],
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
    showTeamNotification: false,
    showAppNotification: false,
    newsLeftDrawer: true,
    createTeam: false,
    edittingDocument: void 0,
    colors: [
      '#1976D2', '#26A69A', '#9C27B0', '#21BA45', '#C10015', '#31CCEC', '#F2C037'
    ],
    active_note_id: void 0,
    can_drag_apps: ["teams", "chats", 'affairs', 'brand', 'notebooks', 'aichat'],
    meet: void 0,
    init_meet: false,
    show_meet: false,
    show_subscription: false,
    dialogNotify: null,
    updatedCard_for_userTeamAffairs: null,
    slashMenuOpen: false,
    reINIT: false,
    logging: false,
    deal_active_item: 'homepage',
    talker: null,
    disable_selected: false,
  }),
  actions: {
    $syncMmUnreads() {
      const team = teamStore()?.team; // 获取 team store 实例并访问 team 属性
      if (!team) return;

      // 获取所有项目的 mm_channel_id，过滤掉 undefined/null
      const projectChannel = team.projects
        ?.map(project => project.mm_channel)
        .filter(Boolean) || [];

      // 获取所有团队频道的 id，过滤掉 undefined/null
      const teamChannel = team.team_channels
        ?.map(channel => channel.mm_channel)
        .filter(Boolean) || [];

      // 设置团队 ID
      this.unreads.team = team.mm_team;
      
      // 合并所有频道 ID
      this.unreads.channels = [...projectChannel, ...teamChannel];
    },
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
