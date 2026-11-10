// 登录态工具：本地缓存统一用 userKey 这一个 key
const AUTH_STORAGE_KEY = 'userKey'

export function saveAuth(info) {
	uni.setStorageSync(AUTH_STORAGE_KEY, info || {})
}

export function getAuth() {
	return uni.getStorageSync(AUTH_STORAGE_KEY) || null
}

// 兼容后端返回字符串或对象两种登录态结构，统一取 token
export function getAuthToken() {
	const auth = getAuth()
	if (!auth) return null
	if (typeof auth === 'string') return auth
	return auth.token || auth.accessToken || null
}

export function clearAuth() {
	uni.removeStorageSync(AUTH_STORAGE_KEY)
}

// 页面 onShow 的登录判定：有登录态才算已登录
export function isLoggedIn() {
	const auth = getAuth()
	if (!auth) return false
	if (typeof auth === 'string') return auth.trim().length > 0
	if (typeof auth === 'object') return Object.keys(auth).length > 0
	return false
}
