// 跨页菜单意图：抽屉跳转后目标页 onLoad 参数可能丢失，用它一次性传递待选中菜单
let pendingMenu = null

export function setPendingMenu(menu) {
	pendingMenu = menu ? {
		id: menu.id,
		name: menu.name
	} : null
}

export function takePendingMenu() {
	const menu = pendingMenu
	pendingMenu = null
	return menu
}
