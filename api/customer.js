// K1SW 业务接口：成功判定 code === 1000，业务数据在 content，总数在 count
import { http } from '@/utils/request/http'

// 左侧抽屉菜单，首页与派工页共用
export const getMenuList = () => http.get('/k1swMenuApi/menulist')

// 首页看板漏斗数据（按节点分组）
export const getCompanyFunnel = () => http.get('/reportApi/companyFunnel')

// 派工页看板数据（按人统计派工 / 回复 / 已读 / 今日完成）
export const getDispatchFunnel = () => http.get('/reportApi/dispatchWork')

// 客户列表分页查询，筛选条件整体透传
export const getContactList = (params) => http.get('/contaceApi/contactList', params)

// 某条客户的沟通记录（跟进记录弹窗）
export const getMoreContactList = (params) => http.get('/contaceApi/moreContactList', params)

// 公司详情（更多弹窗：公司介绍 / 知彼2）
export const getCompanyInfo = (params) => http.get('/contaceApi/companyInfo', params)

// 提交点评，参数走 form-urlencoded
export const reviewContact = (data) => http.postFormData('/contaceApi/reviewContact', data)

// 标记已读，前端同时把该卡片置为已读底色
export const readContact = (data) => http.postFormData('/contaceApi/readContact', data)

// 筛选弹窗的销售员下拉数据
export const getSellerList = () => http.get('/contaceApi/personList')

// 筛选弹窗的所属节点下拉数据
export const getStepList = () => http.get('/contaceApi/stepList')
