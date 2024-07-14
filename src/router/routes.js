import {clearLocalDB} from "pages/team/hooks/useUser";

const routes = [
  {
    path: "/",
    component: () => import("layouts/TeamLayout.vue"),
    name: "homepage",
    redirect: "/teams",
    meta: {
      requireAuth: true,
      title: "易乎APP",
    },
    children: [
      {
        path: "/teams",
        component: () => import("pages/team/TeamPage.vue"),
        props: true,
        name: "teams",
        children: [
          {
            path: "/teams/:channel_id",
            component: () => import("pages/team/chat/TeamChat.vue"),
            name: "team_channel_homepage",
            props: true,
          },
          {
            path: "/teams/projects",
            component: () => import("pages/team/ProjectBody.vue"),
            name: "team_project_homepage",
            props: true,
            children: [
              {
                path: "/teams/projects/:project_id",
                component: () => import("pages/team/ProjectBody.vue"),
                name: "team_projects_page",
                props: true,
                children: [
                  {
                    path: "/teams/projects/:project_id/chat",
                    component: () => import("pages/team/chat/TeamChat.vue"),
                    name: "team_project_chat_homepage",
                    props: true,
                  },
                  {
                    path: "/teams/projects/:project_id/chat/:channel_id",
                    component: () => import("pages/team/chat/TeamChat.vue"),
                    name: "team_project_chat_page",
                    props: true,
                  },
                  {
                    path: "/teams/projects/:project_id/kanban",
                    component: () => import("src/pages/team/kanban/KanbanPage.vue"),
                    name: "team_kanban_homepage",
                    props: true,
                  },
                  {
                    path: "/teams/projects/:project_id/kanban/:kanban_id",
                    component: () => import("src/pages/team/kanban/KanbanPage.vue"),
                    name: "team_kanban_page",
                    props: true,
                  },
                  {
                    path: "/teams/projects/:project_id/classroom",
                    component: () => import("src/pages/team/kanban/KanbanPage.vue"),
                    name: "team_classroom_homepage",
                    props: true,
                  },
                  {
                    path: "/teams/projects/:project_id/classroom/:kanban_id",
                    component: () => import("src/pages/team/kanban/KanbanPage.vue"),
                    name: "team_classroom_page",
                    props: true,
                  },
                  {
                    path: "/teams/projects/:project_id/document",
                    component: () => import("src/pages/team/document/DocumentPage.vue"),
                    name: "team_project_document_homepage",
                    props: true,
                  },
                  {
                    path: "/teams/projects/:project_id/document/:document_id",
                    component: () =>
                        import("src/pages/team/document/DocumentBody.vue"),
                    name: "team_project_document_page",
                    props: true,
                  },
                  {
                    path: "/teams/projects/:project_id/storage",
                    component: () =>
                        import("src/pages/team/storage/StoragePage.vue"),
                    name: "team_project_storage_homepage",
                    props: true,
                  },
                  {
                    path: "/teams/projects/:project_id/storage/:storage_id",
                    component: () =>
                        import("src/pages/team/storage/StoragePage.vue"),
                    name: "team_project_storage_page",
                    props: true,
                  },
                  {
                    path: "/teams/projects/:project_id/schedule",
                    component: () =>
                        import("src/pages/team/schedule/SchedulePage.vue"),
                    name: "team_project_schedule_homepage",
                    props: true,
                  },
                  {
                    path: "/teams/projects/:project_id/schedule/:schedule_id",
                    component: () =>
                        import("src/pages/team/schedule/SchedulePage.vue"),
                    name: "team_project_schedule_page",
                    props: true,
                  },
                  {
                    path: "/teams/projects/:project_id/segment",
                    component: () => import("src/pages/team/kanban/KanbanPage.vue"),
                    name: "team_segment_homepage",
                    props: true,
                  },
                  {
                    path: "/teams/projects/:project_id/segment/:kanban_id",
                    component: () => import("src/pages/team/kanban/KanbanPage.vue"),
                    name: "team_segment_page",
                    props: true,
                  },
                ],
              },
            ],
          },
          {
            path: "/teams/:team_id/external/:project_id",
            component: () => import("src/pages/team/ExternalPage.vue"),
            name: "team_projects_external_page",
            props: true,
          },
          {
            path: "/teams/:team_id/focus/:project_id",
            component: () => import("src/pages/team/ExternalPage.vue"),
            name: "team_projects_focus_page",
            props: true,
          },
        ],
        meta: {
          requireAuth: true,
          title: "团队——易乎APP",
        },
      },
      {
        path: "/affairs",
        component: () => import("pages/team/AffairsPage.vue"),
        name: "AffairsPage",
      },
      {
        path: "/teams/threads",
        component: () => import("pages/team/ThreadsPage.vue"),
        name: "team_threads_homepage",
        props: true,
      },
      {
        path: "/brand",
        component: () => import("pages/IndexPage.vue"),
        props: true,
      },
      {
        path: "/brand/:id",
        component: () => import("pages/ChannelPage/IndexPage.vue"),
        props: true,
        name: "channel_homepage",
        children: [
          {
            path: "/brand/:id/posts",
            component: () =>
              import("src/pages/ChannelPage/Discover/DiscoverIndex.vue"),
            props: true,
            name: "posts",
          },
          {
            path: "/brand/:id/articles",
            component: () =>
              import("src/pages/ChannelPage/Elements/IndexPage.vue"),
            props: true,
            name: "article",
          },
          {
            path: "/brand/:id/videos",
            component: () =>
              import("src/pages/ChannelPage/Elements/IndexPage.vue"),
            props: true,
            name: "video",
          },
          {
            path: "/brand/:id/audios",
            component: () =>
              import("src/pages/ChannelPage/Elements/IndexPage.vue"),
            props: true,
            name: "audio",
          },
          {
            path: "/brand/:id/element/:elementid",
            component: () =>
              import("src/pages/ChannelPage/Elements/DetialPage.vue"),
            props: true,
            name: "element",
            meta: {
              showMaker: true,
            },
          },
          {
            path: "/brand/:id/sales",
            component: () => import("pages/ChannelPage/Sales/IndexPage.vue"),
            props: true,
            name: "sales",
          },
          {
            path: "/brand/:id/bizcard",
            component: () => import("src/pages/BizCard/IndexPage.vue"),
            props: true,
            name: "bizcard",
          },
          {
            path: "/brand/:id/favorite",
            component: () =>
              import(
                "src/pages/ChannelPage/Elements/Components/Favorite/FavoriteManager.vue"
              ),
            props: true,
            name: "favorite",
          },
        ],
        meta: {
          title: "易乎品牌",
        },
      },
      {
        path: "/userinfo",
        component: () => import("src/pages/UserCenter/UserInfo.vue"),
        props: true,
        children: [
          {
            path: "/userinfo/basicinfo",
            component: () =>
              import("src/pages/UserCenter/Manager/BasicInfo.vue"),
            props: true,
            name: "basicinfo",
          },
          {
            path: "/userinfo/article",
            component: () =>
              import(
                "src/pages/UserCenter/Manager/Element/ElementManagement.vue"
              ),
            props: true,
            meta: { type: "article", where: "userCenter" },
          },
          {
            path: "/userinfo/video",
            component: () =>
              import(
                "src/pages/UserCenter/Manager/Element/ElementManagement.vue"
              ),
            props: true,
            meta: { type: "video", where: "userCenter" },
          },
          {
            path: "/userinfo/audio",
            component: () =>
              import(
                "src/pages/UserCenter/Manager/Element/ElementManagement.vue"
              ),
            props: true,
            meta: { type: "audio", where: "userCenter" },
          },
          {
            path: "/userinfo/settings",
            component: () =>
              import("src/pages/UserCenter/Manager/UserSettings.vue"),
            props: true,
            name: "settings",
          },
          {
            path: "/userinfo/bizcard",
            component: () => import("src/pages/UserCenter/Manager/BizCard.vue"),
            props: true,
            name: "bizcard",
          },
        ],
        meta: {
          requireAuth: true,
          title: "用户中心——易乎APP",
        },
      },
    ],
  },


  {
    path: "/",
    component: () => import("layouts/CleanLayout.vue"),
    children: [
      {
        path: "/register",
        component: () => import("src/pages/UserCenter/RegisterPage.vue"),
        name: "register",
        beforeEnter: async (to, from, next) => {
          await clearLocalDB('register');
          next();
        },
        meta: {
          requireAuth: false,
          title: "用户注册——易乎APP",
        },
      },
      {
        path: "/email-confirmed",
        component: () =>
          import("src/pages/UserCenter/RegisterSteps/EmailConfirmed.vue"),
        name: "confirmed",
        beforeEnter: async (to, from, next) => {
          await clearLocalDB('email-confirmed');
          next();
        },
        meta: {
          requireAuth: false,
          title: "邮件验证——易乎APP",
        },
      },
      {
        path: "/login",
        component: () => import("src/pages/UserCenter/LoginPage.vue"),
        name: "login",
        beforeEnter: async (to, from, next) => {
          // console.log(from)
          // fix
          // 聚焦模式、外部协作模式，即：
          // src/pages/team/ExternalPage.vue页面，刷新后会跳转到此处
          // 原因待查清，此处暂时不执行退出流程
          const errPages = ['team_projects_focus_page', 'team_projects_external_page']
          if(!errPages.includes(from.name)) {
            await clearLocalDB('login');
            next();
          } else {
            // redirect: from.fullPath
            next(from.fullPath);
          }
        },
        meta: {
          requireAuth: false,
          title: "用户登陆——易乎APP",
        },
      },
      {
        path: "/forgot-password",
        component: () => import("src/pages/UserCenter/ForgotPassword.vue"),
        name: "forgot",
        beforeEnter: async (to, from, next) => {
          await clearLocalDB('forgot');
          next();
        },
        meta: {
          requireAuth: false,
          title: "忘记密码——易乎APP",
        },
      },
      {
        path: "/reset-password",
        component: () => import("src/pages/UserCenter/ResetPassword.vue"),
        name: "reset",
        beforeEnter: async (to, from, next) => {
          await clearLocalDB('reset');
          next();
        },
        meta: {
          requireAuth: false,
          title: "重设密码——易乎APP",
        },
      },
      {
        path: "/schedule/share/:id",
        component: () => import("src/pages/team/schedule/SharedPage.vue"),
        name: "shared_schedule",
        meta: {
          requireAuth: false,
          title: "共享的规划",
        },
      },
      {
        path: "/card/share/:id",
        component: () => import("src/pages/team/card/ShareCard.vue"),
        name: "shared_card",
        meta: {
          requireAuth: false,
          title: "共享的Card",
        },
      },
    ],
  },
  {
    path: "/create_team",
    component: () => import("src/pages/Chat/components/Team/CreateTeam.vue"),
    props: true,
  },
  {
    path: "/join",
    component: () => import("src/pages/JoinPage.vue"),
    props: true,
  },
  {
    path: "/middleware",
    component: () => import("src/pages/MiddleWare.vue"),
  },

  {
    path: "/test",
    component: () => import("pages/TestPage.vue"),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
