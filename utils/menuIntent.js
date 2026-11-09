// utils/menuIntent.js
// 抽屉菜单“点击意图”中转站
// 场景：点菜单跳到别的看板页（或直接回退到已在栈里的看板页）后，目标页需要把左侧抽屉的选中态对齐到刚点的那条菜单
// 说明：navigateBack 不会重建页面实例、也不会重跑 onLoad，参数带不过去，所以用模块变量做一次性传递
let pendingMenu = null

// 记录本次点击的菜单（只保留 id / name，避免带上无用的字段）
export function setPendingMenu(menu) {
	pendingMenu = menu ? {
		id: menu.id,
		name: menu.name
	} : null
}

// 取出并清空：每次点击只生效一次，避免后续无关的 onShow 被误改
export function takePendingMenu() {
	const menu = pendingMenu
	pendingMenu = null
	return menu
}
