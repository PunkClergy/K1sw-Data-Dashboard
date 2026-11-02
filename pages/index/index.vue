<template>
	<view class="page">
		<text class="page-text">已登录</text>
		<button class="logout-btn" hover-class="btn-tap" @tap="handleLogout">退出登录</button>
	</view>
</template>

<script>
	import { logout } from '@/api'
	import { isLoggedIn } from '@/utils/auth'

	export default {
		data() {
			return {}
		},
		onShow() {
			// 登录守卫：每次进入页面校验，无登录态时回到登录页
			if (!isLoggedIn()) {
				uni.reLaunch({ url: '/pages/login/index' })
			}
		},
		methods: {
			handleLogout() {
				uni.showModal({
					title: '提示',
					content: '确定退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							logout()
							uni.reLaunch({ url: '/pages/login/index' })
						}
					}
				})
			}
		}
	}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 48rpx;
		background-color: #f5f6fa;
	}

	.page-text {
		font-size: 30rpx;
		color: #4a5568;
	}

	.logout-btn {
		width: 400rpx;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 44rpx;
		background: #ffffff;
		color: #f47c70;
		font-size: 30rpx;
		border: 1rpx solid #f2d2cc;
	}

	.logout-btn::after {
		border: none;
	}

	.btn-tap {
		opacity: 0.85;
	}
</style>
