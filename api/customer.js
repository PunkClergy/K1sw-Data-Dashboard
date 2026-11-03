// api/customer.js
// 客户列表相关接口
import { http } from '@/utils/request/http'

// 获取客户列表
// params: { nodeType, page, pageSize, company, phone, sales, startDate, endDate, followStatus, level, taskType, email, linkedin, whatsapp }
export const getCustomerList = (params) => http.get('/api/customer/list', params)
