// 通用请求封装：统一 baseURL、loading、拦截器与认证头，App / 小程序 / H5 共用
const defaultConfig = {
	url: '',
	method: 'GET',
	timeout: 15000
}

// 切换环境：放开所需的一行并注释另一行，或运行时调 http.setBaseURL(url)
const DEFAULT_BASE_URL = 'https://k1sw.wiselink.net.cn'  // 生产环境
// const DEFAULT_BASE_URL = 'http://192.168.10.100:8689'

// 对象转 query string：跳过 null / undefined / 空串，数组按重复 key 拼接
function buildQueryString(params = {}) {
	return Object.keys(params)
		.filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
		.map(key => {
			const value = params[key]
			if (Array.isArray(value)) {
				return value
					.map(item => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`)
					.join('&')
			}
			return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
		})
		.filter(Boolean)
		.join('&')
}

// 请求实例：支持运行时换 baseURL、开关 loading、注入认证头
class Http {
	constructor(config = {}) {
		this.baseURL = config.baseURL || DEFAULT_BASE_URL
		this.interceptor = {}
		this.authHeaderGetter = null
		this.showLoading = true
		this.loadingCount = 0
	}

	// 运行时切换环境地址
	setBaseURL(url) {
		this.baseURL = url || ''
	}

	// 全局开关 loading 遮罩
	setLoading(enabled) {
		this.showLoading = !!enabled
	}

	// 可选的请求 / 响应拦截器
	setInterceptor(interceptor) {
		this.interceptor = interceptor || {}
	}

	// 认证头注入：每次请求前回调取 token，网络层不耦合登录态
	setAuthHeaderGetter(fn) {
		this.authHeaderGetter = typeof fn === 'function' ? fn : null
	}

	// 计数式 loading：并发请求时等最后一个结束才关闭
	_showLoading() {
		if (!this.showLoading) return
		this.loadingCount++
		if (this.loadingCount === 1) {
			uni.showLoading({
				title: '加载中...',
				mask: true
			})
		}
	}

	_hideLoading() {
		if (!this.showLoading) return
		this.loadingCount = Math.max(0, this.loadingCount - 1)
		if (this.loadingCount === 0) {
			uni.hideLoading()
		}
	}

	// 统一入口：拼 query、转表单、注入 header，错误归一成 { code, msg }
	async request(config) {
		let mergedConfig = {
			...defaultConfig,
			...config
		}

		if (typeof this.interceptor.request === 'function') {
			mergedConfig = this.interceptor.request(mergedConfig)
		}

		let url = this.baseURL + mergedConfig.url
		if (mergedConfig.params) {
			const query = buildQueryString(mergedConfig.params)
			if (query) url += (url.includes('?') ? '&' : '?') + query
		}

		let requestData = mergedConfig.data || {}
		if (mergedConfig.isFormData) {
			const formData = {}
			for (const key in requestData) {
				if (requestData.hasOwnProperty(key)) {
					formData[key] = requestData[key] === undefined || requestData[key] === null ?
						'' :
						String(requestData[key])
				}
			}
			requestData = formData
		}

		const header = {
			...(mergedConfig.header || {})
		}
		header['content-type'] = mergedConfig.isFormData ?
			'application/x-www-form-urlencoded' :
			'application/json'

		if (typeof this.authHeaderGetter === 'function') {
			const authHeaders = this.authHeaderGetter()
			if (authHeaders && typeof authHeaders === 'object') {
				Object.assign(header, authHeaders)
			}
		}
		mergedConfig.header = header

		if (mergedConfig.loading !== false) {
			this._showLoading()
		}

		let response
		try {
			response = await uni.request({
				url,
				method: mergedConfig.method,
				data: requestData,
				header: mergedConfig.header,
				timeout: mergedConfig.timeout
			})
		} catch (err) {
			console.error('网络请求失败:', err)
			if (mergedConfig.loading !== false) {
				this._hideLoading()
			}
			return Promise.reject({
				code: -1,
				msg: '网络异常，请稍后重试',
				raw: err
			})
		}

		if (mergedConfig.loading !== false) {
			this._hideLoading()
		}

		let res = response
		if (typeof this.interceptor.response === 'function') {
			res = this.interceptor.response(response)
		}

		if (res.statusCode === 200) {
			return res.data
		}
		console.error('接口返回异常:', res)
		return Promise.reject({
			code: res.statusCode,
			msg: '请求失败',
			data: res.data
		})
	}

	get(url, params, config) {
		return this.request({
			...config,
			url,
			method: 'GET',
			params
		})
	}

	post(url, data, config) {
		return this.request({
			...config,
			url,
			method: 'POST',
			data
		})
	}

	postFormData(url, data, config) {
		return this.request({
			...config,
			url,
			method: 'POST',
			data,
			isFormData: true
		})
	}

	put(url, data, config) {
		return this.request({
			...config,
			url,
			method: 'PUT',
			data
		})
	}

	del(url, params, config) {
		return this.request({
			...config,
			url,
			method: 'DELETE',
			params
		})
	}
}

// 全局单例，App.vue 启动时注入认证头
export const http = new Http({
	baseURL: DEFAULT_BASE_URL
})

export default http
