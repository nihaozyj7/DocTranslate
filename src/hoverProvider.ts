import * as vscode from 'vscode'
import { md5 } from './utils'
import { translationCache, isCacheValid, saveCache, allowShowTranslated } from './cache'
import { getTranslationConfig, translateText } from './translation'
import { getShowTranslated } from './commands'

/** 防止 hover 递归触发的锁，确保同一时间只有一个悬停处理 */
let hoverLock = false

/** 记录正在翻译的文本哈希值，防止重复请求 */
const translating = new Set<string>()

/**
 * 创建 VSCode 悬停翻译提供者
 * 拦截原生悬停内容并在其基础上添加翻译功能
 * @returns VSCode Hover Provider 实例
 */
export function createHoverProvider() {
  return vscode.languages.registerHoverProvider({ scheme: 'file' }, {
    /**
     * 提供悬停内容
     * @param document 文档对象
     * @param position 悬停位置
     * @returns 悬停对象，包含原始内容和翻译功能
     */
    async provideHover(document, position) {
      // 检查防止递归调用的锁
      if (hoverLock) return
      hoverLock = true

      try {
        // 获取 VSCode 原生的悬停内容
        const raw = await vscode.commands.executeCommand<vscode.Hover[]>(
          'vscode.executeHoverProvider',
          document.uri,
          position
        )

        // 如果没有原生悬停内容则返回
        if (!raw || raw.length === 0) return

        // 提取并整合原始悬停文本
        const original = raw
          .map(h => h.contents.map(c => (c as vscode.MarkdownString).value ?? String(c)).join('\n'))
          .join('\n\n')

        // 生成文本的 MD5 哈希值作为缓存键
        const hash = md5(original)
        // 对原文进行 Base64 编码以便在命令中传递
        const encoded = Buffer.from(original, 'utf-8').toString('base64')

        // 检查现有缓存
        const entry = translationCache.get(hash)
        const valid = isCacheValid(entry)

        // 创建新的 Markdown 字符串，用于显示翻译内容
        const md = new vscode.MarkdownString(undefined, true)
        md.isTrusted = true

        // 获取翻译配置
        const config = getTranslationConfig()

        // 添加翻译控制工具栏
        if (getShowTranslated()) {
          md.appendMarkdown(
            `✨ **悬浮文档翻译** &nbsp;&nbsp;👉 ` +
            `[禁用翻译](command:hoverTranslator.toggleMode) | `
          )

          // 用户开启自动翻译时，直接显示翻译结果和重新翻译按钮
          if (config.autoTranslate) {
            md.appendMarkdown(`[重新翻译](command:hoverTranslator.retranslate?${encodeURIComponent(JSON.stringify([encoded]))})`)
          }
          // 用户关闭自动翻译时，在已点击翻译按钮时显示重新翻译按钮
          else if (allowShowTranslated.includes(hash) && translationCache.has(hash)) {
            md.appendMarkdown(`[重新翻译](command:hoverTranslator.retranslate?${encodeURIComponent(JSON.stringify([encoded]))})`)
          }
          // 用户未点击翻译按钮时，只显示翻译按钮
          else {
            md.appendMarkdown(`[翻译](command:hoverTranslator.retranslate?${encodeURIComponent(JSON.stringify([encoded]))})`)
            return new vscode.Hover(md)
          }
        } else {
          // 翻译功能被禁用时，只显示开启翻译按钮
          md.appendMarkdown(
            `✨ **悬浮文档翻译** &nbsp;&nbsp;👉 ` +
            `[开启翻译](command:hoverTranslator.toggleMode)`
          )
          return new vscode.Hover(md)
        }

        // 如果有有效缓存，直接显示缓存内容
        if (valid) {
          md.appendMarkdown('\n\n' + entry!.text)
          return new vscode.Hover(md)
        }

        // 没有缓存时显示"翻译中"提示
        md.appendMarkdown('\n\n⌛ **翻译中，请稍候...**')

        // 防止同一文本重复翻译
        if (!translating.has(hash)) {
          translating.add(hash)

          translateText(original).then(result => {
            translating.delete(hash)

            // 将翻译结果保存到缓存
            translationCache.set(hash, {
              original,
              text: result,
              time: Date.now()
            })
            saveCache()

            // 重新显示悬停框以更新内容
            vscode.commands.executeCommand('editor.action.showHover')
          }).catch(err => {
            console.error('翻译失败:', err)
            translating.delete(hash)
          })
        }

        return new vscode.Hover(md)
      } finally {
        // 确保锁始终被释放
        hoverLock = false
      }
    }
  })
}
