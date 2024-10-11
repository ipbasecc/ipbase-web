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
  }),
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
    }
  },
});
