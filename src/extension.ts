import * as vscode from 'vscode'
import { initCache } from './cache'
import { registerCommands } from './commands'
import { createHoverProvider } from './hoverProvider'

/**
 * 插件激活入口
 */
export function activate(context: vscode.ExtensionContext) {
	initCache(context)
	registerCommands(context)

	const config = vscode.workspace.getConfiguration('hoverTranslator')
	const startupDelay = config.get<number>('startupDelay', 5000)

	setTimeout(() => {
		const hoverProvider = createHoverProvider()
		context.subscriptions.push(hoverProvider)

		console.log('🐾 hoverTranslator: 插件已启动')
	}, startupDelay)
}

/**
 * 插件停用
 */
export function deactivate() { }
