// 登录相关接口：登录成功后由调用方保存登录态（见 utils/auth.js）
import { http } from '@/utils/request/http'
import { clearAuth } from '@/utils/auth'

// 账号密码登录，服务端要求 x-www-form-urlencoded
export const login = (data) => http.postFormData('/k1swUserApi/login', data)

// 退出登录：仅清理本地登录态
export const logout = () => clearAuth()
