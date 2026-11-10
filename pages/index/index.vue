<template>
	<view class="page">
		<!-- 顶部导航栏 -->
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

		<!-- 主内容区 -->
		<view class="content" :style="{ paddingTop: (statusBarHeight + 56) + 'px' }">
			<!-- 欢迎横幅 -->
			<view class="banner">
				<text class="banner__title">{{activeName}}</text>
				<text class="banner__sub">只统计当前账号名下的客户</text>
			</view>

			<!-- 看板分组卡片 -->
			<view class="dashboard" v-for="group in dashboardGroups" :key="group.name">
				<text class="dashboard__group-title">{{ group.name }}</text>
				<view class="dashboard__cards">
					<view class="dashboard__card" v-for="(item, idx) in group.value" :key="item.name"
						@tap="onCardClick(item)">
						<view class="dashboard__card-top" :style="{ background: getCardColor(idx) }"></view>
						<!-- 卡片第一行：未读徽标单独成行，靠右 -->
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

		<!-- 抽屉遮罩层 -->
		<view class="drawer-mask" :class="{ 'drawer-mask--visible': isDrawerOpen }" @tap="closeDrawer"
			@touchmove.stop.prevent></view>

		<!-- 左侧抽屉导航 -->
		<view class="drawer" :class="{ 'drawer--open': isDrawerOpen }">
			<!-- 抽屉头部品牌区 -->
			<view class="drawer__header">
				<view class="drawer__close" @tap="closeDrawer">
					<text class="drawer__close-icon">✕</text>
				</view>
				<image class="drawer__logo" src="/static/images/logo.png" mode="aspectFit"></image>
				<text class="drawer__brand">Wiselink K1SW</text>
				<text class="drawer__slogan">Fleet Digital Key</text>
			</view>

			<!-- 抽屉菜单列表 -->
			<scroll-view scroll-y class="drawer__menu">
				<view class="drawer__menu-item" v-for="item in menuList" :key="item.id"
					:class="{ 'drawer__menu-item--active': activeMenuId === item.id }" @tap="onMenuItemClick(item)">
					<text class="drawer__menu-text">{{ item.name }}</text>
				</view>
			</scroll-view>

			<!-- 抽屉底部退出登录按钮 -->
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
			// 头部标题取当前选中菜单名，菜单未返回时用品牌名兜底
			navTitle() {
				return this.activeName || this.appTitle
			}
		},
		onLoad(options) {
			// 记录菜单跳转带过来的目标菜单，用于对齐左侧抽屉的选中项
			// 小程序端不会自动解码路由参数，先还原再参与 name 比对
			this.menuQuery = options || {}
			this.menuQuery.name = this.decodeQueryValue(this.menuQuery.name)
			this.initStatusBarHeight()
			this.loadMenuData()
		},
		onShow() {
			this.checkLoginStatus()
			// 从别的看板页回退/跳转过来时，对齐抽屉选中态
			this.consumePendingMenu()
			// 每次进入本页都重新查询看板数据（首屏也走这里，不依赖菜单接口是否已返回）
			this.loadDashboardData()
		},
		methods: {
			// 路由参数兜底解码：只对含 % 的值解码，避免 H5 已自动解码时二次解码
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
			// 初始化状态栏高度
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

			// 登录守卫校验
			checkLoginStatus() {
				if (!isLoggedIn()) {
					uni.reLaunch({
						url: '/pages/login/index'
					})
				}
			},

			// 消费“刚点过的菜单”：跳转/回退到本页后把选中态对齐到那条菜单
			consumePendingMenu() {
				const pending = takePendingMenu()
				if (!pending) return
				this.pendingMenu = pending
				// 菜单还没加载完就先记下，等 loadMenuData 结束后再对齐
				if (this.menuList.length > 0) {
					this.applyMenuSelection(pending)
				}
			},

			// 按菜单对象对齐选中态（id 可能来自 URL 字符串，统一转字符串比较）
			applyMenuSelection(menu) {
				if (!menu) return
				const matched = this.menuList.find(m => String(m.id) === String(menu.id))
				if (!matched) return
				this.activeMenuId = matched.id
				this.activeName = matched.name
			},

			// 加载菜单列表
			async loadMenuData() {
				try {
					const res = await getMenuList()
					if (res.code === 1000 && res.content) {
						this.menuList = res.content
						// 默认选中第一条菜单；若从抽屉菜单跳转而来，优先对齐带过来的那条菜单
						// 只做高亮 + 拉取看板，不触发跳转（避免进入页面就被自动跳走）
						if (this.menuList.length > 0) {
							let defaultIndex = 0
							const presetKey = (this.menuQuery || {}).menuId || (this.menuQuery || {}).id
							if (presetKey) {
								const matched = this.menuList.findIndex(m => String(m.id) === String(presetKey))
								if (matched > -1) defaultIndex = matched
							} else if ((this.menuQuery || {}).name) {
								const matched = this.menuList.findIndex(m => m.name === this.menuQuery.name)
								if (matched > -1) defaultIndex = matched
							} else {
								// 无跳转参数时，优先选真正指向当前页面的菜单，保证“选中 = 当前页”
								const routeMatched = this.menuList.findIndex(m => this.menuBelongsToCurrentPage(m))
								if (routeMatched > -1) defaultIndex = routeMatched
							}
							const defaultMenu = this.menuList[defaultIndex]
							this.activeMenuId = defaultMenu.id
							this.activeName = defaultMenu.name
							// 若期间收到过“点击意图”，以它为准（刚点击的那条菜单优先）
							if (this.pendingMenu) {
								this.applyMenuSelection(this.pendingMenu)
								this.pendingMenu = null
							}
							// 看板数据统一由 onShow 拉取，这里不再重复请求
						}
					}
				} catch (err) {
					console.error('菜单加载失败:', err)
				}
			},

			// 加载看板漏斗数据
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

			// 数字格式化（千分位）
			formatNumber(num) {
				return Number(num).toLocaleString('en-US')
			},

			// 卡片颜色循环取值
			getCardColor(index) {
				const colors = ['#22d3ee', '#3b82f6', '#4ade80', '#fbbf24', '#f87171', '#a78bfa']
				return colors[index % colors.length]
			},

			// 卡片点击跳转列表页
			// from=index → 列表页把 name 作为 step（节点类型）查询参数
			onCardClick(item) {
				uni.navigateTo({
					url: `/pages/list/index?type=${encodeURIComponent(item.name)}&name=${encodeURIComponent(item.name)}&from=index`
				})
			},

			// 取当前页面路由（带前导斜杠），用于判断菜单是否指向自己
			getCurrentPath() {
				try {
					const pages = getCurrentPages()
					const current = pages[pages.length - 1]
					return current ? `/${current.route}` : ''
				} catch (e) {
					return ''
				}
			},

			// 路由归一化：去参数、补齐前导斜杠（菜单里的 path 可能写成 pages/xxx 不带斜杠）
			normalizePath(path) {
				const pure = String(path || '').split('?')[0]
				if (!pure) return ''
				return pure.charAt(0) === '/' ? pure : `/${pure}`
			},

			// 判断某条菜单的 path 是否指向当前页面
			menuBelongsToCurrentPage(menu) {
				const target = this.normalizePath(menu && menu.path)
				if (!target) return false
				return target === this.getCurrentPath()
			},

			// 菜单点击
			onMenuItemClick(item) {
				const targetPath = this.normalizePath(item.path)
				// 无 path 或指向当前页面：关抽屉 + 原地刷新看板，选中态就地跟随点击
				if (!targetPath || targetPath === this.getCurrentPath()) {
					this.activeMenuId = item.id
					this.activeName = item.name
					this.closeDrawer()
					this.loadDashboardData()
					return
				}

				// 跨页：把“点了哪条菜单”交给目标页，等抽屉动画走完再跳
				// 注意不要在本页先改选中态，否则回退到本页时会残留错误的选中项
				setPendingMenu(item)
				this.closeDrawer()
				setTimeout(() => {
					this.gotoMenuPage(item)
				}, 220)
			},

			// 菜单跳转：统一用 redirectTo —— 目标是新建实例还是栈里已有实例，表现一致，页面栈不增长
			gotoMenuPage(item) {
				const sep = String(item.path).includes('?') ? '&' : '?'
				const url = `${item.path}${sep}menuId=${item.id}&id=${item.id}&name=${encodeURIComponent(item.name)}`
				uni.redirectTo({
					url,
					fail: () => {
						// 个别端对 redirectTo 有限制（如目标是 tabBar 页）时兜底为 navigateTo
						uni.navigateTo({ url })
					}
				})
			},

			// 打开抽屉
			openDrawer() {
				this.isDrawerOpen = true
			},

			// 关闭抽屉
			closeDrawer() {
				this.isDrawerOpen = false
			},

			// 退出登录
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

	/* ===== 顶部导航栏 ===== */
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

	/* ===== 主内容区 ===== */
	.content {
		padding: 32rpx 32rpx 48rpx;
	}

	/* ===== 欢迎横幅 ===== */
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

	/* ===== 看板分组卡片 ===== */
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

	/* 卡片第一行：未读徽标独占一行，靠右对齐 */
	.dashboard__card-flag {
		display: flex;
		justify-content: flex-end;
		min-height: 30rpx;
		margin-bottom: 10rpx;
	}

	/* 未读数量徽标：胶囊样式 */
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

	/* ===== 抽屉遮罩层 ===== */
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

	/* ===== 左侧抽屉导航 ===== */
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
