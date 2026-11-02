// utils/auth.js
// 登录态统一读写（替代散落的 storage 键名与空对象判断）

const AUTH_STORAGE_KEY = 'userKey'

// 保存登录信息（登录成功后调用）
export function saveAuth(info) {
	uni.setStorageSync(AUTH_STORAGE_KEY, info || {})
}

// 读取登录信息，未登录返回 null
export function getAuth() {
	return uni.getStorageSync(AUTH_STORAGE_KEY) || null
}

// 提取 token（兼容常见字段名；无则返回 null）
export function getAuthToken() {
	const auth = getAuth()
	if (!auth) return null
	if (typeof auth === 'string') return auth
	return auth.token || auth.accessToken || null
}

// 清除登录态（退出登录调用）
export function clearAuth() {
	uni.removeStorageSync(AUTH_STORAGE_KEY)
}

// 是否已登录：兼容对象、字符串两类存储形态
export function isLoggedIn() {
	const auth = getAuth()
	if (!auth) return false
	if (typeof auth === 'string') return auth.trim().length > 0
	if (typeof auth === 'object') return Object.keys(auth).length > 0
	return false
}
