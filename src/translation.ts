import * as vscode from 'vscode'
import { CacheEntry } from './types'
import { translationCache, saveCache } from './cache'

/**
 * 获取翻译配置
 */
export function getTranslationConfig() {
  const config = vscode.workspace.getConfiguration('hoverTranslator')
  return {
    baseURL: config.get<string>('baseURL', ''),
    apiKey: config.get<string>('apiKey', ''),
    model: config.get<string>('model', ''),
    promptTemplate: config.get<string>('promptTemplate', '请将以下文本翻译为中文：\n${content}')
  }
}

/**
 * 翻译文本（含错误处理）
 */
export async function translateText(text: string): Promise<string> {
  const { baseURL, apiKey, model, promptTemplate } = getTranslationConfig()

  if (!baseURL || !apiKey) {
    return '❌ **未配置翻译接口**\n请在设置中填写 `baseURL` 和 `apiKey`。'
  }

  const prompt = promptTemplate.replace('${content}', text)

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
      })
    })

    if (!res.ok) {
      return `❌ **翻译请求失败（HTTP ${res.status}）**`
    }

    const data: any = await res.json()
    const content = data.choices?.[0]?.message?.content?.trim()

    vscode.window.showInformationMessage('🐾 翻译完成，请重新悬停查看结果～')

    return content || '⚠️ 服务未返回内容'
  } catch (err) {
    return `❌ **翻译失败**：${String(err)}`
  }
}

/**
 * 重新翻译文本（覆盖缓存）
 */
export async function forceRetranslate(original: string, hash: string) {
  const result = await translateText(original)

  const entry: CacheEntry = {
    original,
    text: result,
    time: Date.now()
  }

  translationCache.set(hash, entry)
  saveCache()
}
