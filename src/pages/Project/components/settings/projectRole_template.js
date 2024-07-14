// role.js
// 定义一个 __role 函数，返回一个 json 对象
function __role() {
  // 你可以在这里定义你想要的 json 对象
  // 例如：
  let obj = [
    {
      collection: "project",
      read: true,
      create: true,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "name", modify: false },
        { field: "description", modify: false },
        { field: "type", modify: false },
        { field: "cover", modify: false },
        { field: "create_version", modify: false },
        { field: "remove_version", modify: false },
        { field: "default_version", modify: false },
        { field: "chat_service", modify: false },
        { field: "invite_uris", modify: true },
        { field: "jsonContent", modify: false },
        { field: "private", modify: false },
        { field: "role", modify: false },
        { field: "preferences", modify: false },
        { field: "manageMember", modify: false },
        { field: "manageRole", modify: false },
        { field: "mm_channel_id", modify: false },
      ],
    },
    {
      collection: "overview",
      read: true,
      create: false,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "name", modify: true },
        { field: "description", modify: true },
        { field: "media", modify: true },
        { field: "start", modify: true },
        { field: "end", modify: true },
        { field: "deadline", modify: true },
        { field: "jsonContent", modify: true },
      ],
    },
    {
      collection: "board",
      read: true,
      create: true,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "name", modify: false },
        { field: "order", modify: false },
      ],
    },
    {
      collection: "group",
      read: true,
      create: true,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "name", modify: false },
        { field: "status", modify: false },
        { field: "icon", modify: false },
        { field: "order", modify: false },
      ],
    },
    {
      collection: "kanban",
      read: true,
      create: true,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "title", modify: false },
        { field: "description", modify: false },
        { field: "type", modify: false },
        { field: "icon", modify: false },
        { field: "status", modify: false },
        { field: "order", modify: false },
      ],
    },
    {
      collection: "column",
      read: true,
      create: true,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "name", modify: false },
        { field: "status", modify: false },
        { field: "executor", modify: false },
        { field: "type", modify: false },
        { field: "order", modify: false },
      ],
    },
    {
      collection: "storage",
      read: true,
      create: true,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "files", modify: false },
        { field: "color_marker", modify: false },
        { field: "sub_folders", modify: false },
      ],
    },
    {
      collection: "card",
      read: true,
      create: true,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "name", modify: false },
        { field: "type", modify: false },
        { field: "status", modify: false },
        { field: "followed_bies", modify: true },
        { field: "jsonContent", modify: false },
        { field: "create_version", modify: false },
        { field: "default_version", modify: false },
        { field: "importance", modify: false },
        { field: "urgency", modify: false },
        { field: "score", modify: false },
        { field: "chat_service", modify: false },
        { field: "color_marker", modify: true },
        { field: "private", modify: false },
        { field: "order", modify: true },
      ],
    },
    {
      collection: "todogroups",
      read: true,
      create: true,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "name", modify: false },
        { field: "color_marker", modify: true },
        { field: "order", modify: true },
      ],
    },
    {
      collection: "todo",
      read: true,
      create: true,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "content", modify: false },
        { field: "status", modify: false },
        { field: "color_marker", modify: false },
        { field: "importance", modify: true },
        { field: "urgency", modify: true },
        { field: "order", modify: true },
      ],
    },
    {
      collection: "card_todogroups",
      read: true,
      create: true,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "name", modify: false },
        { field: "color_marker", modify: false },
        { field: "order", modify: false },
      ],
    },
    {
      collection: "card_todo",
      read: true,
      create: true,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "content", modify: false },
        { field: "status", modify: false },
        { field: "color_marker", modify: false },
        { field: "importance", modify: true },
        { field: "urgency", modify: true },
        { field: "order", modify: true },
      ],
    },
    {
      collection: "card_storage",
      read: true,
      create: true,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "files", modify: false },
        { field: "color_marker", modify: false },
        { field: "sub_folders", modify: false },
      ],
    },
    {
      collection: "schedule",
      read: true,
      create: false,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "type", modify: false },
        { field: "can_read_user", modify: false },
        { field: "can_write_user", modify: false },
        { field: "passcode", modify: false }
      ],
    },
    {
      collection: "schedule_event",
      read: true,
      create: false,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "subject", modify: false },
        { field: "startTime", modify: false },
        { field: "endTime", modify: false },
        { field: "location", modify: false },
        { field: "description", modify: false },
        { field: "isAllDay", modify: false },
        { field: "recurrenceRule", modify: false },
        { field: "recurrenceException", modify: false },
        { field: "recurrenceID", modify: false },
      ],
    },
    {
      collection: "card_schedule",
      read: true,
      create: false,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "type", modify: false },
        { field: "can_read_user", modify: false },
        { field: "can_write_user", modify: false },
        { field: "passcode", modify: false }
      ],
    },
    {
      collection: "card_schedule_event",
      read: true,
      create: false,
      modify: false,
      delete: false,
      fields_permission: [
        { field: "subject", modify: false },
        { field: "startTime", modify: false },
        { field: "endTime", modify: false },
        { field: "location", modify: false },
        { field: "description", modify: false },
        { field: "isAllDay", modify: false },
        { field: "recurrenceRule", modify: false },
        { field: "recurrenceException", modify: false },
        { field: "recurrenceID", modify: false },
      ],
    }
  ]
  // 返回 json 对象
  return obj;
}

// 导出 __role 函数
export { __role };