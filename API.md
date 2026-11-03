# K1SW 数据看板 接口文档

Base URL: `https://k1sw.wiselink.net.cn`

---

## 1. 登录

### POST /api/login

账号密码登录，表单提交。

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| username | string | 是 | 账号 |
| password | string | 是 | 密码 |

**Content-Type**: `application/x-www-form-urlencoded`

**成功响应**

```json
{
  "code": 1000,
  "content": {
    "token": "xxx",
    "userInfo": {}
  }
}
```

**成功约定**: `res.code === 1000`，将 `res.content` 存入本地登录态。

---

## 2. 退出登录

清除本地登录态，无需请求后端。

---

## 3. 待接入接口

以下为前端已预留但尚未接入后端的接口：

### 3.1 节点数据看板

- `GET /api/dashboard/stats` - 各节点客户数量统计
- 响应示例：
```json
{
  "code": 1000,
  "content": {
    "S0": 1200,
    "S1": 860,
    "S0.5": 540,
    "S8": 320,
    "S6": 210,
    "S5": 180,
    "S7": 95,
    "SD": 67,
    "SZ": 49985,
    "SZ-LINKEDIN": 3200
  }
}
```

### 3.2 节点列表

- `GET /api/customer/list?nodeType=S0` - 节点客户列表
- 支持筛选参数：company、phone、sales、startDate、endDate、followStatus、level、taskType、email、linkedin、whatsapp
- 支持分页参数：page、pageSize

### 3.3 联系人列表

- `GET /api/customer/:id/contacts` - 某客户的联系人列表
- 响应字段：name、phone、email、linkedin

### 3.4 跟进记录

- `GET /api/customer/:id/follow-ups` - 跟进记录列表
- `POST /api/customer/:id/follow-ups` - 新增跟进记录

### 3.5 操作接口

- `POST /api/customer/:id/actions` - 执行操作（编辑、发送邮件、转S0触达、申请转SD等）

---

## 网络封装说明

统一封装在 `utils/request/http.js`：

- `http.get(url, params)` - GET 请求
- `http.post(url, data)` - JSON POST
- `http.postFormData(url, data)` - 表单 POST
- `http.put(url, data)` - PUT 请求
- `http.del(url, params)` - DELETE 请求

认证头自动注入：已登录时自动从本地登录态取 token 注入 `Authorization` 头。
