<template>
	<view class="page">
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

		<!-- 工具条：筛选 + 列设置 -->
		<view class="toolbar" :style="{ top: (statusBarHeight + 44) + 'px' }">
			<view class="toolbar-left">
				<view class="tool-chip" @tap="showFilter = true">
					<text class="tool-text">筛选</text>
					<view class="tool-arrow"></view>
				</view>
				<view class="tool-chip" @tap="showColSetting = true">
					<text class="tool-text">列设置</text>
				</view>
			</view>
			<view class="toolbar-right">
				<text class="result-count">共 {{ listData.length }} 条</text>
			</view>
		</view>

		<!-- 列表内容 -->
		<view class="list" :style="{ paddingTop: (statusBarHeight + 100) + 'px' }">
			<view class="list-card" v-for="item in listData" :key="item.id">
				<!-- 卡片头部：公司名称 + 状态 -->
				<view class="card-head">
					<view class="head-left">
						<text class="company-name">{{ item.company }}</text>
					</view>
					<view class="head-right">
						<view class="mini-btn" @tap="openFollowUp(item)">
							<text class="mini-text">跟进记录</text>
						</view>
					</view>
				</view>

				<!-- 卡片字段：默认重要字段 -->
				<!-- 默认显示：销售人员、最新联络、国家、信息渠道 -->
				<view class="field-grid">
					<view class="field-item">
						<text class="field-label">销售人员</text>
						<text class="field-value">{{ item.sales }}</text>
					</view>
					<view class="field-item">
						<text class="field-label">最新联络</text>
						<text class="field-value">{{ item.lastContact }}</text>
					</view>
					<view class="field-item">
						<text class="field-label">国家</text>
						<text class="field-value">{{ item.country }}</text>
					</view>
					<view class="field-item">
						<text class="field-label">信息渠道</text>
						<text class="field-value">{{ item.channel }}</text>
					</view>
				</view>

				<!-- 展开：列设置对应的字段 -->
				<view class="field-grid" v-if="item.expanded">
					<view class="field-item" v-for="f in getVisibleFields(item)" :key="f.key"
						:class="{ 'full-width': isLong(f.value) }">
						<text class="field-label">{{ f.label }}</text>
						<text class="field-value ellipsis" :class="{ link: f.copyable }"
							@tap="f.copyable ? copyText(f.value) : null">{{ f.value }}</text>
					</view>
				</view>

				<!-- 展开/收起 -->
				<view class="expand-bar">
					<view class="expand-left" @tap="toggleExpand(item)">
						<text class="expand-text">{{ item.expanded ? '收起' : '展开详情' }}</text>
						<view class="expand-arrow" :class="{ up: item.expanded }"></view>
					</view>
					<view class="expand-right">
						<text class="contact-link-text" @tap="openContacts(item)">联系人</text>
						<text class="action-link-text" @tap="openActions(item)">操作</text>
					</view>
				</view>
			</view>

			<view class="list-empty" v-if="listData.length === 0">
				<text class="empty-text">暂无数据</text>
			</view>
		</view>

		<!-- 列设置弹窗 -->
		<view class="col-mask" :class="{ show: showColSetting }" @tap="showColSetting = false" @touchmove.stop.prevent>
			<view class="col-panel" @tap.stop>
				<view class="col-panel-head">
					<text class="col-panel-title">列显示设置</text>
					<text class="col-close" @tap="showColSetting = false">关闭</text>
				</view>
				<scroll-view scroll-y class="col-list">
					<view class="col-grid">
						<view class="col-item" v-for="col in allColumns" :key="col.key" @tap="toggleCol(col.key)">
							<view class="checkbox" :class="{ checked: visibleCols.includes(col.key) }">
								<view class="check-mark" v-if="visibleCols.includes(col.key)"></view>
							</view>
							<text class="col-name">{{ col.name }}</text>
						</view>
					</view>
				</scroll-view>
				<view class="col-foot">
					<view class="col-btn reset" @tap="resetCols">重置</view>
					<view class="col-btn apply" @tap="applyCols">确定</view>
				</view>
			</view>
		</view>

		<!-- 操作菜单弹窗 -->
		<view class="action-mask" :class="{ show: showActions }" @tap="showActions = false" @touchmove.stop.prevent>
			<view class="action-panel" @tap.stop>
				<view class="action-head">
					<text class="action-title">{{ currentItem ? currentItem.company : '' }} - 操作</text>
					<text class="action-close" @tap="showActions = false">关闭</text>
				</view>
				<view class="action-grid">
					<view class="action-item" v-for="act in actionList" :key="act" @tap="doAction(act)">
						<text class="action-item-text">{{ act }}</text>
					</view>
				</view>
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
							<input class="form-input" v-model="filterForm.company" placeholder="请输入" />
						</view>
						<view class="form-row">
							<text class="form-label">电话</text>
							<input class="form-input" v-model="filterForm.phone" placeholder="请输入" />
						</view>
						<view class="form-row">
							<text class="form-label">销售员</text>
							<picker class="form-picker" :range="salesList" @change="onSalesChange">
								<view class="form-picker-value">{{ filterForm.sales || '请选择' }}</view>
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
						<view class="form-row">
							<text class="form-label">跟进状态</text>
							<input class="form-input" v-model="filterForm.followStatus" placeholder="请输入" />
						</view>
						<view class="form-row">
							<text class="form-label">等级</text>
							<picker class="form-picker" :range="levelList" @change="onLevelChange">
								<view class="form-picker-value">{{ filterForm.level || '请选择' }}</view>
							</picker>
						</view>
						<view class="form-row">
							<text class="form-label">任务类型</text>
							<input class="form-input" v-model="filterForm.taskType" placeholder="请输入" />
						</view>
						<view class="form-row">
							<text class="form-label">邮箱</text>
							<input class="form-input" v-model="filterForm.email" placeholder="请输入" />
						</view>
						<view class="form-row">
							<text class="form-label">领英</text>
							<input class="form-input" v-model="filterForm.linkedin" placeholder="请输入" />
						</view>
						<view class="form-row">
							<text class="form-label">WhatsApp</text>
							<input class="form-input" v-model="filterForm.whatsapp" placeholder="请输入" />
						</view>
					</view>
				</scroll-view>
				<view class="filter-foot">
					<view class="filter-btn reset" @tap="resetFilter">重置</view>
					<view class="filter-btn apply" @tap="applyFilter">确定</view>
				</view>
			</view>
		</view>

		<!-- 跟进记录弹窗 -->
		<view class="follow-mask" :class="{ show: showFollowUp }" @tap="showFollowUp = false" @touchmove.stop.prevent>
			<view class="follow-panel" @tap.stop>
				<view class="follow-head">
					<text class="follow-title">{{ currentItem ? currentItem.company : '' }} - 跟进记录</text>
					<text class="follow-close" @tap="showFollowUp = false">关闭</text>
				</view>

				<scroll-view scroll-y class="follow-history">
					<view class="history-item" v-for="(h, i) in followHistory" :key="i">
						<view class="history-dot"></view>
						<view class="history-body">
							<text class="history-time">{{ h.time }}</text>
							<text class="history-text">{{ h.content }}</text>
						</view>
					</view>
					<view class="history-empty" v-if="followHistory.length === 0">
						<text class="empty-text">暂无跟进记录</text>
					</view>
				</scroll-view>

				<view class="follow-input-bar">
					<textarea class="follow-textarea" v-model="followContent" placeholder="输入跟进内容..." maxlength="500" />
					<view class="send-btn" @tap="submitFollowUp">
						<text class="send-text">发送</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 联系人弹窗 -->
		<view class="contact-mask" :class="{ show: showContacts }" @tap="showContacts = false" @touchmove.stop.prevent>
			<view class="contact-panel" @tap.stop>
				<view class="contact-head">
					<text class="contact-title">{{ currentItem ? currentItem.company : '' }} - 联系人</text>
					<text class="contact-close" @tap="showContacts = false">关闭</text>
				</view>
				<scroll-view scroll-y class="contact-list">
					<view class="contact-item" v-for="(c, i) in contactList" :key="i">
						<view class="contact-avatar">
							<text class="contact-avatar-text">{{ c.name.charAt(0) }}</text>
						</view>
						<view class="contact-body">
							<text class="contact-name">{{ c.name }}</text>
							<view class="contact-row">
								<text class="contact-label">电话</text>
								<text class="contact-value link" @tap="copyText(c.phone)">{{ c.phone }}</text>
							</view>
							<view class="contact-row">
								<text class="contact-label">邮箱</text>
								<text class="contact-value link" @tap="copyText(c.email)">{{ c.email }}</text>
							</view>
							<view class="contact-row">
								<text class="contact-label">领英</text>
								<text class="contact-value link" @tap="copyText(c.linkedin)">{{ c.linkedin }}</text>
							</view>
						</view>
					</view>
					<view class="contact-empty" v-if="contactList.length === 0">
						<text class="empty-text">暂无联系人</text>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getCustomerList
	} from '@/api'
	import {
		mockCustomerList,
		mockFollowUpHistory
	} from '@/mock/customer'
	export default {
		data() {
			return {
				statusBarHeight: 20,
				nodeType: '',
				pageTitle: '节点列表',
				showColSetting: false,
				showFilter: false,
				showActions: false,
				showFollowUp: false,
				showContacts: false,
				actionList: ['编辑', '发送邮件', '转S0触达', '申请转SD', '已发linkin', '已发whatsapp'],
				salesList: ['张伟', '李娜', '王强', '刘洋'],
				levelList: ['Level-1', 'Level-2', 'Level-3', 'Level-4'],
				filterStatus: '',
				filterChannel: '',
				filterForm: {
					company: '',
					phone: '',
					sales: '',
					startDate: '',
					endDate: '',
					followStatus: '',
					level: '',
					taskType: '',
					email: '',
					linkedin: '',
					whatsapp: ''
				},
				currentItem: null,
				followContent: '',
				followHistory: [],
				contactList: [],
				visibleCols: ['company', 'sales', 'lastContact', 'country', 'channel', 'followTime', 'scale', 'email',
					'phone'
				],
				allColumns: [{
						key: 'company',
						name: '公司名称'
					},
					{
						key: 'sales',
						name: '销售人员'
					},
					{
						key: 'lastContact',
						name: '最新联络'
					},

					{
						key: 'website',
						name: '公司网站'
					},
					{
						key: 'country',
						name: '国家'
					},

					{
						key: 'channel',
						name: '信息渠道'
					},

					{
						key: 'followTime',
						name: '跟进时间'
					},

					{
						key: 'remark',
						name: '公司备注'
					},
					{
						key: 'findTime',
						name: '发现时间'
					},
					{
						key: 'intro',
						name: '公司简介'
					},
					{
						key: 'address',
						name: '公司地址'
					},
					{
						key: 'email',
						name: '公司邮箱'
					},
					{
						key: 'phone',
						name: '公司电话'
					},
					{
						key: 'scale',
						name: '公司规模'
					},
					{
						key: 'foundTime',
						name: '公司成立时间'
					},

					{
						key: 'contactCount',
						name: '联系人数量'
					},
					{
						key: 'linkedin',
						name: 'LinkedIn'
					},
					{
						key: 'facebook',
						name: 'Facebook'
					},
					{
						key: 'instagram',
						name: 'Instagram'
					},
					{
						key: 'youtube',
						name: 'YouTube'
					},
					{
						key: 'x',
						name: 'X'
					},
					{
						key: 'line',
						name: 'Line'
					},
					{
						key: 'whatsapp',
						name: 'WhatsApp'
					}
				],
				listData: []
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
			// 从缓存读取列设置
			try {
				const saved = uni.getStorageSync('visibleCols')
				if (saved) {
					this.visibleCols = JSON.parse(saved)
				}
			} catch (e) {}
			this.loadData()
		},
		methods: {
			loadData() {
				this.listData = mockCustomerList.map(item => ({
					id: item.id,
					company: item.companyname,
					status: item.followstatus,
					statusType: 'ok',
					sales: item.salepersonName || '-',
					lastContact: item.followtime ? item.followtime.substring(0, 16) : '-',
					country: item.country || '-',
					channel: item.channel || '-',
					followTime: item.followtime ? item.followtime.substring(0, 16) : '-',
					scale: item.companysize || '-',
					email: item.email || '-',
					phone: item.linkmobile || '-',
					level: item.level || '-',
					website: item.website || '-',
					address: item.address || '-',
					linkedin: item.linkedin || '-',
					whatsapp: item.whatsapp || '-',
					contacts: item.crmSzImproveContactList || [],
					expanded: false
				}))
			},
			toggleCol(key) {
				const idx = this.visibleCols.indexOf(key)
				if (idx > -1) {
					this.visibleCols.splice(idx, 1)
				} else {
					this.visibleCols.push(key)
				}
			},
			resetFilter() {
				this.filterForm = {
					company: '',
					phone: '',
					sales: '',
					startDate: '',
					endDate: '',
					followStatus: '',
					level: '',
					taskType: '',
					email: '',
					linkedin: '',
					whatsapp: ''
				}
			},
			onSalesChange(e) {
				this.filterForm.sales = this.salesList[e.detail.value]
			},
			onLevelChange(e) {
				this.filterForm.level = this.levelList[e.detail.value]
			},
			onStartDateChange(e) {
				this.filterForm.startDate = e.detail.value
			},
			onEndDateChange(e) {
				this.filterForm.endDate = e.detail.value
			},
			copyText(text) {
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
			openActions(item) {
				this.currentItem = item
				this.showActions = true
			},
			doAction(act) {
				uni.showToast({
					title: act,
					icon: 'none'
				})
				this.showActions = false
			},
			resetCols() {
				this.visibleCols = ['company', 'sales', 'lastContact', 'country', 'channel', 'followTime', 'scale',
					'email', 'phone'
				]
			},
			applyCols() {
				uni.setStorageSync('visibleCols', JSON.stringify(this.visibleCols))
				this.showColSetting = false
				uni.showToast({
					title: '列设置已应用',
					icon: 'none'
				})
			},
			applyFilter() {
				this.showFilter = false
				uni.showToast({
					title: '筛选已应用',
					icon: 'none'
				})
			},
			toggleExpand(item) {
				item.expanded = !item.expanded
			},
			isLong(val) {
				return val && val.length > 25
			},
			getVisibleFields(item) {
				const fieldMap = {
					company: {
						label: '公司名称',
						value: item.company
					},
					sales: {
						label: '销售人员',
						value: item.sales
					},
					lastContact: {
						label: '最新联络',
						value: item.lastContact
					},
					country: {
						label: '国家',
						value: item.country
					},
					channel: {
						label: '信息渠道',
						value: item.channel
					},
					followTime: {
						label: '跟进时间',
						value: item.followTime
					},
					scale: {
						label: '公司规模',
						value: item.scale
					},
					email: {
						label: '公司邮箱',
						value: item.email,
						copyable: true
					},
					phone: {
						label: '公司电话',
						value: item.phone,
						copyable: true
					},
					level: {
						label: '等级',
						value: item.level
					},
					website: {
						label: '公司网站',
						value: item.website,
						copyable: true
					},
					address: {
						label: '公司地址',
						value: item.address
					},
					linkedin: {
						label: 'LinkedIn',
						value: item.linkedin,
						copyable: true
					},
					whatsapp: {
						label: 'WhatsApp',
						value: item.whatsapp,
						copyable: true
					}
				}
				// 排除默认显示的4个字段：sales、lastContact、country、channel
				// 排除公司名称：company（卡片头部已显示）
				const excludeKeys = ['sales', 'lastContact', 'country', 'channel', 'company']
				return this.visibleCols
					.filter(key => !excludeKeys.includes(key))
					.map(key => fieldMap[key])
					.filter(f => f && f.value && f.value !== '-')
			},
			openContacts(item) {
				this.currentItem = item
				this.contactList = (item.contacts || []).map(c => ({
					name: c.linkman || '-',
					phone: c.mobile || '-',
					email: c.email || '-',
					linkedin: c.linkin || '-'
				}))
				this.showContacts = true
			},
			openFollowUp(item) {
				this.currentItem = item
				this.followHistory = mockFollowUpHistory[item.id] || []
				this.followContent = ''
				this.showFollowUp = true
			},
			submitFollowUp() {
				if (!this.followContent.trim()) {
					uni.showToast({
						title: '请输入内容',
						icon: 'none'
					})
					return
				}
				const now = new Date()
				const time = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now
					.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now
					.getMinutes()).padStart(2, '0')
				this.followHistory.unshift({
					time,
					content: this.followContent.trim()
				})
				this.followContent = ''
				uni.showToast({
					title: '已发送',
					icon: 'success'
				})
			},
			goBack() {
				uni.navigateBack()
			}
		}
	}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background: linear-gradient(180deg, #f7f9fd 0%, #edf1f7 100%);
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
		font-size: 36rpx;
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
		font-size: 24rpx;
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
		font-size: 26rpx;
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
		font-size: 34rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.status-tag {
		font-size: 24rpx;
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
		font-size: 26rpx;
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
		font-size: 24rpx;
		color: #2b6cb0;
		font-weight: 500;
	}

	.expand-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 16rpx;
		margin-top: 8rpx;
		border-top: 1rpx solid #f0f2f5;
	}

	.expand-left {
		display: flex;
		align-items: center;
	}

	.expand-text {
		font-size: 24rpx;
		color: #2b6cb0;
		font-weight: 500;
		margin-right: 8rpx;
	}

	.expand-arrow {
		width: 12rpx;
		height: 12rpx;
		border-right: 3rpx solid #2b6cb0;
		border-bottom: 3rpx solid #2b6cb0;
		transform: rotate(45deg);
		transition: transform 0.2s;
	}

	.expand-arrow.up {
		transform: rotate(-135deg);
	}

	.contact-link-text {
		font-size: 24rpx;
		color: #2b6cb0;
		font-weight: 500;
	}

	.action-link-text {
		font-size: 24rpx;
		color: #2b6cb0;
		font-weight: 500;
		margin-left: 24rpx;
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
		font-size: 24rpx;
		color: #a8b0be;
		margin-bottom: 6rpx;
	}

	.field-value {
		font-size: 26rpx;
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

	.list-empty {
		padding: 120rpx 0;
		text-align: center;
	}

	.empty-text {
		font-size: 30rpx;
		color: #a8b0be;
	}

	/* ===== 列设置弹窗 ===== */
	.col-mask {
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

	.col-mask.show {
		opacity: 1;
		visibility: visible;
	}

	.col-panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 70vh;
		background: #ffffff;
		border-radius: 28rpx 28rpx 0 0;
		display: flex;
		flex-direction: column;
	}

	.col-panel-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 32rpx 24rpx;
		border-bottom: 1rpx solid #f0f2f5;
	}

	.col-panel-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.col-close {
		font-size: 30rpx;
		color: #2b6cb0;
		font-weight: 500;
		min-width: 80rpx;
		text-align: right;
	}

	.col-list {
		height: 55vh;
		padding: 16rpx 32rpx 48rpx;
	}

	.col-grid {
		display: flex;
		flex-wrap: wrap;
	}

	.col-item {
		width: 33.33%;
		display: flex;
		align-items: center;
		padding: 16rpx 0;
	}

	.checkbox {
		width: 32rpx;
		height: 32rpx;
		border: 2rpx solid #c8d0dc;
		border-radius: 8rpx;
		margin-right: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.checkbox.checked {
		background: #2b6cb0;
		border-color: #2b6cb0;
	}

	.check-mark {
		width: 16rpx;
		height: 10rpx;
		border-left: 4rpx solid #ffffff;
		border-bottom: 4rpx solid #ffffff;
		transform: rotate(-45deg) translate(2rpx, -2rpx);
	}

	.col-name {
		font-size: 28rpx;
		color: #4a5568;
	}

	.col-foot {
		display: flex;
		gap: 20rpx;
		padding: 20rpx 32rpx calc(32rpx + env(safe-area-inset-bottom));
		border-top: 1rpx solid #f0f2f5;
	}

	.col-btn {
		flex: 1;
		height: 84rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 42rpx;
		font-size: 30rpx;
	}

	.col-btn.reset {
		background: #f0f2f5;
		color: #4a5568;
	}

	.col-btn.apply {
		background: linear-gradient(135deg, #2b6cb0 0%, #14b8a6 100%);
		color: #ffffff;
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
		background: #ffffff;
		border-radius: 28rpx 28rpx 0 0;
		padding-bottom: env(safe-area-inset-bottom);
		display: flex;
		flex-direction: column;
	}

	.follow-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 32rpx 24rpx;
		border-bottom: 1rpx solid #f0f2f5;
	}

	.follow-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.follow-close {
		font-size: 30rpx;
		color: #2b6cb0;
		min-width: 80rpx;
		text-align: right;
	}

	.follow-body {
		padding: 24rpx 32rpx;
	}

	.form-item {
		margin-bottom: 24rpx;
	}

	.form-label {
		display: block;
		font-size: 28rpx;
		color: #4a5568;
		margin-bottom: 12rpx;
	}

	.form-textarea {
		width: 100%;
		height: 200rpx;
		background: #f4f6fa;
		border-radius: 16rpx;
		padding: 20rpx;
		font-size: 30rpx;
		color: #1a2233;
		box-sizing: border-box;
	}

	.form-input {
		width: 100%;
		height: 80rpx;
		background: #f4f6fa;
		border-radius: 16rpx;
		padding: 0 20rpx;
		font-size: 30rpx;
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
		font-size: 32rpx;
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
		height: 40vh;
		padding: 24rpx 32rpx;
	}

	.follow-panel {
		height: 75vh;
		max-height: 75vh;
	}

	.history-item {
		display: flex;
		margin-bottom: 24rpx;
	}

	.history-dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
		background: #2b6cb0;
		margin-right: 16rpx;
		margin-top: 8rpx;
		flex-shrink: 0;
	}

	.history-body {
		flex: 1;
	}

	.history-time {
		display: block;
		font-size: 24rpx;
		color: #a8b0be;
		margin-bottom: 6rpx;
	}

	.history-text {
		font-size: 30rpx;
		color: #1a2233;
		line-height: 1.5;
	}

	.history-empty {
		padding: 60rpx 0;
		text-align: center;
	}

	.follow-input-bar {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
		border-top: 1rpx solid #f0f2f5;
	}

	.follow-textarea {
		width: 100%;
		min-height: 120rpx;
		max-height: 240rpx;
		background: #f4f6fa;
		border-radius: 20rpx;
		padding: 16rpx 20rpx;
		font-size: 30rpx;
		color: #1a2233;
		box-sizing: border-box;
	}

	.send-btn {
		width: 100%;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #2b6cb0 0%, #14b8a6 100%);
		border-radius: 40rpx;
	}

	.send-text {
		font-size: 30rpx;
		color: #ffffff;
		font-weight: 500;
	}

	/* ===== 联系人弹窗 ===== */
	.contact-mask {
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

	.contact-mask.show {
		opacity: 1;
		visibility: visible;
	}

	.contact-panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 70vh;
		background: #ffffff;
		border-radius: 28rpx 28rpx 0 0;
		display: flex;
		flex-direction: column;
	}

	.contact-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 32rpx 24rpx;
		border-bottom: 1rpx solid #f0f2f5;
	}

	.contact-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.contact-close {
		font-size: 30rpx;
		color: #2b6cb0;
		min-width: 80rpx;
		text-align: right;
	}

	.contact-list {
		height: 55vh;
		padding: 16rpx 32rpx 32rpx;
	}

	.contact-panel {
		height: auto;
		max-height: 70vh;
	}

	.contact-item {
		display: flex;
		padding: 32rpx 0;
		border-bottom: 1rpx solid #f0f2f5;
	}

	.contact-avatar {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #2b6cb0 0%, #14b8a6 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
		flex-shrink: 0;
	}

	.contact-avatar-text {
		font-size: 40rpx;
		font-weight: 600;
		color: #ffffff;
	}

	.contact-body {
		flex: 1;
	}

	.contact-name {
		display: block;
		font-size: 34rpx;
		font-weight: 600;
		color: #1a2233;
		margin-bottom: 20rpx;
	}

	.contact-row {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.contact-label {
		width: 80rpx;
		font-size: 28rpx;
		color: #a8b0be;
	}

	.contact-value {
		flex: 1;
		font-size: 30rpx;
		color: #4a5568;
	}

	.contact-value.link {
		color: #2b6cb0;
	}

	.copy-btn {
		display: none;
	}

	.copy-text {
		display: none;
	}

	.contact-empty {
		padding: 60rpx 0;
		text-align: center;
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
		font-size: 34rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.filter-close {
		font-size: 30rpx;
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
		font-size: 26rpx;
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
		font-size: 26rpx;
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
		font-size: 26rpx;
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
		font-size: 24rpx;
		color: #94a3b8;
		flex-shrink: 0;
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
		font-size: 32rpx;
	}

	.filter-btn.reset {
		background: #f0f2f5;
		color: #4a5568;
	}

	.filter-btn.apply {
		background: linear-gradient(135deg, #2b6cb0 0%, #14b8a6 100%);
		color: #ffffff;
	}

	/* ===== 操作菜单弹窗 ===== */
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
		transition: opacity 0.3s, visibility 0.3s;
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
		background: #ffffff;
		border-radius: 28rpx 28rpx 0 0;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.action-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 32rpx 24rpx;
		border-bottom: 1rpx solid #f0f2f5;
	}

	.action-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #1a2233;
	}

	.action-close {
		font-size: 30rpx;
		color: #2b6cb0;
		min-width: 80rpx;
		text-align: right;
	}

	.action-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 24rpx 32rpx 48rpx;
	}

	.action-item {
		width: 33.33%;
		padding: 24rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-item-text {
		font-size: 24rpx;
		color: #2b6cb0;
	}
</style>
