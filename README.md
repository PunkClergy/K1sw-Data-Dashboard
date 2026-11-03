# K1SW 数据看板

基于 uni-app (Vue3) 跨端工程，支持 App / 微信小程序 / H5 三端，实现客户数据看板与节点列表管理。

## 功能概览

- **账号密码登录**：统一登录接口，登录态本地持久化
- **首页数据看板**：蓝青渐变欢迎卡 + 分组卡片网格，展示各节点客户数量统计
- **左侧抽屉导航**：11 个菜单项，头部品牌区 + 底部收起按钮
- **节点列表页**：卡片式多字段展示，支持展开/收起、筛选、列设置、联系人查看、跟进记录、操作菜单

## 目录结构

```
.
├── App.vue                     # 全局生命周期；onLaunch 装配认证头
├── main.js                     # Vue3 createSSRApp 入口
├── pages.json                  # 页面路由注册
├── manifest.json               # 工程配置
├── api/
│   ├── auth.js                 # 登录/退出接口
│   └── index.js                # 接口统一出口
├── pages/
│   ├── login/index.vue         # 登录页（自定义导航 + 品牌区）
│   ├── index/index.vue         # 首页（看板 + 抽屉导航）
│   └── list/index.vue         # 节点列表页（卡片 + 筛选 + 列设置 + 跟进记录 + 联系人 + 操作）
├── utils/
│   ├── auth.js                 # 登录态读写
│   └── request/http.js         # 通用网络封装
└── static/
    └── images/logo.png         # 品牌 logo
```

## 页面路由

| 路由 | 说明 |
|---|---|
| `pages/login/index` | 登录页（默认启动页） |
| `pages/index/index` | 首页数据看板 |
| `pages/list/index` | 节点列表页（从看板卡片跳转） |

## 技术栈

- uni-app + Vue3 (Composition API)
- 跨端：App / 微信小程序 / H5
- 样式：SCSS + 自定义 CSS 变量
- 主色：`#2b6cb0` → `#14b8a6` 渐变

## 运行

1. HBuilderX 打开工程
2. 运行到浏览器 / 微信开发者工具 / 手机模拟器
3. 微信小程序需在公众平台配置 request 合法域名

## 注意事项

- `manifest.json` 中 `mp-weixin.appid` 与 `app-plus.modules` 为空，出包前需补充
- 登录接口真实响应结构待联调验证
