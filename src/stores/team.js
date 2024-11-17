import { defineStore } from "pinia";

export default defineStore("team", {
  state: () => ({
    teams: null,
    init: null,
    team: null,
    channel: null, // Strapi team-channel
    mm_team: null,
    mm_channel: null, // Mattermost channel
    direct_user: null,
    navigation: null,
    project: null,
    project_id: null,
    board: null,
    kanban: null,
    kanban_rightDrawer: null,
    card: null,
    cards: null,
    card_id: null,
    activedCard_id: null,
    cardKanban: null,
    showCards: null,
    PrivateTodo: false,
    rightDrawerOpen: false,
    rightDrawer: void 0,
    rightDrawerWidth: 420,
    dropKanbanID: void 0,
    dropKanban: void 0,
    need_refecth_projects: false,
    filter_txt: "",
    cardDragging: false,
    create_folder_ing: false,
    active_folder: null,
    selected: null,
    process_status: [
      {
        name: "待处理",
        val: "pending",
        icon: "radio_button_unchecked",
        color: "grey",
      },
      {
        name: "处理中",
        val: "processing",
        icon: "change_circle",
        color: "primary",
      },
      {
        name: "遇阻",
        val: "blocked",
        icon: "radio_button_checked",
        color: "red",
      },
      { name: "待审核", val: "review", icon: "fact_check", color: "orange" },
      { name: "已完成", val: "completed", icon: "task_alt", color: "green" },
    ],
    thread: null,
    isExternal: false,
    isFocusMode: false,
    shareInfo: null,
    status: void 0,
    documents: [],
    active_document: null,
    active_storage_id: null,
    active_storage: null,
    project_schedule: null,
    adding_news: {
      title: void 0,
      cover: void 0,
      jsonContent: void 0,
    },
    news: [],
    active_news: null,
    edit_news: null,
    income: null,
    notebook: null,
    note: null,
    level_detail: null,
    singal_file_limit: null,
    storageCapacityExceeded: false,
    cardNumberExceeded: false,
    teamMembersExceeded: false,
  }),
  getters: {
    $level_detail: (state) => {
      return state.team?.level_detail; // 计算属性
    },
    $storageCapacityExceeded: (state) => {
      const limit = state.team?.level_detail.team_storage_max_limit * 1024 * 1024 // 后端返回的是 G 为单位，这里转为kb
      return limit < state.team?.statistics?.storage_size; // 计算属性
    },
    $cardNumberExceeded: (state) => {
      return state.team?.level_detail.card_number_limit < state.team?.statistics?.cards_number; // 计算属性
    },
    $teamMembersExceeded: (state) => {
      if(state.team?.level_detail.team_members_limit === -1){
        return false
      }
      return state.team?.level_detail?.team_members_limit < state.team?.statistics?.member_number;
    },
    $singal_file_limit: (state) => {
      const limit = state.team?.level_detail?.singal_file_limit;
      if (limit === -1) return null;
      if (limit > 0) return limit * 1024 * 1024 * 1024;
      return 1 * 1024 * 1024 * 1024;
    },
  },
  actions: {
    $reset() {
      this.teams = null;
      this.team = null;
      this.channel = null;
      this.mm_team = null;
      this.mm_channel = null;
      this.navigation = null;
      this.project = null;
      this.project_id = null;
      this.board = null;
      this.kanban = null;
      this.all_kanbans = [];
      this.kanban_rightDrawer = null;
      this.card = null;
      this.cards = null;
      this.all_cards = null;
      this.card_id = null;
      this.cardKanban = null;
      this.activedCard_id = null;
      this.showCards = null;
      this.PrivateTodo = false;
      this.rightDrawerOpen = false;
      this.need_refecth_projects = false;
      this.filter_txt = "";
      this.thread = null;
      this.shareInfo = null;
      this.all_todos = [];
      this.all_todogroups = [];
    },
    $reset_team() {
      this.team = null;
      this.channel = null;
      this.mm_team = null;
      this.mm_channel = null;
      this.navigation = null;
      this.project = null;
      this.project_id = null;
      this.board = null;
      this.kanban = null;
      this.all_kanbans = [];
      this.kanban_rightDrawer = null;
      this.card = null;
      this.cards = null;
      this.all_cards = null;
      this.card_id = null;
      this.activedCard_id = null;
      this.cardKanban = null;
      this.showCards = null;
      this.PrivateTodo = false;
      this.rightDrawerOpen = false;
      this.need_refecth_projects = false;
      this.filter_txt = "";
      this.thread = null;
      this.all_todos = [];
      this.all_todogroups = [];
    },
    $reset_project() {
      this.navigation = null;
      this.project = null;
      this.project_id = null;
      this.mm_channel = null;
      this.board = null;
      this.kanban = null;
      this.all_kanbans = [];
      this.kanban_rightDrawer = null;
      this.card = null;
      this.cards = null;
      this.all_cards = null;
      this.showCards = null;
      this.card_id = null;
      this.activedCard_id = null;
      this.cardKanban = null;
      this.PrivateTodo = false;
      this.rightDrawerOpen = false;
      this.need_refecth_projects = false;
      this.filter_txt = "";
      this.thread = null;
      this.all_todos = [];
      this.all_todogroups = [];
    },
    $reset_channel() {
      this.channel = null;
      this.mm_channel = null;
      this.direct_user = null;
    },
    setTeam(team) {
      this.team = team;
    },
  },
});
