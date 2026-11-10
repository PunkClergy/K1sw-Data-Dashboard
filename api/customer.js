// api/customer.js
// 客户列表相关接口
import { http } from '@/utils/request/http'

// 获取菜单列表
export const getMenuList = () => http.get('/k1swMenuApi/menulist')

// 获取公司漏斗数据
export const getCompanyFunnel = () => http.get('/reportApi/companyFunnel')

// ===== 派工页专用接口 =====
// 菜单接口 k1swMenuApi/menulist 为首页/派工页公用，直接复用 getMenuList
// 看板数据不复用首页的 getCompanyFunnel，单独定义 getDispatchFunnel，两页各自维护

// 派工页 - 看板数据（派工专用路径 /reportApi/dispatchWork）
export const getDispatchFunnel = () => http.get('/reportApi/dispatchWork')

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

// 获取节点列表（客户列表页筛选「所属节点」下拉数据）
export const getStepList = () => http.get('/contaceApi/stepList')
