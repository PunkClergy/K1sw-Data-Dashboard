# WiseLink Auto Ride 登录骨架（uni-app / Vue3）

账号密码登录工程，App、微信小程序、H5 共用同一套代码与登录接口；不含微信登录、多语言、蓝牙控车与地图模块。

## 一、目录结构

```
.
├── App.vue                     # 全局生命周期；onLaunch 装配认证头
├── main.js                     # Vue3 createSSRApp 入口
├── index.html                 # H5 模板壳（hash 路由，base "./"）
├── manifest.json              # 工程配置（appid / 平台模块 / H5 路由）
├── pages.json                 # 页面路由注册
├── uni.scss                   # uni 官方样式变量
├── api\
│   ├── auth.js                # loginEnter 登录、logout 退出
│   └── index.js               # 接口统一出口
├── pages\
│   ├── login\index.vue        # 账号密码登录页（启动页）
│   └── index\index.vue         # 首页（登录守卫 + 退出登录）
└── utils\
    ├── auth.js                # 登录态读写（saveAuth/getAuth/clearAuth/isLoggedIn/getAuthToken）
    └── request\http.js        # 通用网络封装（get/post/postFormData/put/del + 拦截器 + 认证头装配）
```

## 二、页面与路由

| 路由 | 作用 | 关键逻辑 |
|---|---|---|
| `pages/login/index` | 登录页（默认启动页） | 账号 `username` + 密码 `lock` 校验、loading 防抖、已登录自动跳首页、密码可见切换、回车提交 |
| `pages/index/index` | 首页占位 | `onShow` 登录守卫；退出登录清除本地态并返回登录页 |

## 三、登录接口

- 地址：`POST https://k1sw.wiselink.net.cn/loginEnter`
- 格式：`application/x-www-form-urlencoded`
- 参数：

| 字段 | 必填 | 说明 |
|---|---|---|
| `username` | 是 | 账号 |
| `lock` | 是 | 密码（字段名为 lock） |
| `companyId` | 否 | 企业编号，当前不传 |
| `companyType` | 否 | 企业类型，当前不传 |

- 成功约定（沿用旧项目，待联调核对）：`res.code === 1000` 为成功，`res.content` 存入本地登录态 `userKey`。
- 失败：弹窗展示 `res.msg`；网络异常统一 toast 提示。

## 四、网络封装（utils/request/http.js）

- 方法：`get` / `post` / `postFormData` / `put` / `del`
- `DEFAULT_BASE_URL` 在文件顶部配置，也可运行时 `http.setBaseURL(url)` 切换环境
- `setInterceptor({ request, response })`：请求/响应拦截器
- `setAuthHeaderGetter(fn)`：装配认证头，未登录不注入；`App.vue` 默认从本地登录态取 `token / accessToken` 注入 `Authorization`
- 网络层异常（断网、超时、非 200）统一 reject 为 `{ code, msg, data? }`

新增接口示例：

```js
// api/xxx.js
import { http } from '@/utils/request/http'
export const fetchList = (params) => http.get('/xxx/list', params)
```

```js
// api/index.js
export * from './auth'
export * from './xxx'
```

## 五、运行与上线注意

1. 用 HBuilderX 打开工程运行到浏览器 / 手机模拟器 / 微信开发者工具。
2. 微信小程序需在公众平台把 `k1sw.wiselink.net.cn` 加入 request 合法域名；开发期 `manifest.json` 已设 `urlCheck: false`。
3. `manifest.json` 中 `mp-weixin.appid` 与 `app-plus.modules` 为空，正式出小程序 / App 包前需补充 appid 与所需权限模块。
4. `unpackage/` 为构建产物，代码调整后建议清理重新编译。
5. 若 `loginEnter` 真实响应结构与 `code/content` 约定不同，只需调整 `pages/login/index.vue` 的成功判断与 `utils/auth.js` 的字段提取。
