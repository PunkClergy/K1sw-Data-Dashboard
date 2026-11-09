// api/customer.js
// 客户列表相关接口
import { http } from '@/utils/request/http'

// 获取菜单列表
export const getMenuList = () => http.get('/k1swMenuApi/menulist')

// 获取公司漏斗数据
export const getCompanyFunnel = () => http.get('/reportApi/companyFunnel')

// ===== 派工页专用接口 =====
// 菜单接口 k1swMenuApi/menulist 为首页/派工页公用，直接复用 getMenuList

// 派工页 - 看板数据（暂时沿用首页接口，后端给出真实路径后只改这一行）
export const getDispatchFunnel = () => http.get('/reportApi/companyFunnel')

// 获取联系人列表
// params: { page, pageSize, companyName, startDate, endDate, step, salerName }
export const getContactList = (params) => http.get('/contaceApi/contactList', params)

// 获取跟进记录详情
// params: { orderid, type }
export const getMoreContactList = (params) => http.get('/contaceApi/moreContactList', params)

// 获取公司详情
// params: { orderid, type }
export const getCompanyInfo = (params) => http.get('/contaceApi/companyInfo', params)

// 提交点评
// data: { reviewContent, orderid, type }
export const reviewContact = (data) => http.postFormData('/contaceApi/reviewContact', data)

// 标记客户已读（点卡片上的「已读」按钮触发）
// data: { id }
export const readContact = (data) => http.postFormData('/contaceApi/readContact', data)

// 获取销售员列表
export const getSellerList = () => http.get('/contaceApi/personList')

// ===== 派工列表页专用接口 =====
// 页面功能与 pages/list 完全一致，接口先沿用同一批路径；
// 后端给出派工专用路径后，只改下面 6 个函数的 url，页面无需改动

// 派工列表 - 联系人列表
// params: { page, pageSize, companyName, startDate, endDate, step, salerName, isReview }
export const getDispatchContactList = (params) => http.get('/contaceApi/contactList', params)

// 派工列表 - 跟进记录详情
export const getDispatchMoreContactList = (params) => http.get('/contaceApi/moreContactList', params)

// 派工列表 - 公司详情
export const getDispatchCompanyInfo = (params) => http.get('/contaceApi/companyInfo', params)

// 派工列表 - 提交点评
export const getDispatchReviewContact = (data) => http.postFormData('/contaceApi/reviewContact', data)

// 派工列表 - 标记已读
export const getDispatchReadContact = (data) => http.postFormData('/contaceApi/readContact', data)

// 派工列表 - 销售员列表
export const getDispatchSellerList = () => http.get('/contaceApi/personList')
