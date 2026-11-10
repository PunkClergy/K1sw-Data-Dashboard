# K1SW 数据看板

基于 uni-app（Vue3）的跨端数据看板，支持 App / 微信小程序 / H5。面向销售与派工场景，提供「登录 → 首页看板 → 客户列表 → 派工看板」的闭环，数据全部来自 K1SW 后端接口。

- 面向使用者的操作说明见 [`使用指南.md`](./使用指南.md)
- 工程内接口封装以 `api/customer.js` 为准；`API.md` 内容为早期版本，已过时

## 功能概览

| 模块 | 能力 |
|---|---|
| 登录 | 账号密码登录，登录态本地持久化，已登录时自动跳过登录页 |
| 首页看板 | 按分组的节点卡片网格，卡片右上角显示未读数徽标 |
| 抽屉导航 | 菜单接口动态加载，跨页切换保持选中态，底部退出登录 |
| 客户列表 | 卡片式列表，5 类筛选、触底分页、公司详情、沟通记录、点评、已读标记 |
| 派工看板 | 每个销售员一张卡片、独占一行 4 个指标，独立接口；点卡片进入该销售员的客户列表 |

## 页面路由

| 路由 | 页面 | 进入方式 |
|---|---|---|
| `pages/login/index` | 登录页（启动默认页） | 启动、退出登录后 |
| `pages/index/index` | 首页数据看板 | 登录成功后 `reLaunch` |
| `pages/list/index` | 客户列表 | 首页卡片、派工卡片（`navigateTo`，可返回） |
| `pages/dispatch/index` | 派工看板 | 首页抽屉第 2 项菜单（`redirectTo`） |

四个页面均为 `navigationStyle: custom`，导航栏由页面内自绘（标题取当前菜单名）。

## 入口与传参

```
登录页
  └─ 首页看板 ─┬─ 卡片 ────────→ 客户列表（from=index）
               └─ 抽屉第 2 项 → 派工页 ─ 卡片 → 客户列表（from=dispatch）
```

| 入口 | 路由参数 | 列表页行为 |
|---|---|---|
| 首页卡片 | `type=<节点名>&name=<节点名>&from=index` | `step = 节点名`，锁定「所属节点」筛选 |
| 派工卡片 | `type=<销售员>&name=<销售员>&from=dispatch` | `salerName = 销售员`，锁定「销售员」筛选 |

- 传参统一 `encodeURIComponent`，页面用 `decodeQueryValue` 解码（小程序端不会自动解码中文，否则导航标题会显示 `%E9%AC…`）。
- 抽屉菜单跳转统一 `redirectTo`（替换当前页，不压栈）；菜单点击同页时只更新高亮与标题并刷新数据，不跳页。

## 关键业务规则

### 登录与登录态

- 登录接口 `POST /k1swUserApi/login`（form-urlencoded），成功判定 `code === 1000`。
- 登录态存本地 `userKey`（存整个 `content` 对象）；认证头字段 `token`，由 `App.vue` 的 `onLaunch` 通过 `http.setAuthHeaderGetter` 注入。
- `getAuthToken` 兼容 `content.token` / `content.accessToken` / 后端直接返回字符串。
- 退出登录只清本地登录态，不调后端。
- 当前没有统一的 401 / 业务码 9000 拦截，token 过期表现为接口提示失败，需手动重新登录。

### 首页看板

- 默认选中优先级：路由带来的 `menuId`/`id` > 路由带来的 `name` > 菜单 `path` 与当前页匹配 > 列表第一项；派工页固定默认第 2 项。
- `onShow` 每次都重新拉看板数据，来回切换页面数据都是最新。
- 卡片徽标取 `notReadCount`，`> 0` 才显示，不做 99+ 截断。
- 看板数据结构：`content` 为分组数组，分组含 `name` 与 `value`（节点数组），节点含 `name` 与 `value`（数量）。

### 抽屉菜单

- 菜单来自 `GET /k1swMenuApi/menulist`，首页与派工页共用。
- 跨页点击时先用 `utils/menuIntent.js` 记下待选中菜单，关闭抽屉后 `redirectTo`，目标页 `onShow` 消费该意图并高亮，避免「跳过去选中态不对」。
- 抽屉跳转带 `menuId`、`id`、`name` 三个参数，目标页优先按 `menuId` 匹配。

### 客户列表

- 卡片字段：`createdate`（左上显示为日期）、`replyman`（绑定销售员）、`companyName`（蓝字点击即复制）、`replycontent`（超过 300 字折叠，可「显示详情 / 收起」）。
- 已读底色由 `isread` 归一得到的 `redStates` 决定；已读按钮调 `POST /contaceApi/readContact`（只传 `id`，不弹全局 loading），成功后仅改前端底色，不重拉列表。
- 点评弹窗先回填最近一次点评，未输入内容提交时按「已阅」；提交成功（`POST /contaceApi/reviewContact`）后该卡片只从前端移除，`total` 减 1 并重算 `hasMore`。
- 分页：`pageSize = 20`，`total` 取接口 `count`；`count` 为 0 或缺失时退化为「本页条数是否等于 20」判断是否还有下一页。
- 任一弹窗打开时通过 `page-meta` 的 `overflow: hidden` + `.page-locked` 锁住背景滚动，关闭后不回顶。

### 派工看板

- 数据源 `GET /reportApi/dispatchWork`，与首页的 `companyFunnel` 完全独立。
- 后端字段与页面字段在 `normalizeDispatchRows` 里归一：

| 页面字段 | 后端字段 | 说明 |
|---|---|---|
| `name` | `realName` | 兜底 `name` / `username`，空值显示「未命名」 |
| `dispatchCount` | `bindCompanyCount` | 主数值（放大显示），兜底 `num` |
| `replyCount` | `allReplyCount` | 次值 |
| `readCount` | `readReplyCount` | 次值 |
| `todayCount` | `todayReplyCount` | 次值 |

- 缺字段补 0；数值非法显示 `-`；无数据时显示「暂无派工数据」。

## 接口清单

统一约定：成功判定 `res.code === 1000`，业务数据在 `res.content`，列表总数在 `res.count`。全部封装在 `api/auth.js` 与 `api/customer.js`，页面统一从 `@/api` 导入。

| 接口 | 方法 | 用途 |
|---|---|---|
| `/k1swUserApi/login` | POST（form） | 登录 |
| `/k1swMenuApi/menulist` | GET | 抽屉菜单（首页与派工页共用） |
| `/reportApi/companyFunnel` | GET | 首页看板分组数据 |
| `/reportApi/dispatchWork` | GET | 派工页看板数据 |
| `/contaceApi/contactList` | GET | 客户列表分页（`page`、`pageSize`、`companyName`、`startDate`、`endDate`、`step`、`salerName`、`isReview`） |
| `/contaceApi/moreContactList` | GET | 沟通记录（`orderid`、`type`） |
| `/contaceApi/companyInfo` | GET | 公司详情（`orderid`、`type`） |
| `/contaceApi/reviewContact` | POST（form） | 提交点评（`reviewContent`、`id`） |
| `/contaceApi/readContact` | POST（form） | 标记已读（`id`） |
| `/contaceApi/personList` | GET | 销售员下拉 |
| `/contaceApi/stepList` | GET | 所属节点下拉 |

## 筛选与入口锁定

| 筛选项 | 控件 | 参数 | 备注 |
|---|---|---|---|
| 公司名称 | 输入框 | `companyName` | 模糊匹配由后端决定 |
| 点评状态 | 三档胶囊 | `isReview` | `''` 全部 / `0` 未点评（默认）/ `1` 已点评 |
| 销售员 | 下拉 | `salerName` | 数据取 `/contaceApi/personList` |
| 所属节点 | 下拉 | `step` | 数据取 `/contaceApi/stepList`，仅派工入口进入时才加载 |
| 创建时间 | 起止日期 | `startDate` / `endDate` | `YYYY-MM-DD` |

两个下拉都展示，但由入口锁定其中一项（灰底 `is-locked`，不可点）：

| 入口 | 销售员 | 所属节点 |
|---|---|---|
| `from=index` | 可选 | 锁定为进入时的卡片名 |
| `from=dispatch` | 锁定为进入时的销售员 | 可选 |

「重置」保留锁定项，只清其余条件。

## 网络层

`utils/request/http.js` 基于 `uni.request` 封装：

| 能力 | 说明 |
|---|---|
| 基础地址 | `DEFAULT_BASE_URL` 常量化，运行时可用 `http.setBaseURL(url)` 覆盖 |
| 全局 loading | 默认开启，并发请求按计数关闭；单次请求传 `{ loading: false }` 可关闭 |
| 拦截器 | `setInterceptor({ request, response })` |
| 认证头 | `setAuthHeaderGetter(fn)`，已在 `App.vue` 装配 `token` |
| GET 参数 | 对象自动序列化，跳过 `null` / `undefined` / 空串，数组按重复 key 拼接 |
| 表单提交 | `postFormData(url, data)` 自动转 `application/x-www-form-urlencoded` |
| 错误归一 | 网络异常与 HTTP 非 200 统一为 `{ code, msg }`，页面直接读 `err.msg` |

## 目录结构

```
.
├── App.vue                     # onLaunch 装配认证头
├── main.js                     # Vue3 入口（保留 Vue2/Vue3 条件编译分支）
├── pages.json                  # 4 个页面路由
├── manifest.json               # 各端配置
├── api/
│   ├── auth.js                 # 登录、退出
│   ├── customer.js             # 菜单、看板、客户、详情、点评、已读、下拉数据
│   └── index.js                # 接口统一出口
├── pages/
│   ├── login/index.vue         # 登录页
│   ├── index/index.vue         # 首页看板 + 抽屉导航
│   ├── list/index.vue          # 客户列表（筛选/分页/详情/跟进/点评/已读）
│   └── dispatch/index.vue      # 派工看板
├── utils/
│   ├── auth.js                 # 登录态读写（userKey）
│   ├── menuIntent.js           # 跨页菜单选中意图（一次性传递）
│   └── request/http.js         # 通用网络封装
├── static/images/logo.png      # 品牌 logo
├── 使用指南.md                  # 使用与排错手册
└── API.md                      # 早期接口文档（已过时，勿以此为准）
```

## 技术栈与视觉

- uni-app + Vue3，`vueVersion: "3"`，`transformPx: false`
- 主色：`#2b6cb0` → `#14b8a6` 蓝青渐变；页面背景 `#f7f9fd` → `#edf1f7`
- 卡片颜色按索引循环：`#22d3ee`、`#3b82f6`、`#4ade80`、`#fbbf24`、`#f87171`、`#a78bfa`

## 运行与配置

1. 用 HBuilderX 打开工程目录；
2. 「运行」→ 浏览器（H5）/ 微信开发者工具 / 手机或模拟器；
3. 小程序端首次运行需在开发者工具勾选「不校验合法域名」，或按下方配置合法域名。

| 配置项 | 当前值 | 说明 |
|---|---|---|
| 后端地址 | `http://192.168.10.100:8689` | 在 `utils/request/http.js` 的 `DEFAULT_BASE_URL`；生产地址 `https://k1sw.wiselink.net.cn` 以其上一行注释形式保留，切换时放开注释、注释掉本地那行 |
| 微信小程序 AppID | `wxb22f46c5e4301c1c` | 已填 |
| 小程序域名校验 | `urlCheck: false` | 开发期跳过校验，正式发布前需在公众平台配置 request 合法域名 |
| H5 路由 | `hash`，`base: "./"` | 可部署到任意子目录 |
| App 端模块 | `app-plus.modules` 与 android `permissions` 为空 | 打 App 安装包前按实际能力补齐 |

## 已知限制

| 项目 | 现状 |
|---|---|
| token 失效 | 无统一 401 / 9000 拦截，不会自动跳登录 |
| 登录成功校验 | 未校验返回内容中是否含 token |
| 点评后消失 | 仅前端移除，未回写后端状态，重进列表会按「点评状态」重新出现 |
| 列表刷新 | 列表页只有 `onLoad`，没有 `onShow`，返回本页不会自动刷新 |
| 首页数字格式 | `formatNumber` 未守卫空值，字段缺失会显示 `NaN`（派工页已兜底为 `-`） |
| 字段口径 | `isread`、`stepList` 返回结构、`isReview` 参数名仍待后端确认 |
| `API.md` | 内容为早期路径（如 `/api/dashboard/stats`），以本文件与 `api/customer.js` 为准 |
