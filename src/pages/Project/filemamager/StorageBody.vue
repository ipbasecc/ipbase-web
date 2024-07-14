<template>
  <ejs-filemanager
    id="file-manager"
    :ajaxSettings="ajaxSettings"
    :allowMultiSelection="allowMultiSelection"
    :allowDragAndDrop="allowDragAndDrop"
    :uploadSettings
    :locale
    class="fit borderless"
  ></ejs-filemanager>
</template>

<script setup>
import {
  FileManagerComponent as EjsFilemanager,
  DetailsView,
  NavigationPane,
  Toolbar,
} from "@syncfusion/ej2-vue-filemanager";
import { provide } from "vue";

import { L10n, setCulture } from "@syncfusion/ej2-base";
const locale = "zh";
const filemanager = [DetailsView, NavigationPane, Toolbar];
provide("filemanager", filemanager);

const hostUrl = "https://azure.yihu.team/";
const ajaxSettings = {
  // Replace the hosted port number in the place of "8090"
  url: hostUrl,
  getImageUrl: hostUrl + "GetImage",
  uploadUrl: hostUrl + "Upload",
  downloadUrl: hostUrl + "Download",
};
const allowMultiSelection = true;
const allowDragAndDrop = true;
const uploadSettings = {
  directoryUpload: true,
};

setCulture("zh");

L10n.load({
  zh: {
    filemanager: {
      NewFolder: "新建文件夹",
      Upload: "上传",
      Delete: "删除",
      Rename: "改名",
      Download: "下载",
      Cut: "切",
      Copy: "复制",
      Paste: "糊",
      SortBy: "排序方式",
      Refresh: "刷新",
      "Item-Selection": "项目选择",
      "Items-Selection": "选中的项目",
      View: "视图",
      Details: "细节",
      SelectAll: "全选",
      Open: "打开",
      "Tooltip-NewFolder": "新建文件夹",
      "Tooltip-Upload": "上传",
      "Tooltip-Delete": "删除",
      "Tooltip-Rename": "改名",
      "Tooltip-Download": "下载",
      "Tooltip-Cut": "切",
      "Tooltip-Copy": "复制",
      "Tooltip-Paste": "糊",
      "Tooltip-SortBy": "排序方式",
      "Tooltip-Refresh": "刷新",
      "Tooltip-Selection": "清空选项",
      "Tooltip-View": "视图",
      "Tooltip-Details": "细节",
      "Tooltip-SelectAll": "全选",
      Name: "名称",
      Size: "尺寸",
      DateModified: "改性",
      DateCreated: "创建日期",
      Path: "路径",
      Modified: "改性",
      Created: "创建",
      Location: "地点",
      Type: "类型",
      Permission: "允许",
      Ascending: "上升",
      Descending: "降序",
      None: "没有",
      "View-LargeIcons": "大图标",
      "View-Details": "细节",
      Search: "搜索",
      "Button-Ok": "好",
      "Button-Cancel": "取消",
      "Button-Yes": "是",
      "Button-No": "没有",
      "Button-Create": "创建",
      "Button-Save": "保存",
      "Header-NewFolder": "夹",
      "Content-NewFolder": "输入您的文件夹名称",
      "Header-Rename": "改名",
      "Content-Rename": "输入你的新名字",
      "Header-Rename-Confirmation": "重命名确认",
      "Content-Rename-Confirmation":
        "如果更改文件扩展名,文件可能会变得不稳定。您确定要更改它吗？",
      "Header-Delete": "删除文件",
      "Content-Delete": "你确定要删除这个文件吗？",
      "Header-Folder-Delete": "删除资料夹",
      "Content-Folder-Delete": "您确定要删除此文件夹吗？",
      "Header-Multiple-Delete": "删除多个项目",
      "Content-Multiple-Delete": "您确定要删除这{0}个项目吗？",
      "Header-Duplicate": "文件/文件夹存在",
      "Content-Duplicate": "{0}已经存在。您要重命名和粘贴吗？",
      "Header-Upload": "上传文件",
      Error: "错误",
      "Validation-Empty": "文件或文件夹名称不能为空。",
      "Validation-Invalid":
        '文件或文件夹名称{0}包含无效字符。请使用其他名称。有效文件或文件夹名称不能以点或空格结尾,并且不能包含以下任何字符：\\ /：*？"< > |',
      "Validation-NewFolder-Exists": "名称为{0}的文件或文件夹已存在。",
      "Validation-Rename-Exists": "无法将{0}重命名为{1}：目标已存在。",
      "Folder-Empty": "这个文件夹是空的",
      "File-Upload": "将文件拖到此处上传",
      "Search-Empty": "未找到结果",
      "Search-Key": "尝试使用不同的关键字",
      "Sub-Folder-Error": "目标文件夹是源文件夹的子文件夹。",
      "Same-Folder-Error": "目标文件夹与源文件夹相同。",
      "Access-Denied": "拒绝访问",
      "Access-Details": "您无权访问此文件夹。",
      "Header-Retry": "文件已存在",
      "Content-Retry": "此文件夹中已存在具有此名称的文件。您想要做什么？",
      "Button-Keep-Both": "保留两个",
      "Button-Replace": "更换",
      "Button-Skip": "跳跃",
      "ApplyAll-Label": "为所有当前项目执行此操作",
      "Network-Error": "NetworkError：无法在XMLHTTP上发送请求：无法加载",
      "Server-Error": "ServerError：来自的无效响应",
    },
  },
});
</script>

<style>
@import "@syncfusion/ej2-base/styles/material-dark.css";
@import "@syncfusion/ej2-icons/styles/material.css";
@import "@syncfusion/ej2-inputs/styles/material-dark.css";
@import "@syncfusion/ej2-popups/styles/material-dark.css";
@import "@syncfusion/ej2-buttons/styles/material-dark.css";
@import "@syncfusion/ej2-splitbuttons/styles/material-dark.css";
@import "@syncfusion/ej2-navigations/styles/material-dark.css";
@import "@syncfusion/ej2-layouts/styles/material-dark.css";
@import "@syncfusion/ej2-grids/styles/material-dark.css";
@import "@syncfusion/ej2-vue-filemanager/styles/material-dark.css";
</style>
