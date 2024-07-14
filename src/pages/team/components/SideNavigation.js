import localforage from "localforage";

export async function getProjectNav(project_id) {
  const key = `__last_navigation_of_project_${project_id}`;
  const res = await localforage.getItem(key);
  if (res) {
    return res;
  } else {
    await localforage.setItem(key, "chat");
    return "chat";
  }
}
export async function setProjectNav(project_id, val) {
  const key = `__last_navigation_of_project_${project_id}`;
  const _val = JSON.parse(JSON.stringify(val));
  await localforage.setItem(key, _val);
  return val;
}
