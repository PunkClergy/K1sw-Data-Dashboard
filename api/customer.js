// api/customer.js
// 客户列表相关接口
import { http } from '@/utils/request/http'

// 获取菜单列表
export const getMenuList = () => http.get('/k1swMenuApi/menulist')

// 获取公司漏斗数据
export const getCompanyFunnel = () => http.get('/reportApi/companyFunnel')

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
// 注意：后端接口名待确认，当前按占位路径 /contaceApi/xxx 提交，确认后只改这一行
export const readContact = () => http.get('/contaceApi/personList')

// 获取销售员列表
export const getSellerList = () => http.get('/contaceApi/personList')
