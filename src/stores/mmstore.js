import { defineStore } from "pinia";
export default defineStore("mmstore", {
  state: () => ({
    team: null,
    members: [],
    channel: null,
    projectChannel: null,
    thread: null,
    actived_thread: null,
    current_team_id: null,
    current_channel_id: null,
    thread_container_width: undefined,
    extend_pannel_width: undefined,
    preferences: null,
    extend_pannel_target: null,
    extend_pannel_target_history: [],
    channel_members: null,
    board: null,
    kanban: null,
    PrivateTodo: false,
    BoardsList: true,
    Deleted_channel: null,
    fetch_status_mm_user_ids: [],
  }),
  actions: {
    $reset() {
      this.team = null;
      this.channel = null;
      this.thread = null;
      this.actived_thread = null;
      this.current_team_id = null;
      this.current_channel_id = null;
      this.thread_container_width = undefined;
      this.extend_pannel_width = undefined;
      this.preferences = null;
      this.extend_pannel_target = null;
      this.extend_pannel_target_history = [];
      this.channel_members = null;
      this.board = null;
      this.kanban = null;
      this.PrivateTodo = false;
      this.Deleted_channel = null
      this.fetch_status_mm_user_ids = []
    },
    $updateMember(_member) {
      this.members = this.members.map((i) =>
        i.id === _member.id ? _member : i
      );
    }
  }
});
