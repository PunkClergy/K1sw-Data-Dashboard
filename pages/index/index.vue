<template>
	<!-- 首页数据看板：抽屉菜单 + 分组卡片，卡片右上角显示未读数 -->
	<view class="page">

		<view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="navbar__inner">
				<view class="navbar__menu-btn" @tap="openDrawer">
					<view class="navbar__menu-icon">
						<view class="navbar__menu-line"></view>
						<view class="navbar__menu-line"></view>
						<view class="navbar__menu-line"></view>
					</view>
				</view>
				<text class="navbar__title">{{ navTitle }}</text>
				<view class="navbar__placeholder"></view>
			</view>
		</view>

		<view class="content" :style="{ paddingTop: (statusBarHeight + 56) + 'px' }">

			<view class="banner">
				<text class="banner__title">{{activeName}}</text>
				<text class="banner__sub">只统计当前账号名下的客户</text>
			</view>

			<view class="dashboard" v-for="group in dashboardGroups" :key="group.name">
				<text class="dashboard__group-title">{{ group.name }}</text>
				<view class="dashboard__cards">
					<view class="dashboard__card" v-for="(item, idx) in group.value" :key="item.name"
						@tap="onCardClick(item)">
						<view class="dashboard__card-top" :style="{ background: getCardColor(idx) }"></view>

						<!-- 未读数徽标：自占一行靠右，0 条不显示 -->
						<view class="dashboard__card-flag">
							<view class="dashboard__card-badge" v-if="item.notReadCount > 0">
								<text class="dashboard__card-badge-text">{{ item.notReadCount }}</text>
							</view>
						</view>
						<view class="dashboard__card-head">
							<view class="dashboard__card-dot" :style="{ background: getCardColor(idx) }"></view>
							<text class="dashboard__card-label">{{ item.name }}</text>
						</view>
						<text class="dashboard__card-num">{{ formatNumber(item.value) }}</text>
						<text class="dashboard__card-unit">数量</text>
					</view>
				</view>
			</view>
		</view>

		<view class="drawer-mask" :class="{ 'drawer-mask--visible': isDrawerOpen }" @tap="closeDrawer"
			@touchmove.stop.prevent></view>

		<view class="drawer" :class="{ 'drawer--open': isDrawerOpen }">

			<view class="drawer__header">
				<view class="drawer__close" @tap="closeDrawer">
					<text class="drawer__close-icon">✕</text>
				</view>
				<image class="drawer__logo" src="/static/images/logo.png" mode="aspectFit"></image>
				<text class="drawer__brand">Wiselink K1SW</text>
				<text class="drawer__slogan">Fleet Digital Key</text>
			</view>

			<scroll-view scroll-y class="drawer__menu">
				<view class="drawer__menu-item" v-for="item in menuList" :key="item.id"
					:class="{ 'drawer__menu-item--active': activeMenuId === item.id }" @tap="onMenuItemClick(item)">
					<text class="drawer__menu-text">{{ item.name }}</text>
				</view>
			</scroll-view>

			<view class="drawer__footer">
				<view class="drawer__logout-btn" @tap="handleLogout">
					<text class="drawer__logout-text">退出登录</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		logout,
		getMenuList,
		getCompanyFunnel
	} from '@/api'
	import {
		isLoggedIn
	} from '@/utils/auth'
	import {
		setPendingMenu,
		takePendingMenu
	} from '@/utils/menuIntent'

	export default {
		data() {
			return {
				statusBarHeight: 20,
				isDrawerOpen: false,
				activeMenuId: null,
				activeName: '数据看板',
				appTitle: 'K1SW 数据看板',
				menuList: [],
				dashboardGroups: [],
				pendingMenu: null
			}
		},
		computed: {
			navTitle() {
				return this.activeName || this.appTitle
			}
		},
		onLoad(options) {
			this.menuQuery = options || {}
			this.menuQuery.name = this.decodeQueryValue(this.menuQuery.name)
			this.initStatusBarHeight()
			this.loadMenuData()
		},
		// 每次进入都重新拉看板数据，不做已加载判断
		onShow() {
			this.checkLoginStatus()
			this.consumePendingMenu()
			this.loadDashboardData()
		},
		methods: {
			decodeQueryValue(val) {
				if (val == null) return ''
				const str = String(val)
				if (str.indexOf('%') === -1) return str
				try {
					return decodeURIComponent(str)
				} catch (e) {
					return str
				}
			},
			initStatusBarHeight() {
// #ifdef H5
				this.statusBarHeight = 0
// #endif
// #ifndef H5
				try {
					const sysInfo = uni.getSystemInfoSync()
					this.statusBarHeight = sysInfo.statusBarHeight || 20
				} catch (e) {
					this.statusBarHeight = 20
				}
// #endif
			},

			checkLoginStatus() {
				if (!isLoggedIn()) {
					uni.reLaunch({
						url: '/pages/login/index'
					})
				}
			},

			// 抽屉跳转过来的选中态：一次性消费，避免下次进入还沿用
			consumePendingMenu() {
				const pending = takePendingMenu()
				if (!pending) return
				this.pendingMenu = pending
				if (this.menuList.length > 0) {
					this.applyMenuSelection(pending)
				}
			},

			applyMenuSelection(menu) {
				if (!menu) return
				const matched = this.menuList.find(m => String(m.id) === String(menu.id))
				if (!matched) return
				this.activeMenuId = matched.id
				this.activeName = matched.name
			},

			// 菜单载入后确定默认选中项，并把高亮菜单同步成导航标题
			async loadMenuData() {
				try {
					const res = await getMenuList()
					if (res.code === 1000 && res.content) {
						this.menuList = res.content
						if (this.menuList.length > 0) {
							// 默认选中优先级：路由带来的 menuId / name > 菜单 path 匹配当前页 > 第一项
							let defaultIndex = 0
							const presetKey = (this.menuQuery || {}).menuId || (this.menuQuery || {}).id
							if (presetKey) {
								const matched = this.menuList.findIndex(m => String(m.id) === String(presetKey))
								if (matched > -1) defaultIndex = matched
							} else if ((this.menuQuery || {}).name) {
								const matched = this.menuList.findIndex(m => m.name === this.menuQuery.name)
								if (matched > -1) defaultIndex = matched
							} else {
								const routeMatched = this.menuList.findIndex(m => this.menuBelongsToCurrentPage(m))
								if (routeMatched > -1) defaultIndex = routeMatched
							}
							const defaultMenu = this.menuList[defaultIndex]
							this.activeMenuId = defaultMenu.id
							this.activeName = defaultMenu.name
							if (this.pendingMenu) {
								this.applyMenuSelection(this.pendingMenu)
								this.pendingMenu = null
							}
						}
					}
				} catch (err) {
					console.error('菜单加载失败:', err)
				}
			},

			async loadDashboardData() {
				try {
					const res = await getCompanyFunnel()
					this.dashboardGroups = res?.content || []
				} catch (err) {
					uni.showToast({
						title: err.msg || '接口请求失败',
						icon: 'none'
					})
				}
			},

			formatNumber(num) {
				return Number(num).toLocaleString('en-US')
			},

			getCardColor(index) {
				const colors = ['#22d3ee', '#3b82f6', '#4ade80', '#fbbf24', '#f87171', '#a78bfa']
				return colors[index % colors.length]
			},

			// 卡片进客户列表，from=index 表示按「所属节点」锁定筛选
			onCardClick(item) {
				uni.navigateTo({
					url: `/pages/list/index?type=${encodeURIComponent(item.name)}&name=${encodeURIComponent(item.name)}&from=index`
				})
			},

			getCurrentPath() {
				try {
					const pages = getCurrentPages()
					const current = pages[pages.length - 1]
					return current ? `/${current.route}` : ''
				} catch (e) {
					return ''
				}
			},

			normalizePath(path) {
				const pure = String(path || '').split('?')[0]
				if (!pure) return ''
				return pure.charAt(0) === '/' ? pure : `/${pure}`
			},

			menuBelongsToCurrentPage(menu) {
				const target = this.normalizePath(menu && menu.path)
				if (!target) return false
				return target === this.getCurrentPath()
			},

			onMenuItemClick(item) {
				const targetPath = this.normalizePath(item.path)
				if (!targetPath || targetPath === this.getCurrentPath()) {
					this.activeMenuId = item.id
					this.activeName = item.name
					this.closeDrawer()
					this.loadDashboardData()
					return
				}

				setPendingMenu(item)
				this.closeDrawer()
				setTimeout(() => {
					this.gotoMenuPage(item)
				}, 220)
			},

			// 统一用 redirectTo 替换当前页（不是返回），失败再退回 navigateTo
			gotoMenuPage(item) {
				const sep = String(item.path).includes('?') ? '&' : '?'
				const url = `${item.path}${sep}menuId=${item.id}&id=${item.id}&name=${encodeURIComponent(item.name)}`
				uni.redirectTo({
					url,
					fail: () => {
						uni.navigateTo({ url })
					}
				})
			},

			openDrawer() {
				this.isDrawerOpen = true
			},

			closeDrawer() {
				this.isDrawerOpen = false
			},

			handleLogout() {
				uni.showModal({
					title: '提示',
					content: '确定退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							logout()
							uni.reLaunch({
								url: '/pages/login/index'
							})
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

	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 20;
		background: #ffffff;
		box-shadow: 0 2rpx 12rpx rgba(31, 45, 74, 0.04);
	}

	.navbar__inner {
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24rpx;
	}

	.navbar__menu-btn {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.navbar__menu-icon {
		width: 36rpx;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.navbar__menu-line {
		height: 4rpx;
		border-radius: 2rpx;
		background: #1a2233;
	}

	.navbar__title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.navbar__placeholder {
		width: 64rpx;
	}

	.content {
		padding: 32rpx 32rpx 48rpx;
	}

	.banner {
		position: relative;
		background: linear-gradient(135deg, #2b6cb0 0%, #14b8a6 100%);
		border-radius: 28rpx;
		padding: 48rpx 40rpx;
		margin-bottom: 36rpx;
		box-shadow: 0 20rpx 40rpx rgba(20, 184, 166, 0.25);
		overflow: hidden;
	}

	.banner::after {
		content: '';
		position: absolute;
		top: -60rpx;
		right: -40rpx;
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.08);
	}

	.banner__title {
		display: block;
		font-size: 38rpx;
		font-weight: 600;
		color: #ffffff;
		letter-spacing: 2rpx;
	}

	.banner__sub {
		display: block;
		margin-top: 12rpx;
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
		letter-spacing: 1rpx;
	}

	.dashboard {
		margin-bottom: 32rpx;
	}

	.dashboard__group-title {
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

	.dashboard__cards {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.dashboard__card {
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

	.dashboard__card:active {
		transform: scale(0.97);
		box-shadow: 0 4rpx 12rpx rgba(31, 45, 74, 0.08);
	}

	.dashboard__card-top {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4rpx;
		opacity: 0.8;
	}

	.dashboard__card-flag {
		display: flex;
		justify-content: flex-end;
		min-height: 30rpx;
		margin-bottom: 10rpx;
	}

	.dashboard__card-badge {
		flex-shrink: 0;
		min-width: 30rpx;
		height: 30rpx;
		padding: 0 8rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f43f5e;
		border-radius: 15rpx;
	}

	.dashboard__card-badge-text {
		font-size: 20rpx;
		font-weight: 600;
		color: #ffffff;
		line-height: 1;
	}

	.dashboard__card-head {
		display: flex;
		align-items: center;
		gap: 10rpx;
		margin-bottom: 18rpx;
	}

	.dashboard__card-dot {
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
	}

	.dashboard__card-label {
		flex: 1;
		min-width: 0;
		font-size: 22rpx;
		color: #8a93a6;
		font-weight: 500;
		letter-spacing: 0.5rpx;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.dashboard__card-num {
		display: block;
		font-size: 48rpx;
		font-weight: 700;
		color: #1a2233;
		line-height: 1.1;
		letter-spacing: -0.5rpx;
	}

	.dashboard__card-unit {
		display: block;
		margin-top: 14rpx;
		font-size: 20rpx;
		color: #a8b0be;
		letter-spacing: 0.5rpx;
	}

	.drawer-mask {
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

	.drawer-mask--visible {
		opacity: 1;
		visibility: visible;
	}

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

	.drawer--open {
		transform: translateX(0);
	}

	.drawer__header {
		position: relative;
		padding: 80rpx 40rpx 40rpx;
		background: linear-gradient(135deg, #2b6cb0 0%, #14b8a6 100%);
	}

	.drawer__close {
		position: absolute;
		top: 80rpx;
		right: 32rpx;
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.drawer__close-icon {
		font-size: 32rpx;
		color: rgba(255, 255, 255, 0.9);
	}

	.drawer__logo {
		width: 96rpx;
		height: 96rpx;
		margin-bottom: 20rpx;
	}

	.drawer__brand {
		display: block;
		font-size: 32rpx;
		font-weight: 600;
		color: #ffffff;
	}

	.drawer__slogan {
		display: block;
		margin-top: 8rpx;
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	.drawer__menu {
		flex: 1;
		padding-top: env(safe-area-inset-top);
	}

	.drawer__menu-item {
		display: flex;
		align-items: center;
		padding: 28rpx 32rpx;
	}

	.drawer__menu-item--active {
		background: #f0f7ff;
	}

	.drawer__menu-text {
		font-size: 26rpx;
		color: #1a2233;
		font-weight: 500;
	}

	.drawer__menu-item--active .drawer__menu-text {
		color: #2b6cb0;
		font-weight: 600;
	}

	.drawer__footer {
		padding: 24rpx 40rpx calc(20rpx + env(safe-area-inset-bottom));
		border-top: 1rpx solid #eef1f6;
	}

	.drawer__logout-btn {
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff5f5;
		border-radius: 40rpx;
	}

	.drawer__logout-text {
		font-size: 28rpx;
		color: #e53e3e;
		letter-spacing: 1rpx;
	}
</style>
