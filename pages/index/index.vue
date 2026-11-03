<template>
	<view class="page">
		<!-- 自定义顶部导航 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="menu-btn" @tap="drawerOpen = true">
					<view class="menu-icon">
						<view class="menu-line"></view>
						<view class="menu-line"></view>
						<view class="menu-line"></view>
					</view>
				</view>
				<text class="nav-title">K1SW 数据看板</text>
				<view class="nav-placeholder"></view>
			</view>
		</view>

		<!-- 主内容区 -->
		<view class="main" :style="{ paddingTop: (statusBarHeight + 56) + 'px' }">
			<view class="welcome-card">
				<text class="welcome-title">客户节点数量统计</text>
				<text class="welcome-sub">只统计当前账号名下的客户</text>
			</view>

			<view class="node-group" v-for="group in nodeGroups" :key="group.title">
				<text class="group-title">{{ group.title }}</text>
				<view class="card-grid">
					<view class="stat-card" v-for="item in group.items" :key="item.label" @tap="goList(item)">
						<view class="card-top" :style="{ background: item.color }"></view>
						<view class="card-head">
							<view class="card-dot" :style="{ background: item.color }"></view>
							<text class="card-label">{{ item.label }}</text>
						</view>
						<text class="card-num">{{ formatNum(item.value) }}</text>
						<text class="card-unit">数量</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 遮罩层 -->
		<view class="mask" :class="{ show: drawerOpen }" @tap="drawerOpen = false" @touchmove.stop.prevent></view>

		<!-- 左侧滑出抽屉 -->
		<view class="drawer" :class="{ open: drawerOpen }">
			<view class="drawer-head">
				<image class="drawer-logo" src="/static/images/logo.png" mode="aspectFit"></image>
				<text class="drawer-name">K1SW 数据看板</text>
				<text class="drawer-sub">WiseLink Fleet Digital Key</text>
			</view>

			<view class="drawer-menu">
				<view class="menu-item" v-for="item in menuList" :key="item.key" :class="{ active: activeMenu === item.key }" @tap="onMenuTap(item.key)">
					<text class="menu-text">{{ item.name }}</text>
				</view>
			</view>

			<view class="drawer-foot">
				<view class="collapse-btn" @tap="drawerOpen = false">
					<text class="collapse-text">收 起</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { logout } from '@/api'
	import { isLoggedIn } from '@/utils/auth'

	export default {
		data() {
			return {
				statusBarHeight: 20,
				drawerOpen: false,
				activeMenu: 'ops',
				menuList: [
					{ key: 'funnel1', name: '销售漏斗运营 01' },
					{ key: 'funnel2', name: '销售漏斗运营 02' },
					{ key: 'ops', name: '运营协同（看板bug）' },
					{ key: 'fdk', name: 'FDK开单' },
					{ key: 'logistics', name: '物流安装' },
					{ key: 'tech', name: '技术管理' },
					{ key: 'finance', name: '财务' },
					{ key: 'software', name: '软件设定' },
					{ key: 'market', name: '市场中心' },
					{ key: 'mgmt', name: '管理层' },
					{ key: 'system', name: '系统管理' }
				],
				nodeGroups: [
					{
						title: '基础节点',
						items: [
							{ label: 'S0', value: 12860, color: '#22d3ee' },
							{ label: 'S1', value: 8542, color: '#3b82f6' },
							{ label: 'S0.5', value: 5210, color: '#3b82f6' }
						]
					},
					{
						title: '扩展节点',
						items: [
							{ label: 'S8', value: 3187, color: '#3b82f6' },
							{ label: 'S6', value: 2456, color: '#f87171' },
							{ label: 'S5', value: 1893, color: '#4ade80' }
						]
					},
					{
						title: '业务节点',
						items: [
							{ label: 'S7', value: 1204, color: '#fbbf24' },
							{ label: 'SD', value: 865, color: '#4ade80' },
							{ label: 'SZ', value: 49985, color: '#4ade80' }
						]
					},
					{
						title: '业务节点',
						items: [
							{ label: 'S7', value: 1204, color: '#fbbf24' },
							{ label: 'SD', value: 865, color: '#4ade80' },
							{ label: 'SZ', value: 49985, color: '#4ade80' }
						]
					},
					{
						title: '业务节点',
						items: [
							{ label: 'S7', value: 1204, color: '#fbbf24' },
							{ label: 'SD', value: 865, color: '#4ade80' },
							{ label: 'SZ', value: 49985, color: '#4ade80' }
						]
					},
					{
						title: '渠道节点',
						items: [
							{ label: 'SZ-LINKEDIN', value: 3217, color: '#3b82f6' }
						]
					}
				]
			}
		},
		onLoad() {
			// #ifdef H5
			this.statusBarHeight = 0
			// #endif
			// #ifndef H5
			try {
				const sys = uni.getSystemInfoSync()
				this.statusBarHeight = sys.statusBarHeight || 20
			} catch (e) {
				this.statusBarHeight = 20
			}
			// #endif
		},
		onShow() {
			// 登录守卫：每次进入页面校验，无登录态时回到登录页
			if (!isLoggedIn()) {
				uni.reLaunch({ url: '/pages/login/index' })
			}
		},
		methods: {
			formatNum(n) {
				return Number(n).toLocaleString('en-US')
			},
			goList(item) {
				uni.navigateTo({
					url: '/pages/list/index?type=' + item.label + '&name=' + item.label + ' 节点列表'
				})
			},
			onMenuTap(key) {
				this.drawerOpen = false
				if (key === 'dashboard') return
				uni.showToast({ title: '模块建设中', icon: 'none' })
			},
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
		background: linear-gradient(180deg, #f7f9fd 0%, #edf1f7 100%);
	}

	/* ===== 自定义导航栏 ===== */
	.nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 20;
		background: #ffffff;
		box-shadow: 0 2rpx 12rpx rgba(31, 45, 74, 0.04);
	}

	.nav-content {
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24rpx;
	}

	.menu-btn {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.menu-icon {
		width: 36rpx;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.menu-line {
		height: 4rpx;
		border-radius: 2rpx;
		background: #1a2233;
	}

	.nav-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.nav-placeholder {
		width: 64rpx;
	}

	/* ===== 主内容区 ===== */
	.main {
		padding: 32rpx 32rpx 48rpx;
	}

	.welcome-card {
		position: relative;
		background: linear-gradient(135deg, #2b6cb0 0%, #14b8a6 100%);
		border-radius: 28rpx;
		padding: 48rpx 40rpx;
		margin-bottom: 36rpx;
		box-shadow: 0 20rpx 40rpx rgba(20, 184, 166, 0.25);
		overflow: hidden;
	}

	.welcome-card::after {
		content: '';
		position: absolute;
		top: -60rpx;
		right: -40rpx;
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.08);
	}

	.welcome-title {
		display: block;
		font-size: 38rpx;
		font-weight: 600;
		color: #ffffff;
		letter-spacing: 2rpx;
	}

	.welcome-sub {
		display: block;
		margin-top: 12rpx;
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
		letter-spacing: 1rpx;
	}

	.node-group {
		margin-bottom: 32rpx;
	}

	.group-title {
		display: inline-block;
		font-size: 24rpx;
		font-weight: 500;
		color: #8a93a6;
		margin-bottom: 18rpx;
		padding: 6rpx 16rpx;
		background: rgba(255, 255, 255, 0.7);
		border-radius: 20rpx;
		letter-spacing: 1rpx;
	}

	.card-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.stat-card {
		position: relative;
		width: calc((100% - 40rpx) / 3);
		background: #ffffff;
		border-radius: 20rpx;
		padding: 28rpx 22rpx 24rpx;
		box-sizing: border-box;
		box-shadow: 0 8rpx 24rpx rgba(31, 45, 74, 0.06);
		overflow: hidden;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.stat-card:active {
		transform: scale(0.97);
		box-shadow: 0 4rpx 12rpx rgba(31, 45, 74, 0.08);
	}

	.card-top {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4rpx;
		opacity: 0.8;
	}

	.card-head {
		display: flex;
		align-items: center;
		gap: 10rpx;
		margin-bottom: 18rpx;
	}

	.card-dot {
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
	}

	.card-label {
		font-size: 22rpx;
		color: #8a93a6;
		font-weight: 500;
		letter-spacing: 0.5rpx;
	}

	.card-num {
		display: block;
		font-size: 48rpx;
		font-weight: 700;
		color: #1a2233;
		line-height: 1.1;
		letter-spacing: -0.5rpx;
	}

	.card-unit {
		display: block;
		margin-top: 14rpx;
		font-size: 20rpx;
		color: #a8b0be;
		letter-spacing: 0.5rpx;
	}

	.panel-note {
		display: block;
		text-align: center;
		margin-top: 40rpx;
		font-size: 22rpx;
		color: #a8b0be;
	}

	/* ===== 遮罩层 ===== */
	.mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 30;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.3s, visibility 0.3s;
	}

	.mask.show {
		opacity: 1;
		visibility: visible;
	}

	/* ===== 左侧滑出抽屉 ===== */
	.drawer {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 520rpx;
		background: #ffffff;
		z-index: 40;
		transform: translateX(-100%);
		transition: transform 0.3s ease;
		display: flex;
		flex-direction: column;
		box-shadow: 4rpx 0 24rpx rgba(0, 0, 0, 0.08);
	}

	.drawer.open {
		transform: translateX(0);
	}

	.drawer-head {
		padding: 80rpx 40rpx 40rpx;
		background: linear-gradient(135deg, #2b6cb0 0%, #14b8a6 100%);
	}

	.drawer-logo {
		width: 96rpx;
		height: 96rpx;
		margin-bottom: 20rpx;
	}

	.drawer-name {
		display: block;
		font-size: 32rpx;
		font-weight: 600;
		color: #ffffff;
	}

	.drawer-sub {
		display: block;
		margin-top: 8rpx;
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	.drawer-menu {
		flex: 1;
		padding-top: env(safe-area-inset-top);
		overflow-y: auto;
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 28rpx 32rpx;
	}

	.menu-item.back {
		padding: 32rpx;
	}

	.back-arrow {
		width: 48rpx;
		height: 48rpx;
		position: relative;
	}

	.back-line {
		position: absolute;
		top: 50%;
		left: 8rpx;
		width: 24rpx;
		height: 4rpx;
		background: #1a2233;
		transform: translateY(-50%) rotate(45deg);
	}

	.back-line::after {
		content: '';
		position: absolute;
		left: 0;
		top: -8rpx;
		width: 16rpx;
		height: 16rpx;
		border-left: 4rpx solid #1a2233;
		border-bottom: 4rpx solid #1a2233;
		transform: rotate(45deg);
	}

	.menu-item.active {
		background: #f0f7ff;
	}

	.menu-text {
		font-size: 26rpx;
		color: #1a2233;
		font-weight: 500;
	}

	.menu-item.active .menu-text {
		color: #2b6cb0;
		font-weight: 600;
	}

	.drawer-foot {
		padding: 24rpx 40rpx calc(40rpx + env(safe-area-inset-bottom));
		border-top: 1rpx solid #eef1f6;
	}

	.collapse-btn {
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f4f6fa;
		border-radius: 40rpx;
	}

	.collapse-text {
		font-size: 28rpx;
		color: #4a5568;
		letter-spacing: 2rpx;
	}
</style>
