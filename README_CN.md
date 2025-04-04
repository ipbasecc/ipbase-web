# 易乎APP(IPBase)

## 简介
易乎APP(IPBase) 是一款社交向协作延伸的“无界协作平台”应用，兼具通讯、社交、项目管理、自媒体运营功能，其设计目标是为客户提供一个整合协作对象、实现无地域阻碍、无认知隔阂组建协作团队，并实现团队协作管理，关系维护，社区建设的综合性平台应用。

### 应用网址：
- 国际站点: https://app.ipbase.cc
- 中国大陆：https://app.yihu.team


### 演示视频
[产品说明](https://player.bilibili.com/player.html?isOutside=true&aid=113397119064415&bvid=BV1bMSVYUEzF&cid=26539262393&p=1)

![任务管理](https://blob.ipbase.cc/kanban_CN.png "任务管理")
![四象限视图](https://blob.ipbase.cc/Quadrant_CN.png "四象限视图")
![快捷沟通](https://blob.ipbase.cc/Task_chat_CN.png "快捷沟通")
![任务详情](https://blob.ipbase.cc/Task_detial_CN.png "任务详情")
![剪辑镜头管理](https://blob.ipbase.cc/Segment_CN.png "剪辑镜头管理")

## 应用功能
1. **通讯**：基于Mattermost的通讯功能，支持频道、群组、私聊等多种通讯方式，支持消息回复、置顶、收藏、关注等功能；
2. **协作**：支持看板、课堂、文档、文件、规划等多种协作方式，支持任务管理、项目管理、自媒体运营等功能；
3. **社交**：基于协作后的社交延续，以保持协作关联为目标的社交场景；
4. **自媒体服务**：个人频道，可发布文章、视频、音频等，支持粉丝互动、评论、点赞等功能；

## 适合场景
1. **自媒体团队**：“快节奏”“高产出”“跨地域”“高度自由”是自媒体团队天生的特点，本产品“离散式沟通”的特殊设计正是面向团队沟通中“信息繁杂”“更新快、响应快、确定性低”的问题而设计，你可以针对具体的任务、代办单独讨论，也可以对讨论内容进行标注、收藏、置顶,使用本产品您可以轻易的对任务进行规划、分解，并且将人、事、责、产打通、关联；
2. **私域经营**：参考下文功能说明，平台本身按照 团队、频道、项目的结构设计，每个层级都可以实现独立的角色与权限控制，层级越深，也越能提供更多服务，天然就是一个销售漏斗设计，你可以将粉丝引流到团队中，在公共频道完成大体量日常维护，并将特定需求的用户分流到具体的项目中，以提供个性化服务，后期我们也会加入支付功能，以便实现更多商业化场景；
3. **项目管理**：您可以借助产品功能，跨越地域限制对团队、项目的人、事、产完成沟通、调度、评级（未来版本）；
4. **大型团队**：您可以将产品部署到内网，如果企业规模较大，按照事务将人力分割到不同的团队中，实现独立管理；也可以按照项目将人力分割到不同项目中，从而完成内部管理，从而杜绝企业数据泄漏的风险

---

## 功能说明

1. 特色功能：
   1. **离散式沟通**：项目内可以针对每个卡片、代办、文档完成讨论，而无须在一个讨论窗口内针对所有事务讨论，您可以很轻易的在卡片界面或者对应代办的“更多”按钮内找到开启讨论的按钮；
   2. **增强型看板**：看板内卡片 UI 根据每个卡片的“重要度”“紧急度”有对应的视觉设计，同时可以在“看板”“列表”“四象限”三种形态间切换，在“四象限”形态下，您可以直观的对所有任务的执行来排序
   3. **多类型卡片**：每个卡片均有三种类型，可以按需创建或转换，你可以实现复杂任务、代办、备忘等管理；
   4. **自定义存储**：你可以创建自己的 Azure Blob 存储（仅限文件功能），从而不必使用官方的 OSS 存储；
   5. **混合成员私有内容**：针对看板、卡片，成员可以关联自己的代办，以便自己对对应工作自我安排，而该内容也仅限成员自己可见；
2. 结构：团队 -> 频道 + 项目；
3. 核心功能：项目，包含：讨论、看板、课堂、文档、文件、规划；
   1. 讨论：继承自 Mattermost 功能，可以自由创建频道，可以对每条消息发表回复，并置顶、收藏、关注等；
   2. 看板：以卡片形式对事务进行组织，结构为 board -> group -> kanban -> column -> card;每个结构体均可以创建多个，卡片分为 task、note、todo 三种类型，前端可以自由选择创建或者相互转换；
   3. 课堂：看板 Board 的特殊类型：classroom，通过类型在前端按照制定 UI 来呈现看板数据，本质就是看板，后期会制定更多的 Board 类型以满足不同的场景需求，从而衍生出更多的功能模块，也会加入支付模块，以满足私域运营的需要；
   4. 文档：简单的文档功能，引入了 Tiptap 来完成编辑和呈现;
   5. 文件：团队网盘，默认使用 OSS，同时用户可以创建自定义 Azure Blob 存储，从而使用自己的存储服务；
   6. 规划：使用 ej2 组件完成的 schedule 功能，如果是商业使用，注意要获取官方授权
   7. 卡片：
      1. 类型：task - 任务、note - 笔记、todo - 代办；
      2. 功能：继承讨论、看板、文档、文件、规划到每个卡片；
   8. 注意：Azure 存储和规划功能，使用了 ej2 组件，如果是商业使用注意获取官方授权，或者自行替换；
4. 权限判断：团队、频道、项目、卡片均有独立的权限系统，可以独立控制，同时本层权限未定义时将继承上层权限，本层权限存在时本层权限优先

## QQ群
![QQ群](https://airspace.oss-cn-shanghai.aliyuncs.com/images/QQGroup.jpg "QQ群")
---

## 适合场景

1. **自媒体团队**：“快节奏”“高产出”“跨地域”“高度自由”是自媒体团队天生的特点，本产品“离散式沟通”的特殊设计正是面向团队沟通中“信息繁杂”“更新快、响应快、确定性低”的问题而设计，你可以针对具体的任务、代办单独讨论，也可以对讨论内容进行标注、收藏、置顶,使用本产品您可以轻易的对任务进行规划、分解，并且将人、事、责、产打通、关联；
2. **私域经营**：参考下文功能说明，平台本身按照 团队、频道、项目的结构设计，每个层级都可以实现独立的角色与权限控制，层级越深，也越能提供更多服务，天然就是一个销售漏斗设计，你可以将粉丝引流到团队中，在公共频道完成大体量日常维护，并将特定需求的用户分流到具体的项目中，以提供个性化服务，后期我们也会加入支付功能，以便实现更多商业化场景；
3. **项目管理**：您可以借助产品功能，跨越地域限制对团队、项目的人、事、产完成沟通、调度、评级（未来版本）；
4. **大型团队**：您可以将产品部署到内网，如果企业规模较大，按照事务将人力分割到不同的团队中，实现独立管理；也可以按照项目将人力分割到不同项目中，从而完成内部管理，从而杜绝企业数据泄漏的风险

---

## 部署说明

> 详细部署说明请参考 [部署文档](./deploy.md)
> 本产品部署稍嫌繁琐，但并不高深，需要仔细处理，软件运行需要部署前端和后端，请按照说明逐步操作，否则可能引发错误！

1. 部署 Mattermost
   > 请参考官方文档：https://docs.mattermost.com/guides/deployment.html
   > 根据你的平台选择对应的方案部署，注意：（a）如果使用 PostgreSQL，请务必按照官方步骤配置数据库；（b）如果你需要独立使用 Mattermost，并且想要使用其 AI 功能，必须选择 PostgreSQL 数据库；（c）务必正确配置好反代，否则 Mattermost websocket 服务无法连接平台功能将大量无法使用
2. 部署 Strapi
   拉取后端源码后，自行修改配置文件中的相关字段，之后运行(可以根据自己的包管理工具自行安装依赖)
   ```bash
   yarn
   ```
   或者你可以使用
   ```bash
   npm install
   pnpm install
   cnpm install
   ```
   之后运行
   ```bash
   yarn develop
   ```
   经过上一步折腾之后，如果运行依然报缺少依赖，我的方案是：
   ```bash
   pnpm install
   npm install
   yarn
   ```
   根据提示打开网页，创建管理员账号，并准备完成接下来的配置
3. 部署前端
   拉取前端代码，安装依赖(参考上一步)
4. 配置
   复制源码中的 .env.example 为 .env 文件，按照其中的说明逐步配置，牵扯到 Strapi 内部资源时，请在 Strapi 内上传必要的文件，并获取 ID 后配置 .env 中的字段，后端配置请务必按照 .env 文件内的说明完整配置，否则可能引发功能缺失或 bug
5. 安全加固
   请自行配置 Strapi 中间件、插件设置、邮件配置等内容，例如您可以开启注册邮件确认、跨域设置、注册字段限制等，自行设置 Mattermost 中的跨域设置、邮件配置、SSL 配置等，您也可以修改前端代码，开启 cloudflare 中的真人识别，这需要您自行申请 cloudflare 相关 API；
6. 部署
   > 1. 后端：上传源码到服务器，执行`yarn build`编译，之后执行`yarn start`启动服务，你也可以使用其它工具或者宝塔面板之后的运维工具来管理 node 项目；
   > 2. 前端: 本地编译`quasar build`，之后上传 dist 目录下对应类型文件夹下文件到服务器即可，推荐使用`quasar build -m pwa`将前端打包为 pwa 应用，以便将静态资源缓存到用户本地；
   > 3. 注意事项：（a）如果使用的是 Apache 服务器，注意配置 vue 的路由模式；（b）部署完 Mattermost 后务必先登陆 Mattermost 并确保反代、websocket 连接均正常

## 其它说明：

由于产品在开发迭代时经历多次修正，当您阅读源码时可能会发现，前端中其实包含了四个大的功能：

1. 团队，这也是最终呈现的产品；
2. 项目：如果您愿意，可以对源码进行少量修改即可提取出一个独立的项目管理产品，它包含了您在最终产品中看到的“项目”部分的全部或部分功能，您可能需要一些修改才能使其正常工作；
3. chat：他是一个基于 Quasar 的 Mattermost 前端，您也可以将其提取为一个独立的产品，从而实现对 Mattermost web 端的 vue 重构，注意您需要结合 team 文件夹内有关 chat 的部分对该内容进行升级，事实上在后期我对聊天组件进行了大量的修改，并没有同步到此，您需要手动完成这里的修改；
4. 资讯：您可能注意到有关用户个人频道的代码，我会在后期的迭代部分对此处进行重构，您也可以对此进行相关的测试和修改，从而提取出一个类似掘金、36Kr 那样的资讯站点，每个用户都拥有自己的频道，可以发布文章、视频、音频、专辑等

## 鸣谢：

- PostgreSQL： https://www.postgresql.org
- Strapi： https://strapi.io
- Mattermost： https://mattermost.com
- Quasar： https://quasar.dev
- Tiptap: https://tiptap.dev
- Ej2： https://www.syncfusion.com