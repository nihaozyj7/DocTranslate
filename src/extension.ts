import * as vscode from 'vscode'
import { initCache } from './cache'
import { registerCommands } from './commands'
import { createHoverProvider } from './hoverProvider'

/**
 * 插件激活入口
 * 初始化缓存、注册命令和创建悬停翻译提供者
 * @param context VSCode 扩展上下文
 * @returns 插件导出对象，包含插件停用方法
 */
export function activate(context: vscode.ExtensionContext) {
	// 初始化翻译缓存系统
	initCache(context)

	// 注册所有命令（切换模式、重新翻译、查看缓存等）
	registerCommands(context)

	// 获取启动延迟配置（确保翻译内容始终显示在悬浮提示的最顶部）
	const config = vscode.workspace.getConfiguration('hoverTranslator')
	const startupDelay = config.get<number>('startupDelay', 5000)

	// 延迟注册悬停提供者以确保正确显示位置
	setTimeout(() => {
		const hoverProvider = createHoverProvider()
		context.subscriptions.push(hoverProvider)

		console.log('🐾 hoverTranslator: 插件已启动')
	}, startupDelay)

	// 返回扩展对象
	return {
		// 插件停用时的清理函数
		deactivate
	};
}

/**
 * 插件停用
 * 清理资源和缓存
 */
export function deactivate() {
	console.log('🐾 hoverTranslator: 插件已停用');
}
