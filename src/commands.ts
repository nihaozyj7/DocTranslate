import * as vscode from 'vscode'
import { openCacheView } from './views/cacheView'
import { forceRetranslate } from './translation'
import { md5 } from './utils'

/** 当前是否显示翻译内容 */
export let showTranslated = true

/**
 * 注册所有命令
 */
export function registerCommands(context: vscode.ExtensionContext) {
  showTranslated = context.globalState.get('showTranslated', true)

  /** 切换显示模式 */
  const toggleMode = vscode.commands.registerCommand('hoverTranslator.toggleMode', () => {
    showTranslated = !showTranslated
    context.globalState.update('showTranslated', showTranslated)
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
