<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<text class="nav-title">登录</text>
			</view>
		</view>

		<!-- 居中内容区：品牌区 + 表单卡片 -->
		<view class="content" :style="{ paddingTop: contentPadTop + 'px' }">
			<view class="brand">
				<image class="logo" src="/static/images/logo.png" mode="aspectFit"></image>
				<text class="brand-title">K1SW 数据看板</text>
				<text class="brand-sub">Fleet Digital Key</text>
			</view>

			<view class="card">
				<view class="card-head">
					<text class="card-title">欢迎登录</text>
					<text class="card-desc">请使用账号密码进入系统</text>
				</view>

				<view class="field" :class="{ focused: focusField === 'username' }" @tap="setFocus('username')">
					<view class="field-icon icon-user" @tap.stop="setFocus('username')"></view>
					<input ref="accountInput" class="field-input" type="text" :value="username" :focus="accountFocus"
						placeholder="请输入账号" placeholder-class="ph" confirm-type="next"
						@input="onInput('username', $event)"
						@tap="setFocus('username')"
						@focus="onFocus('username')" @blur="onBlur('username')" @confirm="handleLogin" />
				</view>

				<view class="field" :class="{ focused: focusField === 'lock' }" @tap="setFocus('lock')">
					<view class="field-icon icon-lock" @tap.stop="setFocus('lock')"></view>
					<input ref="pwdInput" class="field-input" :password="!showPassword" :focus="pwdFocus" :value="password"
						placeholder="请输入密码" placeholder-class="ph" confirm-type="go"
						@input="onInput('password', $event)"
						@tap="setFocus('lock')"
						@focus="onFocus('lock')" @blur="onBlur('lock')" @confirm="handleLogin" />
					<text class="toggle-pwd" @tap.stop="showPassword = !showPassword">
						{{ showPassword ? '隐藏' : '显示' }}
					</text>
				</view>

				<button class="login-btn" :disabled="submitting" hover-class="btn-tap" @tap="handleLogin">
					{{ submitting ? '登录中…' : '登 录' }}
				</button>
			</view>
		</view>

		<!-- 底部公司介绍区（约占屏幕 1/4） -->
		<view class="company">
			<text class="company-title">WiseLink Fleet Digital Key</text>
			<text class="company-desc">面向车队运营与个人车主的数字化用车工具，提供云端控车、车辆状态与用车权限统一管理。</text>
			<text class="company-copyright">© 2026 WiseLink · K1SW 数据看板 v1.0.0</text>
		</view>
	</view>
</template>

<script>
	import { login } from '@/api'
	import { saveAuth, isLoggedIn } from '@/utils/auth'

	export default {
		data() {
			return {
				statusBarHeight: 20,
				contentPadTop: 44,
				username: '',
				password: '',
				showPassword: false,
				submitting: false,
				focusField: '',
				accountFocus: false,
				pwdFocus: false
			}
		},
		onLoad() {
			// #ifdef H5
			this.statusBarHeight = 0
			this.contentPadTop = 44
			// #endif
			// #ifndef H5
			try {
				const sys = uni.getSystemInfoSync()
				this.statusBarHeight = sys.statusBarHeight || 20
			} catch (e) {
				this.statusBarHeight = 20
			}
			this.contentPadTop = this.statusBarHeight + 44
			// #endif
		},
		onShow() {
			// 已登录则直接进入首页，避免重复登录
			if (isLoggedIn()) {
				uni.reLaunch({ url: '/pages/index/index' })
			}
		},
		methods: {
			// 输入值显式同步到 data，避免 v-model 在某些端与受控 focus 跳变不同步
			onInput(field, e) {
				this[field] = e.detail.value
			},
			// 聚焦：幂等置 true（未聚焦才触发），避免反复 false→true 跳变导致输入框重建、正在输入的值丢失
			setFocus(name) {
				this.focusField = name
				const focusKey = name === 'lock' ? 'pwdFocus' : 'accountFocus'
				if (!this[focusKey]) {
					this[focusKey] = true
				}
			},
			onFocus(name) {
				this.focusField = name
			},
			onBlur(name) {
				this.focusField = ''
				if (name === 'lock') {
					this.pwdFocus = false
				} else {
					this.accountFocus = false
				}
			},
			validateForm() {
				if (!this.username.trim()) {
					uni.showToast({ title: '请输入账号', icon: 'none' })
					return false
				}
				if (!this.password) {
					uni.showToast({ title: '请输入密码', icon: 'none' })
					return false
				}
				return true
			},
			async handleLogin() {
				if (this.submitting) return
				if (!this.validateForm()) return

				this.submitting = true
				uni.showLoading({ title: '登录中…', mask: true })
				try {
					const res = await login({
						username: this.username.trim(),
						password: this.password
					})
					uni.hideLoading()
					this.submitting = false

					// 沿用旧约定：code === 1000 为成功，用户信息（含 token 等）存入本地登录态
					if (res && res.code === 1000) {
						saveAuth(res.content || {})
						uni.reLaunch({ url: '/pages/index/index' })
						return
					}
					uni.showModal({
						title: '提示',
						content: (res && res.msg) || '登录失败，请重试',
						showCancel: false
					})
				} catch (e) {
					uni.hideLoading()
					this.submitting = false
					console.error('[login] 接口失败详情:', e)
					uni.showToast({ title: (e && e.msg) || '网络异常，请稍后重试', icon: 'none' })
				}
			}
		}
	}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		padding: 0 48rpx;
		box-sizing: border-box;
		background: linear-gradient(180deg, #f7f9fd 0%, #edf1f7 100%);
	}

	/* ===== 自定义导航栏（绝对叠加，不占用内容流高度） ===== */
	.nav-bar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
	}

	.nav-content {
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1a2233;
	}

	/* ===== 居中内容区 ===== */
	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		padding-top: 24rpx;
		box-sizing: border-box;
	}

	/* ===== 品牌区 ===== */
	.brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-bottom: 36rpx;
	}

	.logo {
		width: 144rpx;
		height: 144rpx;
		margin-bottom: 28rpx;
	}

	.brand-title {
		font-size: 40rpx;
		font-weight: 600;
		color: #1a2233;
		letter-spacing: 1rpx;
	}

	.brand-sub {
		margin-top: 12rpx;
		font-size: 24rpx;
		color: #8a93a6;
		letter-spacing: 1rpx;
	}

	/* ===== 表单卡片 ===== */
	.card {
		background: #ffffff;
		border-radius: 28rpx;
		padding: 44rpx 36rpx 40rpx;
		box-shadow: 0 20rpx 48rpx rgba(31, 45, 74, 0.08);
	}

	.card-head {
		margin-bottom: 36rpx;
	}

	.card-title {
		display: block;
		font-size: 34rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.card-desc {
		display: block;
		margin-top: 10rpx;
		font-size: 24rpx;
		color: #8a93a6;
	}

	.field {
		display: flex;
		align-items: center;
		height: 96rpx;
		padding: 0 24rpx;
		margin-bottom: 24rpx;
		background: #f4f6fa;
		border-radius: 18rpx;
		border: 2rpx solid transparent;
		box-sizing: border-box;
	}

	.field.focused {
		background: #ffffff;
		border-color: #2b6cb0;
	}

	.field-icon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
		position: relative;
	}

	/* 账号图标：头部 + 肩部 */
	.icon-user::before {
		content: '';
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		border: 2rpx solid #8a93a6;
	}

	.icon-user::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 24rpx;
		height: 14rpx;
		border-radius: 14rpx 14rpx 0 0;
		border: 2rpx solid #8a93a6;
		border-bottom: none;
	}

	/* 密码图标：锁梁 + 锁体 */
	.icon-lock::before {
		content: '';
		position: absolute;
		top: 2rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 16rpx;
		height: 12rpx;
		border-radius: 8rpx 8rpx 0 0;
		border: 2rpx solid #8a93a6;
		border-bottom: none;
	}

	.icon-lock::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 26rpx;
		height: 20rpx;
		border-radius: 6rpx;
		border: 2rpx solid #8a93a6;
	}

	.field.focused .icon-user::before,
	.field.focused .icon-user::after,
	.field.focused .icon-lock::before,
	.field.focused .icon-lock::after {
		border-color: #2b6cb0;
	}

	.field-input {
		flex: 1;
		font-size: 28rpx;
		color: #1a2233;
	}

	.toggle-pwd {
		flex-shrink: 0;
		margin-left: 12rpx;
		padding: 8rpx 12rpx;
		font-size: 24rpx;
		color: #2b6cb0;
	}

	.ph {
		color: #a8b0be;
	}

	/* ===== 登录按钮 ===== */
	.login-btn {
		margin-top: 24rpx;
		height: 96rpx;
		line-height: 96rpx;
		border-radius: 48rpx;
		background: linear-gradient(135deg, #2b6cb0 0%, #14b8a6 100%);
		color: #ffffff;
		font-size: 32rpx;
		font-weight: 600;
		letter-spacing: 4rpx;
		border: none;
		box-shadow: 0 16rpx 32rpx rgba(20, 184, 166, 0.25);
	}

	.login-btn::after {
		border: none;
	}

	.login-btn[disabled] {
		opacity: 0.6;
		box-shadow: none;
	}

	.btn-tap {
		opacity: 0.92;
		transform: scale(0.99);
	}

	/* ===== 底部公司介绍区（约占屏幕 1/4） ===== */
	.company {
		flex: 0 0 auto;
		min-height: 24vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 32rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
		border-top: 1rpx solid #e5e9f0;
		text-align: center;
		box-sizing: border-box;
	}

	.company-title {
		font-size: 26rpx;
		font-weight: 600;
		color: #4a5568;
		margin-bottom: 12rpx;
	}

	.company-desc {
		font-size: 22rpx;
		line-height: 1.7;
		color: #8a93a6;
	}

	.company-copyright {
		margin-top: 16rpx;
		font-size: 20rpx;
		color: #a8b0be;
		letter-spacing: 1rpx;
	}
</style>
