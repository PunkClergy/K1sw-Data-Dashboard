<template>
	<!-- 弹窗打开时锁定原生页面滚动，不脱离文档流，避免关闭后回到顶部 -->
	<page-meta :page-style="(showFilter || showFollowUp || showCompanyInfo || showAction) ? 'overflow: hidden;' : ''" />
	<view class="page" :class="{ 'page-locked': showFilter || showFollowUp || showCompanyInfo || showAction }">
		<!-- 自定义导航栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="back-btn" @tap="goBack">
					<view class="back-icon">
						<view class="back-line"></view>
					</view>
				</view>
				<text class="nav-title">{{ pageTitle }}</text>
				<view class="nav-placeholder"></view>
			</view>
		</view>

		<!-- 工具条：筛选 -->
		<view class="toolbar" :style="{ top: (statusBarHeight + 44) + 'px' }">
			<view class="toolbar-left">
				<view class="tool-chip" @tap="showFilter = true">
					<text class="tool-text">筛选</text>
					<view class="tool-arrow"></view>
				</view>
			</view>
			<view class="toolbar-right">
				<text class="result-count">共 {{ total }} 条</text>
			</view>
		</view>

		<!-- 列表内容 -->
		<view class="list" :style="{ paddingTop: (statusBarHeight + 100) + 'px' }">
			<view class="list-card" v-for="item in listData" :key="item.id">
				<!-- 卡片头部：公司名称 -->
				<view class="card-head">
					<view class="head-left">
						<text class="company-name">{{ item.createdate }}</text>
					</view>
					<view class="head-right">
						<text class="more-btn" @tap="openCompanyInfo(item)">更多</text>
					</view>
				</view>

				<!-- 卡片字段：默认重要字段 -->
				<view class="field-grid">
					<view class="field-item full-width">
						<text class="field-value"
							:class="{ 'text-clamp': !item.textExpanded }">{{ item.replycontent || '' }}</text>
					</view>
				</view>
				<view class="card-footer">
					<text class="expand-link" v-if="item.replycontent && item.replycontent.length > 500"
						@tap="item.textExpanded = !item.textExpanded">
						{{ item.textExpanded ? '收起' : '显示详情' }}
					</text>
					<view class="footer-actions">
						<text class="action-link" @tap="openFollowUp(item)">跟进记录</text>
						<view class="mini-btn" @tap="openAction(item)">
							<text class="mini-text">操作</text>
						</view>
					</view>
				</view>
			</view>

			<view class="list-empty" v-if="listData.length === 0">
				<text class="empty-text">暂无数据</text>
			</view>

			<view class="load-more" v-if="listData.length > 0">
				<text class="load-more-text">{{ loading ? '加载中...' : (hasMore ? '上拉加载更多' : '没有更多了') }}</text>
			</view>
		</view>

		<!-- 筛选弹窗 -->
		<view class="filter-mask" :class="{ show: showFilter }" @tap="showFilter = false" @touchmove.stop.prevent>
			<view class="filter-panel" @tap.stop>
				<view class="filter-head">
					<text class="filter-title">筛选</text>
					<text class="filter-close" @tap="showFilter = false">关闭</text>
				</view>
				<scroll-view scroll-y class="filter-body">
					<view class="filter-form">
						<view class="form-row">
							<text class="form-label">公司名称</text>
							<input class="form-input" v-model="filterForm.companyName" placeholder="请输入" />
						</view>
						<view class="form-row">
							<text class="form-label">点评状态</text>
							<view class="chip-group">
								<view class="chip" :class="{ active: filterForm.isReview === '' }" @tap="onReviewedChange('')">全部</view>
								<view class="chip" :class="{ active: filterForm.isReview === 0 }" @tap="onReviewedChange(0)">未点评</view>
								<view class="chip" :class="{ active: filterForm.isReview === 1 }" @tap="onReviewedChange(1)">已点评</view>
							</view>
						</view>
						<view class="form-row">
							<text class="form-label">销售员</text>
							<picker class="form-picker" :range="salesList" @change="onSalesChange">
								<view class="form-picker-value">{{ filterForm.salerName || '请选择' }}</view>
							</picker>
						</view>
						<view class="form-row">
							<text class="form-label">创建时间</text>
							<view class="date-range">
								<picker mode="date" class="form-picker date" @change="onStartDateChange">
									<view class="form-picker-value">{{ filterForm.startDate || '开始日期' }}</view>
								</picker>
								<text class="date-sep">至</text>
								<picker mode="date" class="form-picker date" @change="onEndDateChange">
									<view class="form-picker-value">{{ filterForm.endDate || '结束日期' }}</view>
								</picker>
							</view>
						</view>
					</view>
				</scroll-view>
				<view class="filter-foot">
					<view class="filter-btn reset" @tap="resetFilter">重置</view>
					<view class="filter-btn apply" @tap="applyFilter">确定</view>
				</view>
			</view>

			<!-- 操作弹窗 -->
		</view>

		<!-- 公司详情弹窗 -->
		<view class="info-mask" :class="{ show: showCompanyInfo }" @tap="showCompanyInfo = false"
			@touchmove.stop.prevent>
			<view class="info-panel" @tap.stop>
				<view class="info-header">
					<view class="info-header-bar"></view>
					<view class="info-head">
						<text class="info-title">更多详情</text>
						<view class="info-close-btn" @tap="showCompanyInfo = false">
							<text class="info-close">✕</text>
						</view>
					</view>
				</view>
				<scroll-view scroll-y class="info-body" v-if="companyInfo">
					<view class="info-card">
						<view class="info-card-item">
							<text class="info-label">绑定销售员</text>
							<text class="info-value">{{ companyInfo.salespersonName || '-' }}</text>
						</view>
					</view>
					<view class="info-card">
						<view class="info-card-item">
							<text class="info-label">公司名称</text>
						<text class="info-value copyable" @tap="copyText(companyInfo.name)">{{ companyInfo.name || '-' }}</text>
						</view>
					</view>
					<view class="info-card">
						<view class="info-card-item">
							<text class="info-label">公司介绍</text>
							<text class="info-value">{{ companyInfo.companyprofile || '-' }}</text>
						</view>
					</view>
					<view class="info-card">
						<view class="info-card-item">
							<text class="info-label">知彼2内容</text>
							<text class="info-value">{{ companyInfo.know2 || '-' }}</text>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>

		<!-- 跟进记录弹窗 -->
		<view class="follow-mask" :class="{ show: showFollowUp }" @tap="showFollowUp = false" @touchmove.stop.prevent>
			<view class="follow-panel" @tap.stop>
				<view class="follow-header">
					<view class="follow-header-bar"></view>
					<view class="follow-head">
						<text class="follow-title">沟通记录</text>
						<view class="follow-close-btn" @tap="showFollowUp = false">
							<text class="follow-close">✕</text>
						</view>
					</view>
				</view>

				<scroll-view scroll-y class="follow-history">
					<view class="history-item" v-for="(h, i) in followHistory" :key="i">
						<view class="history-card">
							<view class="history-time-row">
								<view class="history-dot"></view>
								<text class="history-time">{{ h.createdate }}</text>
							</view>
							<text class="history-text">{{ h.replycontent }}</text>
						</view>
					</view>
					<view class="history-empty" v-if="followHistory.length === 0">
						<text class="empty-text">暂无沟通记录</text>
					</view>
				</scroll-view>
			</view>
		</view>

		<!-- 操作弹窗 -->
		<view class="action-mask" :class="{ show: showAction }" @tap="showAction = false" @touchmove.stop.prevent>
			<view class="action-panel" @tap.stop>
				<view class="action-header">
					<view class="action-header-bar"></view>
					<view class="action-head">
						<text class="action-title">记录点评</text>
						<view class="action-close-btn" @tap="showAction = false">
							<text class="action-close">✕</text>
						</view>
					</view>
				</view>
				<view class="action-body">
					<!-- 历史点评记录（点评人 / 时间 / 内容） -->
					<view class="review-card"
						v-if="lastReview.reviewcontent || lastReview.reviewdate || lastReview.reviewman">
						<view class="review-head">
							<text class="review-man">{{ lastReview.reviewman || '未知点评人' }}</text>
							<text class="review-date">{{ lastReview.reviewdate }}</text>
						</view>
						<text class="review-text">{{ lastReview.reviewcontent }}</text>
					</view>

					<textarea class="action-textarea" v-model="actionContent" placeholder="请输入点评内容,如未输入则默认提交【已阅】" />
					<view class="action-foot">
						<view class="action-btn confirm" @tap="submitAction">
							<text class="action-btn-text">提交</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getContactList,
		getMoreContactList,
		getCompanyInfo,
		reviewContact,
		getSellerList
	} from '@/api'
	export default {
		data() {
			return {
				statusBarHeight: 20,
				nodeType: '',
				pageTitle: '节点列表',
				step: '',
				showFilter: false,
				showFollowUp: false,
				salesList: ['宋金亮'],
				filterForm: {
					companyName: '',
					salerName: '',
					startDate: '',
					endDate: '',
					isReview: 0
				},
				currentItem: null,
				followHistory: [],
				listData: [],
				showCompanyInfo: false,
				companyInfo: null,
				showAction: false,
				actionContent: '',
				currentActionItem: null,
				lastReview: {
					reviewcontent: '',
					reviewdate: '',
					reviewman: ''
				},
				page: 1,
				pageSize: 20,
				total: 0,
				hasMore: true,
				loading: false
			}
		},
		onLoad(options) {
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

			this.nodeType = options.type || ''
			this.pageTitle = options.name || '节点列表'
			this.step = options.name || ''
			this.loadData()
			this.loadSellerList()
		},
		onReachBottom() {
			if (this.hasMore && !this.loading) {
				this.page++
				this.loadData(true)
			}
		},
		methods: {
			async loadSellerList() {
				try {
					const res = await getSellerList()
					if (res.code === 1000 && res.content) {
						this.salesList = res.content
					}
				} catch (err) {
					console.error('销售员列表加载失败:', err)
				}
			},
			async loadData(isLoadMore = false, silent = false) {
				if (this.loading) return
				this.loading = true

				if (!isLoadMore) {
					this.page = 1
					this.hasMore = true
					this.total = 0
				}

				try {
					const res = await getContactList({
						page: this.page,
						pageSize: this.pageSize,
						companyName: this.filterForm.companyName,
						startDate: this.filterForm.startDate,
						endDate: this.filterForm.endDate,
						step: this.step,
						salerName: this.filterForm.salerName,
						isReview: this.filterForm.isReview
					}, {
						loading: !isLoadMore && !silent
					})
					if (res.code === 1000) {
						const rows = Array.isArray(res.content) ? res.content : []
						if (isLoadMore) {
							this.listData = [...this.listData, ...rows]
						} else {
							this.listData = rows
						}
						// 总数只在首屏/筛选时写入，翻页加载更多不重复覆盖
						if (!isLoadMore) {
							this.total = Number(res.count) || 0
						}
						// 分页结束判定：优先用总数；后端未返回总数时回退单页长度判断
						if (this.total > 0) {
							this.hasMore = this.listData.length < this.total
						} else {
							this.hasMore = rows.length >= this.pageSize
						}
					}
				} catch (err) {
					console.error('列表加载失败:', err)
					uni.showToast({
						title: err.msg || '接口请求失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},
			resetFilter() {
				this.filterForm = {
					companyName: '',
					salerName: '',
					startDate: '',
					endDate: '',
					isReview: 0
				}
			},
			onSalesChange(e) {
				this.filterForm.salerName = this.salesList[e.detail.value]
			},
			onReviewedChange(val) {
				this.filterForm.isReview = val
			},
			onStartDateChange(e) {
				this.filterForm.startDate = e.detail.value
			},
			onEndDateChange(e) {
				this.filterForm.endDate = e.detail.value
			},
			copyText(text) {
				if (!text || text === '-') {
					uni.showToast({ title: '暂无可复制内容', icon: 'none' })
					return
				}
				uni.setClipboardData({
					data: text,
					success: () => {
						uni.showToast({
							title: '已复制',
							icon: 'none'
						})
					}
				})
			},
			applyFilter() {
				this.showFilter = false
				this.loadData()
			},
			async openFollowUp(item) {
				this.currentItem = item
				this.showFollowUp = true
				try {
					const res = await getMoreContactList({
						orderid: item.orderid,
						type: item.type
					})
					if (res.code === 1000 && res.content) {
						this.followHistory = res.content
					}
				} catch (err) {
					console.error('跟进记录加载失败:', err)
					uni.showToast({
						title: err.msg || '接口请求失败',
						icon: 'none'
					})
				}
			},
			goBack() {
				uni.navigateBack()
			},
			async openCompanyInfo(item) {
				this.showCompanyInfo = true
				try {
					const res = await getCompanyInfo({
						orderid: item.orderid,
						type: item.type
					})
					if (res.code === 1000 && res.content) {
						this.companyInfo = res.content
					}
				} catch (err) {
					console.error('公司详情加载失败:', err)
					uni.showToast({
						title: err.msg || '接口请求失败',
						icon: 'none'
					})
				}
			},
			openAction(item) {
				this.currentActionItem = item
				this.actionContent = ''
				this.lastReview = {
					reviewcontent: item.reviewcontent || '',
					reviewdate: item.reviewdate || '',
					reviewman: item.reviewman || ''
				}
				this.showAction = true
			},
			async submitAction() {
				uni.showModal({
					title: '确认提交',
					content: '确定要提交这条点评吗？',
					confirmText: '确定',
					cancelText: '取消',
					success: async (res) => {
						if (res.confirm) {
							try {
								await reviewContact({
									reviewContent: this.actionContent || '已阅',
									id: this.currentActionItem?.id
								})
								uni.showToast({
									title: '提交成功',
									icon: 'success'
								})
								this.showAction = false
								// 提交成功后静默重新请求主列表，刷新最新状态（不显示加载遮罩）
								this.loadData(false, true)
							} catch (err) {
								console.error('点评提交失败:', err)
								uni.showToast({
									title: err.msg || '接口请求失败',
									icon: 'none'
								})
							}
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

	.page-locked {
		overflow: hidden;
	}

	/* ===== 导航栏 ===== */
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

	.back-btn {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.back-icon {
		width: 32rpx;
		height: 32rpx;
		position: relative;
	}

	.back-line {
		position: absolute;
		top: 50%;
		left: 6rpx;
		width: 20rpx;
		height: 4rpx;
		background: #1a2233;
		transform: translateY(-50%) rotate(45deg);
	}

	.back-line::after {
		content: '';
		position: absolute;
		left: 0;
		top: -6rpx;
		width: 12rpx;
		height: 12rpx;
		border-left: 4rpx solid #1a2233;
		border-bottom: 4rpx solid #1a2233;
		transform: rotate(45deg);
	}

	.nav-title {
		font-size: 38rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.nav-placeholder {
		width: 64rpx;
	}

	/* ===== 工具条 ===== */
	.toolbar {
		position: fixed;
		left: 0;
		right: 0;
		z-index: 15;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 28rpx;
		background: #ffffff;
		box-shadow: 0 4rpx 20rpx rgba(31, 45, 74, 0.06);
	}

	.toolbar-left {
		display: flex;
		gap: 16rpx;
	}

	.tool-chip {
		display: flex;
		align-items: center;
		padding: 16rpx 32rpx;
		background: linear-gradient(135deg, #f0f7ff 0%, #f0fdfa 100%);
		border: 1rpx solid #e0f2fe;
		border-radius: 28rpx;
	}

	.tool-text {
		font-size: 26rpx;
		color: #2b6cb0;
		font-weight: 500;
	}

	.tool-arrow {
		width: 0;
		height: 0;
		border-left: 6rpx solid transparent;
		border-right: 6rpx solid transparent;
		border-top: 8rpx solid #2b6cb0;
		margin-left: 10rpx;
	}

	.result-count {
		font-size: 28rpx;
		color: #8a93a6;
		font-weight: 500;
	}

	.result-count::before {
		content: '·';
		margin-right: 8rpx;
		color: #c8d0dc;
	}

	/* ===== 列表卡片 ===== */
	.list {
		padding: 24rpx 24rpx 48rpx;
	}

	.list-card {
		background: #ffffff;
		border-radius: 20rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(31, 45, 74, 0.05);
	}

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #f0f2f5;
		margin-bottom: 20rpx;
	}

	.head-left {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.company-name {
		font-size: 36rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.more-btn {
		font-size: 26rpx;
		color: #6b7280;
	}

	.status-tag {
		font-size: 26rpx;
		padding: 4rpx 14rpx;
		border-radius: 20rpx;
	}

	.status-tag.ok {
		background: #e6fffa;
		color: #0d9488;
	}

	.status-tag.warn {
		background: #fef3c7;
		color: #d97706;
	}

	.status-tag.off {
		background: #fee2e2;
		color: #dc2626;
	}

	.head-right {
		margin-left: 16rpx;
	}

	.follow-btn-sm {
		padding: 8rpx 16rpx;
		background: #f0f7ff;
		border-radius: 16rpx;
	}

	.follow-btn-text {
		font-size: 28rpx;
		color: #2b6cb0;
	}

	.mini-btn {
		padding: 10rpx 20rpx;
		min-width: 120rpx;
		background: linear-gradient(135deg, #f0f7ff 0%, #f0fdfa 100%);
		border: 1rpx solid #e0f2fe;
		border-radius: 20rpx;
		margin-left: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mini-text {
		font-size: 26rpx;
		color: #2b6cb0;
		font-weight: 500;
	}

	.action-link {
		font-size: 26rpx;
		color: #2b6cb0;
		font-weight: 500;
	}

	.head-arrow {
		margin-left: 16rpx;
	}

	.arrow-line {
		width: 14rpx;
		height: 14rpx;
		border-top: 3rpx solid #c8d0dc;
		border-right: 3rpx solid #c8d0dc;
		transform: rotate(45deg);
	}

	.field-grid {
		display: flex;
		flex-wrap: wrap;
	}

	.field-item {
		width: 50%;
		padding: 10rpx 0;
		box-sizing: border-box;
		padding-right: 16rpx;
	}

	.field-item.full-width {
		width: 100%;
		padding-right: 0;
	}

	.field-label {
		display: block;
		font-size: 26rpx;
		color: #a8b0be;
		margin-bottom: 6rpx;
	}

	.field-value {
		font-size: 28rpx;
		color: #4a5568;
	}

	.ellipsis {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.field-value.link {
		color: #2b6cb0;
	}

	.text-clamp {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
	}

	.card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #f0f2f5;
	}

	.footer-actions {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-left: auto;
	}

	.expand-link {
		font-size: 26rpx;
		color: #2b6cb0;
		font-weight: 500;
	}

	.list-empty {
		padding: 120rpx 0;
		text-align: center;
	}

	.empty-text {
		font-size: 32rpx;
		color: #a8b0be;
	}

	.load-more {
		padding: 30rpx 0;
		text-align: center;
	}

	.load-more-text {
		font-size: 26rpx;
		color: #a8b0be;
	}

	/* ===== 跟进记录弹窗 ===== */
	.follow-mask {
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

	.follow-mask.show {
		opacity: 1;
		visibility: visible;
	}

	.follow-panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 70vh;
		background: #f7f9fd;
		border-radius: 32rpx 32rpx 0 0;
		padding-bottom: env(safe-area-inset-bottom);
		display: flex;
		flex-direction: column;
	}

	.follow-header {
		background: #ffffff;
		border-radius: 32rpx 32rpx 0 0;
		padding-bottom: 20rpx;
	}

	.follow-header-bar {
		width: 64rpx;
		height: 8rpx;
		background: #e2e8f0;
		border-radius: 4rpx;
		margin: 16rpx auto 0;
	}

	.follow-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 32rpx 0;
	}

	.follow-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.follow-close-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f4f6fa;
		border-radius: 50%;
	}

	.follow-close {
		font-size: 28rpx;
		color: #6b7280;
	}

	.follow-body {
		padding: 24rpx 32rpx;
	}

	.form-item {
		margin-bottom: 24rpx;
	}

	.form-label {
		display: block;
		font-size: 30rpx;
		color: #4a5568;
		margin-bottom: 12rpx;
	}

	.form-textarea {
		width: 100%;
		height: 200rpx;
		background: #f4f6fa;
		border-radius: 16rpx;
		padding: 20rpx;
		font-size: 32rpx;
		color: #1a2233;
		box-sizing: border-box;
	}

	.form-input {
		width: 100%;
		height: 80rpx;
		background: #f4f6fa;
		border-radius: 16rpx;
		padding: 0 20rpx;
		font-size: 32rpx;
		color: #1a2233;
		box-sizing: border-box;
	}

	.follow-foot {
		display: flex;
		gap: 20rpx;
		padding: 0 32rpx 32rpx;
	}

	.follow-btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 40rpx;
		font-size: 34rpx;
		border: none;
	}

	.follow-btn.cancel {
		background: #f0f2f5;
		color: #4a5568;
	}

	.follow-btn.submit {
		background: linear-gradient(135deg, #2b6cb0 0%, #14b8a6 100%);
		color: #ffffff;
	}

	.follow-btn::after {
		border: none;
	}

	/* ===== 跟进记录弹窗内容 ===== */
	.follow-history {
		width: 96%;
		height: calc(70vh - 120rpx);
		padding: 24rpx 15rpx;
	}

	.history-item {
		margin-bottom: 16rpx;
	}

	.history-card {
		background: #ffffff;
		border-radius: 20rpx;
		padding: 24rpx;
	}

	.history-time-row {
		display: flex;
		align-items: center;
		margin-bottom: 12rpx;
	}

	.history-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: #2b6cb0;
		margin-right: 12rpx;
		flex-shrink: 0;
	}

	.history-time {
		font-size: 24rpx;
		color: #9ca3af;
		font-weight: 500;
	}

	.history-text {
		font-size: 30rpx;
		color: #1a2233;
		line-height: 1.6;
		word-break: break-all;
		overflow-wrap: break-word;
	}

	.history-empty {
		padding: 60rpx 0;
		text-align: center;
	}

	/* ===== 操作弹窗 ===== */
	.action-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 30;
		opacity: 0;
		visibility: hidden;
		transition: all 0.25s;
	}

	.action-mask.show {
		opacity: 1;
		visibility: visible;
	}

	.action-panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		min-height: 50vh;
		background: #f7f9fd;
		border-radius: 32rpx 32rpx 0 0;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.action-header {
		background: #ffffff;
		border-radius: 32rpx 32rpx 0 0;
		padding-bottom: 20rpx;
	}

	.action-header-bar {
		width: 64rpx;
		height: 8rpx;
		background: #e2e8f0;
		border-radius: 4rpx;
		margin: 16rpx auto 0;
	}

	.action-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 32rpx 0;
	}

	.action-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.action-close-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f4f6fa;
		border-radius: 50%;
	}

	.action-close {
		font-size: 28rpx;
		color: #6b7280;
	}

	.review-card {
		background: #ffffff;
		border: 1rpx solid #e2e8f0;
		border-radius: 20rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
	}

	.review-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12rpx;
	}

	.review-man {
		font-size: 28rpx;
		color: #2b6cb0;
		font-weight: 600;
	}

	.review-date {
		font-size: 24rpx;
		color: #9ca3af;
	}

	.review-text {
		font-size: 30rpx;
		color: #1a2233;
		line-height: 1.6;
		word-break: break-all;
		overflow-wrap: break-word;
	}

	.action-body {
		padding: 24rpx;
	}

	.action-textarea {
		width: 100%;
		height: 32vh;
		background: #ffffff;
		border: 1rpx solid #e2e8f0;
		border-radius: 20rpx;
		padding: 24rpx;
		font-size: 30rpx;
		color: #1a2233;
		box-sizing: border-box;
	}

	.action-foot {
		display: flex;
		gap: 20rpx;
		margin-top: 32rpx;
	}

	.action-btn {
		flex: 1;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 44rpx;
	}

	.action-btn.cancel {
		background: #ffffff;
		border: 1rpx solid #e2e8f0;
	}

	.action-btn.confirm {
		background: linear-gradient(135deg, #2b6cb0 0%, #14b8a6 100%);
		box-shadow: 0 8rpx 20rpx rgba(43, 108, 176, 0.25);
	}

	.action-btn-text {
		font-size: 32rpx;
		font-weight: 500;
	}

	.action-btn.cancel .action-btn-text {
		color: #6b7280;
	}

	.action-btn.confirm .action-btn-text {
		color: #ffffff;
	}

	/* ===== 公司详情弹窗 ===== */
	.info-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 30;
		opacity: 0;
		visibility: hidden;
		transition: all 0.25s;
	}

	.info-mask.show {
		opacity: 1;
		visibility: visible;
	}

	.info-panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 70vh;
		background: #f7f9fd;
		border-radius: 32rpx 32rpx 0 0;
		padding-bottom: env(safe-area-inset-bottom);
		display: flex;
		flex-direction: column;
	}

	.info-header {
		background: #ffffff;
		border-radius: 32rpx 32rpx 0 0;
		padding-bottom: 20rpx;
	}

	.info-header-bar {
		width: 64rpx;
		height: 8rpx;
		background: #e2e8f0;
		border-radius: 4rpx;
		margin: 16rpx auto 0;
	}

	.info-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 32rpx 0;
	}

	.info-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.info-close-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f4f6fa;
		border-radius: 50%;
	}

	.info-close {
		font-size: 28rpx;
		color: #6b7280;
	}

	.info-body {
		width: 96%;
		height: calc(70vh - 120rpx);
		padding: 24rpx 15rpx;
	}

	.info-card {
		background: #ffffff;
		border-radius: 20rpx;
		padding: 24rpx;
		margin-bottom: 16rpx;
	}

	.info-card-item {
		display: flex;
		flex-direction: column;
	}

	.info-label {
		font-size: 24rpx;
		color: #9ca3af;
		margin-bottom: 10rpx;
		font-weight: 500;
	}

	.info-value {
		font-size: 30rpx;
		color: #1a2233;
		line-height: 1.6;
		word-break: break-all;
	}

	.copyable {
		color: #2b6cb0;
		cursor: pointer;
	}

	/* ===== 筛选弹窗 ===== */
	.filter-mask {
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

	.filter-mask.show {
		opacity: 1;
		visibility: visible;
	}

	.filter-panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 70vh;
		background: #ffffff;
		border-radius: 28rpx 28rpx 0 0;
		padding-bottom: env(safe-area-inset-bottom);
		display: flex;
		flex-direction: column;
	}

	.filter-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 32rpx 24rpx;
		border-bottom: 1rpx solid #f0f2f5;
	}

	.filter-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.filter-close {
		font-size: 32rpx;
		color: #2b6cb0;
		min-width: 80rpx;
		text-align: right;
	}

	.filter-body {
		height: 55vh;
		padding: 32rpx 28rpx;
		box-sizing: border-box;
		overflow: hidden;
	}

	.filter-form {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.form-row {
		display: flex;
		align-items: center;
		background: #ffffff;
		border-radius: 16rpx;
		padding: 20rpx 24rpx;
		border: 1rpx solid #eef1f5;
	}

	.form-label {
		width: 150rpx;
		font-size: 28rpx;
		color: #64748b;
		font-weight: 500;
		flex-shrink: 0;
	}

	.form-input {
		flex: 1;
		width: 100%;
		height: 72rpx;
		background: #f8fafc;
		border: 1rpx solid #e2e8f0;
		border-radius: 10rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		color: #1e293b;
		box-sizing: border-box;
		min-width: 0;
	}

	.form-picker {
		flex: 1;
		min-width: 0;
	}

	.form-picker-value {
		height: 72rpx;
		line-height: 72rpx;
		background: #f8fafc;
		border: 1rpx solid #e2e8f0;
		border-radius: 10rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		color: #1e293b;
		box-sizing: border-box;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.date-range {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 10rpx;
		min-width: 0;
	}

	.date-sep {
		font-size: 26rpx;
		color: #94a3b8;
		flex-shrink: 0;
	}

	.chip-group {
		flex: 1;
		display: flex;
		gap: 16rpx;
		min-width: 0;
	}

	.chip {
		flex: 1;
		height: 64rpx;
		line-height: 64rpx;
		text-align: center;
		font-size: 26rpx;
		color: #64748b;
		background: #f8fafc;
		border: 1rpx solid #e2e8f0;
		border-radius: 10rpx;
		box-sizing: border-box;
	}

	.chip.active {
		color: #ffffff;
		background: linear-gradient(135deg, #2b6cb0 0%, #14b8a6 100%);
		border-color: transparent;
		font-weight: 500;
	}

	.date {
		flex: 1;
		min-width: 0;
		overflow: hidden;
	}

	.filter-foot {
		display: flex;
		gap: 20rpx;
		padding: 0 32rpx 32rpx;
	}

	.filter-btn {
		flex: 1;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 40rpx;
		font-size: 34rpx;
	}

	.filter-btn.reset {
		background: #f0f2f5;
		color: #4a5568;
	}

	.filter-btn.apply {
		background: linear-gradient(135deg, #2b6cb0 0%, #14b8a6 100%);
		color: #ffffff;
	}
</style>
