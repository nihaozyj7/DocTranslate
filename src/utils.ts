import { createHash } from 'crypto'
import * as vscode from 'vscode'

/**
 * 计算 MD5 值
 * @param str 输入字符串
 * @returns md5 哈希值
 */
export function md5(str: string): string {
  return createHash('md5').update(str, 'utf-8').digest('hex')
}

/**
 * 创建一个防抖函数
 * @param fn 需要防抖执行的函数
 * @param delay 延迟时间
 */
export function debounce(fn: () => void, delay: number) {
  let timer: NodeJS.Timeout | null = null
  return () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(), delay)
  }
}

/**
 * 获取文档上下文
 * @param document 文档对象
 * @param position 光标位置
 * @param contextLines 上下文行数
 * @param maxContextLength 最大上下文长度
 * @returns 上下文字符串
 */
export function getContextAround(
  document: vscode.TextDocument,
  position: vscode.Position,
  contextLines: number,
  maxContextLength: number
): string {
  const startLine = Math.max(0, position.line - contextLines)
  const endLine = Math.min(document.lineCount - 1, position.line + contextLines)

  let contextLinesArray: string[] = []
  for (let i = startLine; i <= endLine; i++) {
    const lineText = document.lineAt(i).text
    contextLinesArray.push(lineText)
  }

  let context = contextLinesArray.join('\n')

  // 如果上下文长度超过限制，进行截断
  if (context.length > maxContextLength) {
    context = context.substring(0, maxContextLength) + '...'
  }

  return context
}
