import * as vscode from 'vscode'
import { md5 } from './utils'
import { translationCache, isCacheValid, saveCache } from './cache'
import { translateText } from './translation'
import { showTranslated } from './commands'

/** 防止 hover 递归触发的小锁 */
let hoverLock = false

/** 正在翻译中的 hash */
const translating = new Set<string>()

/**
 * 创建 Hover Provider
 */
export function createHoverProvider() {
  return vscode.languages.registerHoverProvider({ scheme: 'file' }, {
    async provideHover(document, position) {
      if (hoverLock) return
      hoverLock = true

      try {
        const raw = await vscode.commands.executeCommand<vscode.Hover[]>(
          'vscode.executeHoverProvider',
          document.uri,
          position
        )
        if (!raw || raw.length === 0) return

        const original = raw
          .map(h => h.contents.map(c => (c as vscode.MarkdownString).value ?? String(c)).join('\n'))
          .join('\n\n')

        const hash = md5(original)
        const encoded = Buffer.from(original, 'utf-8').toString('base64')

        const entry = translationCache.get(hash)
        const valid = isCacheValid(entry)

        const md = new vscode.MarkdownString(undefined, true)
        md.isTrusted = true

        // 工具栏
        if (showTranslated) {
          md.appendMarkdown(
            `✨ **悬浮文档翻译** &nbsp;&nbsp;👉 ` +
            `[禁用翻译](command:hoverTranslator.toggleMode) | ` +
            `[重新翻译](command:hoverTranslator.retranslate?${encodeURIComponent(JSON.stringify([encoded]))})`
          )
        } else {
          md.appendMarkdown(
            `✨ **悬浮文档翻译** &nbsp;&nbsp;👉 ` +
            `[开启翻译](command:hoverTranslator.toggleMode)`
          )
          return new vscode.Hover(md)
        }

        // 如果有缓存
        if (valid) {
          md.appendMarkdown('\n\n' + entry!.text)
          return new vscode.Hover(md)
        }

        // 没有缓存 → 显示“翻译中”
        md.appendMarkdown('\n\n⌛ **翻译中，请稍候...**')

        if (!translating.has(hash)) {
          translating.add(hash)

          translateText(original).then(result => {
            translating.delete(hash)

            translationCache.set(hash, {
              original,
              text: result,
              time: Date.now()
            })
            saveCache()

            vscode.commands.executeCommand('editor.action.showHover')
          }).catch(() => translating.delete(hash))
        }

        return new vscode.Hover(md)
      } finally {
        hoverLock = false
      }
    }
  })
}
