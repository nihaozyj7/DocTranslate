import * as vscode from 'vscode'
import { CacheEntry } from './types'
import { translationCache, saveCache, allowShowTranslated } from './cache'
import { getContextAround } from './utils'

/**
 * 获取翻译配置
 */
export function getTranslationConfig() {
  const config = vscode.workspace.getConfiguration('hoverTranslator')
  return {
    baseURL: config.get<string>('baseURL', ''),
    apiKey: config.get<string>('apiKey', ''),
    model: config.get<string>('model', ''),
    promptTemplate: config.get<string>('promptTemplate', '请将以下文本翻译为中文：\n${content}'),
    /** 手动翻译模式下，保留的翻译结果数量 */
    quantityTranslation: config.get<number>('quantityTranslation', 5),
    /** 是否启用自动翻译功能 */
    autoTranslate: config.get<boolean>('autoTranslate', true),
    /** 是否包含上下文 */
    includeContext: config.get<boolean>('includeContext', false),
    /** 上下文行数 */
    contextLines: config.get<number>('contextLines', 5),
    /** 上下文最大长度 */
    maxContextLength: config.get<number>('maxContextLength', 1000)
  }
}

/**
 * 翻译文本（含错误处理和超时控制）
 * @param text 待翻译的文本
 * @param document 文档对象（可选，用于上下文提取）
 * @param position 光标位置（可选，用于上下文提取）
 * @returns 翻译后的文本或错误信息
 */
export async function translateText(text: string, document?: vscode.TextDocument, position?: vscode.Position): Promise<string> {
  const config = getTranslationConfig()

  const { baseURL, apiKey, model, promptTemplate, includeContext, contextLines, maxContextLength } = config

  if (!baseURL || !apiKey) {
    return '❌ **未配置翻译接口**\n请在设置中填写 `baseURL` 和 `apiKey`。'
  }

  let prompt: string

  // 如果启用了上下文功能且提供了文档和位置参数，则添加上下文
  if (includeContext && document && position) {
    const context = getContextAround(document, position, contextLines, maxContextLength)
    if (context.trim()) {
      // 使用增强的提示词，包含上下文信息
      prompt = `参考上下文：\n\`\`\`\n${context}\n\`\`\`\n\n${promptTemplate.replace('${content}', text)}`
    } else {
      // 如果没有有效上下文，使用原始模板
      prompt = promptTemplate.replace('${content}', text)
    }
  } else {
    // 如果未启用上下文或没有提供文档/位置，使用原始模板
    prompt = promptTemplate.replace('${content}', text)
  }

  // 创建 AbortController 用于请求超时控制
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

  try {
    const res = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: '你是一个编程语言专家，能准确识别声明语法结构并判断其复杂度'
          },
          { role: 'user', content: prompt }
        ]
      }),
      signal: controller.signal // 添加信号以支持超时控制
    })

    clearTimeout(timeoutId) // 请求完成，清除超时定时器

    if (!res.ok) {
      return `❌ **翻译请求失败（HTTP ${res.status}）**`
    }

    const data: any = await res.json()

    // 增强 API 响应的类型检查
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      return '⚠️ **API 响应格式异常**：未找到翻译结果'
    }

    if (!data.choices[0].message || typeof data.choices[0].message.content !== 'string') {
      return '⚠️ **API 响应格式异常**：翻译内容格式不正确'
    }

    const content = data.choices[0].message.content.trim()

    vscode.window.showInformationMessage('🐾 翻译完成，请重新悬停查看结果～')

    return content || '⚠️ 服务未返回内容'
  } catch (err) {
    clearTimeout(timeoutId) // 发生错误，也清除超时定时器

    // 检查是否是超时错误
    if (err instanceof Error && err.name === 'AbortError') {
      return '❌ **翻译请求超时**：请检查网络连接或API服务状态'
    }

    return `❌ **翻译失败**：${String(err)}`
  }
}

/**
 * 重新翻译文本（覆盖缓存）
 */
export async function forceRetranslate(original: string, hash: string, document?: vscode.TextDocument, position?: vscode.Position) {
  const config = getTranslationConfig()
  const result = await translateText(original, document, position)

  const entry: CacheEntry = {
    original,
    text: result,
    time: Date.now()
  }

  const length = allowShowTranslated.unshift(hash)
  // 溢出的翻译不再显示
  if (length > config.quantityTranslation) {
    allowShowTranslated.splice(config.quantityTranslation, length)
  }

  translationCache.set(hash, entry)
  saveCache()
}
