// mock/customer.js
// 客户列表模拟数据（基于真实接口结构）

export const mockFollowUpHistory = {
	37402: [
		{ time: '2026-11-02 11:28', content: '已发送开发信，等待回复' },
		{ time: '2026-11-01 14:30', content: '补充公司信息，获取联系人列表' }
	],
	37720: [
		{ time: '2026-11-03 11:58', content: '发送了Whatsapp' },
		{ time: '2026-11-02 13:04', content: '已发送开发信，等待回复' }
	],
	37526: [
		{ time: '2026-11-02 11:35', content: '已发送开发信，等待回复' }
	],
	37816: [
		{ time: '2026-11-03 12:20', content: '发送了Whatsapp' },
		{ time: '2026-11-02 13:04', content: '已发送开发信，等待回复' }
	],
	36882: [
		{ time: '2026-11-02 10:52', content: '已发送开发信，等待回复' }
	]
}

export const mockCustomerList = [
	{
		id: 37402,
		companyname: 'Mandurah City Removals',
		attrModel: '默认模型',
		website: 'https://www.mandurahcityremovals.com.au',
		country: 'Australia',
		countrycode: 'AU',
		channel: '补全客户',
		followstatus: '已跟进',
		followuser: 'Wiselink',
		followtime: '2026-11-02 11:28:32',
		taskType: '补全任务',
		discoverytime: '2026-11-02 11:28:32',
		address: 'Mandurah, Western Australia',
		email: 'mymail@mailservice.com',
		linkmobile: '08 9515 7000, 555) 555-5555',
		companysize: '',
		numberofcontacts: '3',
		linkedin: 'https://www.linkedin.com/company/mandurah-city-removals-105544968461499/',
		whatsapp: 'https://wa.me/(555) 555-5555',
		level: 'Level-1',
		salepersonName: '荀子翔',
		replyCount: 0,
		crmSzImproveContactList: [
			{ id: 743322, linkman: 'Official Email', job: '', email: '', linkin: '', mobile: '' },
			{ id: 743324, linkman: 'Official Phone Number', job: '', email: '', linkin: '', mobile: '555) 555-5555' },
			{ id: 743326, linkman: 'Official Phone Number', job: '', email: '', linkin: '', mobile: '+61 8 9515 7000' }
		]
	},
	{
		id: 37720,
		companyname: 'UREL',
		website: 'https://urel.com.au',
		country: 'Australia',
		countrycode: 'AU',
		channel: '补全客户',
		followstatus: '已跟进',
		followuser: 'Wiselink',
		followtime: '2026-11-02 13:04:24',
		taskType: '补全任务',
		address: '2 Collings Street, Pearce 2607, ACT, Australia',
		email: '',
		linkmobile: '+61 478 326 267',
		numberofcontacts: '1',
		linkedin: '',
		whatsapp: '0478 326 267',
		level: 'Level-1',
		salepersonName: '于雅泽',
		replyCount: 1,
		lastReplyContent: '[11-03]发送了Whatsapp',
		lastContactDate: '2026-11-03 11:58:16',
		crmSzImproveContactList: [
			{ id: 709966, linkman: 'Official Phone Number', job: '', email: '', linkin: '', mobile: '+61 478 326 267' }
		]
	},
	{
		id: 37526,
		companyname: 'Paramount Software Pty Ltd',
		website: 'https://crucialtracking.com.au',
		country: 'Australia',
		countrycode: 'AU',
		channel: '补全客户',
		followstatus: '已跟进',
		followuser: 'Wiselink',
		followtime: '2026-11-02 11:35:23',
		taskType: '补全任务',
		address: '1 Possum Glade, Beeliar WA 6164, Australia',
		email: 'team@crucialtracking.com.au',
		linkmobile: '+61413418743',
		numberofcontacts: '2',
		linkedin: '',
		whatsapp: 'https://wa.me/61413418743',
		level: 'Level-1',
		salepersonName: '荀子翔',
		replyCount: 0,
		crmSzImproveContactList: [
			{ id: 698440, linkman: 'Official Email', job: '', email: '', linkin: '', mobile: '' },
			{ id: 698442, linkman: 'Official Phone Number', job: '', email: '', linkin: '', mobile: '+61 413 418 743' }
		]
	},
	{
		id: 37816,
		companyname: 'Skyline Cars',
		website: 'https://www.skylinecars.com.au',
		country: 'Australia',
		countrycode: 'AU',
		channel: '补全客户',
		followstatus: '已跟进',
		followuser: 'Wiselink',
		followtime: '2026-11-02 13:04:24',
		taskType: '补全任务',
		address: '342 Hobart Road, Youngtown TAS 7249',
		email: '',
		linkmobile: '0482 057 846, 0482 039 941',
		numberofcontacts: '2',
		linkedin: '',
		facebook: 'https://www.facebook.com/Skylinecarslaunceston',
		instagram: 'https://www.instagram.com/skylinecars.au',
		whatsapp: 'https://wa.me/0482057846',
		level: 'Level-1',
		salepersonName: '于雅泽',
		replyCount: 1,
		lastReplyContent: '[11-03]发送了Whatsapp',
		lastContactDate: '2026-11-03 12:20:38',
		crmSzImproveContactList: [
			{ id: 710086, linkman: 'Official Phone Number', job: '', email: '', linkin: '', mobile: '+61 482 057 846' },
			{ id: 710088, linkman: 'Official Phone Number', job: '', email: '', linkin: '', mobile: '+61 482 039 941' }
		]
	},
	{
		id: 36882,
		companyname: 'AVIATION FLEET SUPPORT CORPORATION',
		website: 'https://aviationfleetsupport.com',
		country: 'Australia',
		countrycode: 'AU',
		channel: '补全客户',
		followstatus: '已跟进',
		followuser: 'Wiselink',
		followtime: '2026-11-02 10:52:24',
		taskType: '补全任务',
		address: 'Suite 1008, Level 1, 241 Adelaide Street, Brisbane, Queensland',
		email: 'sales@aviationfleetsupport.com',
		linkmobile: '+61 422 125 986',
		companysize: '4',
		numberofcontacts: '5',
		linkedin: 'http://www.linkedin.com/company/aviation-fleet-support-corporation',
		whatsapp: '+61 422 125 986',
		level: 'Level-1',
		salepersonName: '刘天贵',
		replyCount: 0,
		crmSzImproveContactList: [
			{ id: 742788, linkman: 'Jay Marcell', job: 'Power Plant Manager', email: '', linkin: 'https://www.linkedin.com/in/jay-marcell-afsc', mobile: '' },
			{ id: 742790, linkman: 'Harry Argent', job: 'Project Manager', email: 'harry.argent@aviationfleetsupport.com', linkin: 'https://www.linkedin.com/in/harry-argent-9529a5233', mobile: '' },
			{ id: 742792, linkman: 'Dean Argent', job: 'Commercial Manager', email: 'dean.argent@aviationfleetsupport.com', linkin: '', mobile: '' },
			{ id: 742794, linkman: 'Official Email', job: '', email: '', linkin: '', mobile: '' },
			{ id: 742796, linkman: 'Official Phone Number', job: '', email: '', linkin: '', mobile: '+61 422 125 986' }
		]
	}
]
