import * as vscode from 'vscode'
import { openCacheView } from './views/cacheView'
import { forceRetranslate } from './translation'
import { md5 } from './utils'

/** 当前是否显示翻译内容 */
let showTranslated = true

/**
 * 获取当前是否显示翻译内容的状态
 * @returns 是否显示翻译内容
 */
export function getShowTranslated(): boolean {
  return showTranslated
}

/**
 * 设置是否显示翻译内容的状态
 * @param value 新的状态值
 */
export function setShowTranslated(value: boolean): void {
  showTranslated = value
}

/**
 * 注册所有命令
 */
export function registerCommands(context: vscode.ExtensionContext) {
  showTranslated = context.globalState.get('showTranslated', true)

  /** 切换显示模式 */
  const toggleMode = vscode.commands.registerCommand('hoverTranslator.toggleMode', () => {
    showTranslated = !showTranslated
    context.globalState.update('showTranslated', showTranslated)
    vscode.window.showInformationMessage(`🐾 已${showTranslated ? '启用' : '禁用'}悬浮翻译～`)
  })

  /** 强制重新翻译 */
  const retranslate = vscode.commands.registerCommand(
    'hoverTranslator.retranslate',
    async (encoded: string) => {
      if (!encoded) return
      const original = Buffer.from(encoded, 'base64').toString('utf-8')
      const hash = md5(original)

      await forceRetranslate(original, hash)

      vscode.commands.executeCommand('editor.action.showHover')
    }
  )

  const showCache = vscode.commands.registerCommand(
    'hoverTranslator.showCache',
    () => openCacheView(context)
  )

  context.subscriptions.push(toggleMode, retranslate, showCache)
}
