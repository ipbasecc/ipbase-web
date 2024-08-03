import { defineStore } from "pinia";
import {removeDuplicatesById} from "src/hooks/utilits";
import {nextTick, ref, watch} from "vue";

export default defineStore("team", {
  state: () => ({
    teams: null,
    init: null,
    team: null,
    channel: null, // Strapi team-channel
    mm_team: null,
    mm_channel: null, // Mattermost channel
    navigation: null,
    project: null,
    project_id: null,
    board: null,
    kanban: null,
    kanban_id: null,
    kanban_type: null,
    kanban_rightDrawer: null,
    card: null,
    cards: null,
    card_id: null,
    activedCard_id: null,
    cardKanban: null,
    showCards: null,
    PrivateTodo: false,
    rightDrawerOpen: false,
    need_refecth_projects: false,
    filter_txt: "",
    cardDragging: false,
    create_folder_ing: false,
    active_folder: null,
    selected: null,
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
    thread: null,
    isExternal: false,
    isFocusMode: false,
    shareInfo: null,
    authArgs: void 0,
    all_kanbans: [],
    all_columns: [],
    all_cards: [],
    all_todogroups: [],
    all_todos: [], // 拖拽todo的时候，根据sort从此数组中提取出并组合出新的todos，需要在todo有增、删、改时更新此数组
  }),
  actions: {
    $processItem_ofAll_byKey(_action, _key, _item) {
      const _state = `all_${_key}s`;
      this.$patch(state => {
        switch (_action) {
          case 'add':
            if (!state[_state].some(item => item.id === _item.id)) {
              state[_state].push(_item);
            }
            break;
          case 'remove':
            state[_state] = state[_state].filter(item => item.id !== _item.id);
            break;
          case 'update':
            const index = state[_state].findIndex(item => item.id === _item.id);
            if (index !== -1) {
              // console.log('a', state[_state][index]);
              state[_state][index] = _item;
              // console.log('b', state[_state][index]);
            }
            break;
          // 添加其他操作的处理逻辑
          default:
            throw new Error(`Unknown action: ${_action}`);
        }
      });
    },
    $reset() {
      this.teams = null;
      this.init = null;
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
      this.kanban_id = null;
      this.kanban_type = null;
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
      this.kanban_id = null;
      this.kanban_type = null;
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
      this.kanban_id = null;
      this.kanban_type = null;
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
  },
});
