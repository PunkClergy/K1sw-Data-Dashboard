<script>
	import { http } from '@/utils/request/http'
	import { getAuthToken } from '@/utils/auth'

	export default {
		globalData: {
			version: '1.0.0'
		},
		onLaunch() {
			// 统一装配认证头：从本地登录态取 token 注入请求；未登录不注入
			// 若后端要求 "Bearer xxx" 形式，在此处拼接：`Bearer ${token}`
			http.setAuthHeaderGetter(() => {
				const token = getAuthToken()
				return token ? { Authorization: token } : null
			})
		},
		onShow() {},
		onHide() {},
		onError(msg) {
			console.error('App error:', msg)
		}
	}
</script>

<style>
	/* 全局样式 */
	page {
		background-color: #f5f6fa;
	}
</style>
