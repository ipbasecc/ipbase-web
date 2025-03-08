import {defineStore} from "pinia";
import teamStore from './team'; // 引入 team store

export default defineStore("ui", {
  state: () => ({
    app: void 0,
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
    navDrawerWidth: 260,
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
    showUnsupportFiles: false,
    only_electron: ['classroom'],
    split_kanban_active: void 0,
    splitterView: false,
    chat_pannel: false,
    topPannel: false,
    columnWidth: 322,
    showTeamNotification: false,
    showAppNotification: false,
    newsLeftDrawer: true,
    createTeam: false,
    edittingDocument: void 0,
    active_note_id: void 0,
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
  persist: true,
  actions: {
    async $waitRestore(){
      await this.$restore();
    },
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
