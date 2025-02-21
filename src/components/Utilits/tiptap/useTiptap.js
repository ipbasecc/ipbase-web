
import { startImageUpload } from "./plugins/upload-images";
export default function useTiptap(editor, uiConfig, uploadFiles, tiptapSave) {
  const editorMenu = [
    {
      type: "Botton",
      disable: false,
      label: "undo",
      icon: "undo",
      class: "",
      activeClass: "",
      always_show: false,
      handler: () => {
        editor.value.chain().focus().undo().run();
      },
    },
    {
      type: "Botton",
      disable: false,
      label: "redo",
      icon: "redo",
      class: "",
      activeClass: "",
      always_show: false,
      handler: () => {
        editor.value.chain().focus().redo().run();
      },
    },
    {
      type: "|",
      disable: false,
      always_show: false,
    },
    {
      type: "menu",
      disable: false,
      label: "H",
      icon: "title",
      class: "",
      activeClass: "",
      always_show: true,
      children: [
        {
          type: "Botton",
          disable: false,
          label: "H1",
          icon: "format_h1",
          class: "text-h1",
          activeClass: "",
          handler: () => {
            editor.value.chain().focus().toggleHeading({ level: 1 }).run();
          },
        },
        {
          type: "Botton",
          disable: false,
          label: "H2",
          icon: "format_h2",
          class: "text-h2",
          activeClass: "",
          handler: () => {
            editor.value.chain().focus().toggleHeading({ level: 2 }).run();
          },
        },
        {
          type: "Botton",
          disable: false,
          label: "H3",
          icon: "format_h3",
          class: "text-h3",
          activeClass: "",
          handler: () => {
            editor.value.chain().focus().toggleHeading({ level: 3 }).run();
          },
        },
        {
          type: "Botton",
          disable: false,
          label: "H4",
          icon: "format_h4",
          class: "text-h4",
          activeClass: "",
          handler: () => {
            editor.value.chain().focus().toggleHeading({ level: 4 }).run();
          },
        },
        {
          type: "Botton",
          disable: false,
          label: "H5",
          icon: "format_h5",
          class: "text-h5",
          activeClass: "",
          handler: () => {
            editor.value.chain().focus().toggleHeading({ level: 5 }).run();
          },
        },
        {
          type: "Botton",
          disable: false,
          label: "H6",
          icon: "format_h6",
          class: "text-h6",
          activeClass: "",
          handler: () => {
            editor.value.chain().focus().toggleHeading({ level: 6 }).run();
          },
        },
      ],
    },
    {
      type: "|",
      disable: false,
      always_show: false,
    },
    {
      type: "Botton",
      disable: false,
      label: "B",
      icon: "format_bold",
      class: "",
      activeClass: "",
      always_show: true,
      handler: () => {
        editor.value.chain().focus().toggleBold().run();
      },
    },
    {
      type: "Botton",
      disable: false,
      label: "I",
      icon: "format_italic",
      class: "",
      activeClass: "",
      always_show: true,
      handler: () => {
        editor.value.chain().focus().toggleItalic().run();
      },
    },
    {
      type: "Botton",
      disable: false,
      label: "S",
      icon: "strikethrough_s",
      class: "",
      activeClass: "",
      always_show: true,
      handler: () => {
        editor.value.chain().focus().toggleStrike().run();
      },
    },
    {
      type: "|",
      disable: false,
      always_show: false,
    },
    {
      type: "set_color",
      disable: false,
      label: "Color",
      icon: "format_paint",
      class: "",
      activeClass: "",
      always_show: false,
      children: [
        {
          type: "block",
          disable: false,
          label: "Red",
          icon: "",
          class: "",
          activeClass: "",
          color: "#FF0000",
          handler: () => {
            editor.value.chain().focus().setColor("#FF0000").run();
          },
        },
        {
          type: "block",
          disable: false,
          label: "Green",
          icon: "",
          class: "",
          activeClass: "",
          color: "#00FF00",
          handler: () => {
            editor.value.chain().focus().setColor("#00FF00").run();
          },
        },
        {
          type: "block",
          disable: false,
          label: "Blue",
          icon: "",
          class: "",
          activeClass: "",
          color: "#0000FF",
          handler: () => {
            editor.value.chain().focus().setColor("#0000FF").run();
          },
        },
      ],
    },
    {
      type: "|",
      disable: false,
      always_show: false,
    },
    {
      type: "Botton",
      disable: false,
      label: "BulletList",
      icon: "format_list_bulleted",
      class: "",
      activeClass: "",
      always_show: true,
      handler: () => {
        editor.value.chain().focus().toggleBulletList().run();
      },
    },
    {
      type: "Botton",
      disable: false,
      label: "OrderedList",
      icon: "format_list_numbered",
      class: "",
      activeClass: "",
      always_show: true,
      handler: () => {
        editor.value.chain().focus().toggleOrderedList().run();
      },
    },
    {
      type: "Botton",
      disable: false,
      label: "TaskList",
      icon: "checklist",
      class: "",
      activeClass: "",
      always_show: true,
      handler: () => {
        editor.value.chain().focus().toggleTaskList().run();
      },
    },
    {
      type: "space",
      disable: false,
      always_show: true,
    },
    {
      type: "Botton",
      disable: !uiConfig.withImageBtn,
      icon: "image",
      class: "",
      activeClass: "",
      always_show: uiConfig.withImageBtn,
      handler: () => insertImage(editor.value),
    },
    {
      type: "Botton",
      disable: !uiConfig.withAttachBtb,
      icon: "attachment",
      class: "",
      activeClass: "",
      always_show: true,
      handler: () => uploadFiles(),
    },
    {
      type: "|",
      disable: !uiConfig.withSaveBtn,
      always_show: uiConfig.withSaveBtn,
    },
    {
      type: "save",
      disable: !uiConfig.withSaveBtn,
      label: "Save",
      icon: "save",
      class: "",
      activeClass: "",
      always_show: uiConfig.withSaveBtn,
      handler: () => tiptapSave(),
    },
  ];
  const insertImage = (editor) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const pos = editor.view.state.selection.from;
        startImageUpload(file, editor.view, pos, editor);
      }
    };
    input.click();
  }
  return {
    editorMenu,
    insertImage
  }
}
export const isEmptyLine = (editor, line) => {
  const { doc } = editor.state
  const $pos = doc.resolve(line)
  
  // 获取最近的块级父节点
  let depth = $pos.depth
  while (depth > 0 && !$pos.node(depth).type.isBlock) {
    depth--
  }
  const parentNode = $pos.node(depth)
  
  // 检查节点类型
  if (parentNode.type.name === 'paragraph') {
    return parentNode.content.size === 0
  }
  
  // 处理列表项等嵌套结构
  if (parentNode.type.name === 'list_item') {
    const firstChild = parentNode.content.firstChild
    return !firstChild || firstChild.content.size === 0
  }
  
  // 处理其他块级元素
  return parentNode.content.size === 0
}