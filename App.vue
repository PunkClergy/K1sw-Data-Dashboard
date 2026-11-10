<script>
	import { http } from '@/utils/request/http'
	import { getAuthToken } from '@/utils/auth'

	export default {
		globalData: {
			version: '1.0.0'
		},
		// 启动时把 token 注入 http 层，业务代码不用再关心认证头
		onLaunch() {
			http.setAuthHeaderGetter(() => {
				const token = getAuthToken()
				return token ? { token: token } : null
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
	page {
		background-color: #f5f6fa;
	}
</style>
