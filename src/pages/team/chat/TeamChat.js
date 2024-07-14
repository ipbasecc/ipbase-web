import localforage from "localforage";

export async function getLastChannel(project_id) {
  const key = `___last_channel_of_project_${project_id}`;
  const res = await localforage.getItem(key);
  if (res) {
    return res;
  }
}
export async function setLastChannel(project_id, val) {
  if (!project_id || !val) return;
  const key = `___last_channel_of_project_${project_id}`;
  const _val = JSON.parse(JSON.stringify(val));
  await localforage.setItem(key, _val);
  return val;
}
export async function removeLastChannel(project_id) {
  const key = `___last_channel_of_project_${project_id}`;
  await localforage.removeItem(key);
}
