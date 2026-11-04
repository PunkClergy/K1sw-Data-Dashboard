// utils/request/http.js
// 通用网络封装：基于 uni.request（App / 小程序 / H5 共用）
// 纯网络层：不内置业务请求头；token 等认证头通过 setAuthHeaderGetter 按需装配。

const defaultConfig = {
	url: '',
	method: 'GET',
	timeout: 15000
}

// 后端基础地址：切换环境改这里，或运行时调用 http.setBaseURL(url)
// const DEFAULT_BASE_URL = 'https://k1sw.wiselink.net.cn'  // 生产环境
const DEFAULT_BASE_URL = 'http://192.168.10.100:8689'  // 本地开发环境

// 将对象参数序列化为 query string（跳过 null / undefined / 空串；数组按重复 key 拼接）
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

class Http {
	constructor(config = {}) {
		this.baseURL = config.baseURL || DEFAULT_BASE_URL
		this.interceptor = {}
		this.authHeaderGetter = null
	}

	// 运行时切换基础地址
	setBaseURL(url) {
		this.baseURL = url || ''
	}

	// 注册请求 / 响应拦截器：{ request(config) => config, response(res) => res }
	setInterceptor(interceptor) {
		this.interceptor = interceptor || {}
	}

	// 注册认证头工厂：返回 { 'Header-Name': value }；返回 null / {} 时不注入
	setAuthHeaderGetter(fn) {
		this.authHeaderGetter = typeof fn === 'function' ? fn : null
	}

	async request(config) {
		let mergedConfig = {
			...defaultConfig,
			...config
		}

		// 请求拦截器
		if (typeof this.interceptor.request === 'function') {
			mergedConfig = this.interceptor.request(mergedConfig)
		}

		// 拼接 baseURL + path + query
		let url = this.baseURL + mergedConfig.url
		if (mergedConfig.params) {
			const query = buildQueryString(mergedConfig.params)
			if (query) url += (url.includes('?') ? '&' : '?') + query
		}

		// form 表单：统一转为字符串键值对；JSON 请求保持对象原样交给 uni.request
		let requestData = mergedConfig.data || {}
		if (mergedConfig.isFormData) {
			const formData = {}
			for (const key in requestData) {
				if (requestData.hasOwnProperty(key)) {
					formData[key] = requestData[key] === undefined || requestData[key] === null
						? ''
						: String(requestData[key])
				}
			}
			requestData = formData
		}

		// 通用 Content-Type：form 表单用 urlencoded，其余用 JSON
		const header = { ...(mergedConfig.header || {}) }
		header['content-type'] = mergedConfig.isFormData
			? 'application/x-www-form-urlencoded'
			: 'application/json'

		// 认证头装配（未注册则跳过，封装保持通用）
		if (typeof this.authHeaderGetter === 'function') {
			const authHeaders = this.authHeaderGetter()
			if (authHeaders && typeof authHeaders === 'object') {
				Object.assign(header, authHeaders)
			}
		}
		mergedConfig.header = header

		// 发起请求；网络层失败（断网、域名不通等）统一归一为错误对象
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
			return Promise.reject({ code: -1, msg: '网络异常，请稍后重试', raw: err })
		}

		// 响应拦截器
		let res = response
		if (typeof this.interceptor.response === 'function') {
			res = this.interceptor.response(response)
		}

		if (res.statusCode === 200) {
			return res.data
		}
		console.error('接口返回异常:', res)
		return Promise.reject({ code: res.statusCode, msg: '请求失败', data: res.data })
	}

	get(url, params, config) {
		return this.request({ ...config, url, method: 'GET', params })
	}

	post(url, data, config) {
		return this.request({ ...config, url, method: 'POST', data })
	}

	// POST application/x-www-form-urlencoded
	postFormData(url, data, config) {
		return this.request({ ...config, url, method: 'POST', data, isFormData: true })
	}

	put(url, data, config) {
		return this.request({ ...config, url, method: 'PUT', data })
	}

	del(url, params, config) {
		return this.request({ ...config, url, method: 'DELETE', params })
	}
}

// 全局单例导出
export const http = new Http({
	baseURL: DEFAULT_BASE_URL
})

export default http
