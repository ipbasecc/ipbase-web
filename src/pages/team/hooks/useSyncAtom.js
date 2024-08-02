import { teamStore } from "src/hooks/global/useStore.js";

export async function useSyncAtom(_kanban) {
  if (!_kanban) return;
  const all_kanbans = teamStore.all_kanbans || [];

  const _path = new URL("../../../works/processAllData.js", import.meta.url);
  const worker = new Worker(_path, {
    type: "module",
  });
  _kanban = JSON.parse(JSON.stringify(_kanban));
  const _all_kanbans = JSON.parse(JSON.stringify(all_kanbans));
  const val = { _kanban, _all_kanbans };
  worker.postMessage(val);

  worker.onmessage = (event) => {
    const { all_kanbans, all_columns, all_cards, all_todogroups, all_todos } =
      event.data;
    teamStore.all_kanbans = all_kanbans;
    teamStore.all_columns = all_columns;
    teamStore.all_cards = all_cards;
    teamStore.all_todogroups = all_todogroups;
    teamStore.all_todos = all_todos;
  };
}
