import { createHash } from 'crypto'

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
