import * as vscode from 'vscode'
import { CacheEntry } from './types'

/** 30 天过期时间 */
export const CACHE_EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000

/** 翻译缓存 Map：hash → CacheEntry */
export let translationCache = new Map<string, CacheEntry>()

/** 防抖保存缓存 */
let saveDebounced: (() => void) | null = null

/**
 * 初始化缓存，并从 globalState 恢复
 * @param context Extension 上下文
 */
export function initCache(context: vscode.ExtensionContext) {
  const savedCache = context.globalState.get<Record<string, CacheEntry>>('translationCache', {})
  translationCache = new Map(Object.entries(savedCache))

  saveDebounced = (() => {
    let timer: NodeJS.Timeout | null = null
    return () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        context.globalState.update('translationCache', Object.fromEntries(translationCache))
      }, 500)
    }
  })()
}

/**
 * 保存缓存（自动防抖）
 */
export function saveCache() {
  saveDebounced?.()
}

/**
 * 判断缓存是否有效
 */
export function isCacheValid(entry: CacheEntry | undefined): boolean {
  return !!(entry && Date.now() - entry.time < CACHE_EXPIRE_TIME)
}
