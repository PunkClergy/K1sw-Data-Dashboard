// api/auth.js
// 登录相关接口（App / 小程序 / H5 共用同一后端接口）
import { http } from '@/utils/request/http'
import { clearAuth } from '@/utils/auth'

// 账号密码登录：POST application/x-www-form-urlencoded
// 表单字段：
//   username   账号（必填）
//   password   密码（必填）
export const login = (data) => http.postFormData('/k1swUserApi/login', data)

// 退出登录：清除本地登录态
export const logout = () => clearAuth()
