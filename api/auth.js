// api/auth.js
// 登录相关接口（App / 小程序 / H5 共用同一后端接口）
import { http } from '@/utils/request/http'
import { clearAuth } from '@/utils/auth'

// 账号密码登录：POST application/x-www-form-urlencoded
// 表单字段：
//   username    账号（必填）
//   lock        密码（必填）
//   companyId   企业编号（可选，当前不传）
//   companyType 企业类型（可选，当前不传）
export const loginEnter = (data) => http.postFormData('/loginEnter', data)

// 退出登录：清除本地登录态
export const logout = () => clearAuth()
