import * as vscode from 'vscode'
import { openCacheView } from './views/cacheView'
import { forceRetranslate } from './translation'
import { md5 } from './utils'
import { isCacheValid, translationCache, allowShowTranslated } from './cache'
import { getTranslationConfig } from './translation'

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

  /** 翻译（检查缓存后重新翻译或使用缓存） */
  const retranslate = vscode.commands.registerCommand(
    'hoverTranslator.retranslate',
    async (encoded: string) => {
      if (!encoded) return
      const original = Buffer.from(encoded, 'base64').toString('utf-8')
      const hash = md5(original)

      // 检查是否存在有效的缓存
      const cacheEntry = translationCache.get(hash)
      const isValidCache = isCacheValid(cacheEntry)
      const config = getTranslationConfig()

      // 如果是手动翻译模式且存在有效缓存，直接使用缓存而不发起API请求
      if (!config.autoTranslate && isValidCache && cacheEntry) {
        // 更新允许显示翻译的列表
        const length = allowShowTranslated.unshift(hash)
        // 溢出的翻译不再显示
        if (length > config.quantityTranslation) {
          allowShowTranslated.splice(config.quantityTranslation, length)
        }

        // 仅显示缓存结果，不发起API请求
        vscode.commands.executeCommand('editor.action.showHover')
        vscode.window.showInformationMessage(`🐾 使用已有的翻译～`)
        return
      }

      // 尝试获取当前编辑器的文档和位置，用于上下文提取
      const activeEditor = vscode.window.activeTextEditor
      let document = undefined
      let position = undefined

      if (activeEditor) {
        document = activeEditor.document
        position = activeEditor.selection.active // 使用当前光标位置
      }

      // 重新翻译（或首次翻译），尝试使用当前文档上下文
      await forceRetranslate(original, hash, document, position)

      vscode.commands.executeCommand('editor.action.showHover')
    }
  )

  const showCache = vscode.commands.registerCommand(
    'hoverTranslator.showCache',
    () => openCacheView(context)
  )

  context.subscriptions.push(toggleMode, retranslate, showCache)
}
