import { defineStore } from "pinia";

export default defineStore("project", {
  state: () => ({
    cardDragging: false,
    leftDrawerOpen: true,
    rightDrawerOpen: true,
    BoradsList: true,
    PrivateTodo: false,
    status: [
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
    multipleBoardType: ['classroom', 'resource'],
    init: null,
    project: null,
    projects: null,
    project_id: null,
    project_members: [],
    board: null,
    kanban: null,
    all_cards: null,
    all_cards_of_card: null,
    kanban_id: null,
    kanban_type: null,
    activedCard_id: null,
    showCards: false, // 如果为 true,说明点开的card是card的看板,否则点开的card是project的看板
    card: null,
    cards: [],
    rightPannel: "person_todos",
    need_refecth_kanban: false,
    active_folder: null,
    create_folder_ing: false,
    selected: [],
    filter_txt: "",
    need_refecth_projects: false,
    inChat: false,
    navigation: "",
    schedule: null,
  }),
  persist: false,
  actions: {
    async $waitRestore(){
      await this.$restore();
    },
    $isMultipleBoard(type) {
      return this.multipleBoardType.includes(type);
    },
    $reset_project() {
      this.cardDragging = false;
      this.project = null;
      this.project_id = null;
      this.project_members = [];
      this.board = null;
      this.kanban = null;
      this.all_cards = null;
      this.all_cards_of_card = null;
      this.kanban_id = null;
      this.kanban_type = null;
      this.activedCard_id = null;
      this.showCards = false;
      this.card = null;
      this.cards = [];
      this.rightPannel = "person_todos";
      this.active_folder = null;
      this.create_folder_ing = false;
      this.selected = [];
      this.filter_txt = "";
      this.navigation = "";
      this.schedule = null;
    },
    $reset_person() {
      this.init = null;
    },
  },
});
