"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.allowShowTranslated = exports.translationCache = exports.MAX_CACHE_SIZE = exports.CACHE_EXPIRE_TIME = void 0
exports.initCache = initCache
exports.saveCache = saveCache
exports.isCacheValid = isCacheValid
exports.clearExpiredCache = clearExpiredCache
/** 30 天过期时间（毫秒） */
exports.CACHE_EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000
/** 最大缓存条目数量，防止内存占用过多 */
exports.MAX_CACHE_SIZE = 1000
/** 翻译缓存 Map：hash → CacheEntry */
exports.translationCache = new Map()
/** 允许显示的翻译，手动模式下开启，该翻译结果不缓存 */
exports.allowShowTranslated = []
/** 防抖保存缓存 */
let saveDebounced = null
/**
 * 清理过期缓存并限制缓存大小
 * 如果缓存数量超过最大限制，则删除最旧的条目
 */
function cleanupCache() {
    const now = Date.now()
    let expiredCount = 0
    let excessCount = 0
    // 首先删除过期条目
    for (const [hash, entry] of exports.translationCache) {
        if (now - entry.time >= exports.CACHE_EXPIRE_TIME) {
            exports.translationCache.delete(hash)
            expiredCount++
        }
    }
    // 如果仍超过最大大小，删除最旧的条目
    if (exports.translationCache.size > exports.MAX_CACHE_SIZE) {
        // 按时间排序，删除最旧的条目
        const entries = Array.from(exports.translationCache.entries())
            .sort((a, b) => a[1].time - b[1].time) // 按时间升序排列
        const excess = exports.translationCache.size - exports.MAX_CACHE_SIZE
        for (let i = 0; i < excess; i++) {
            const [hash] = entries[i]
            exports.translationCache.delete(hash)
            excessCount++
        }
    }
}
/**
 * 初始化缓存，并从 globalState 恢复
 * @param context Extension 上下文
 */
function initCache(context) {
    const savedCache = context.globalState.get('translationCache', {})
    exports.translationCache = new Map(Object.entries(savedCache))
    // 初始化时清理过期和超额的缓存
    cleanupCache()
    saveDebounced = (() => {
        let timer = null
        return () => {
            if (timer)
                clearTimeout(timer)
            timer = setTimeout(() => {
                // 保存前再次清理
                cleanupCache()
                context.globalState.update('translationCache', Object.fromEntries(exports.translationCache))
            }, 500)
        }
    })()
}
/**
 * 保存缓存（自动防抖），并清理过期和超额条目
 */
function saveCache() {
    // 在保存前清理缓存
    cleanupCache()
    saveDebounced?.()
}
/**
 * 判断缓存是否有效（未过期）
 * @param entry 缓存条目
 * @returns 缓存是否有效
 */
function isCacheValid(entry) {
    return !!(entry && Date.now() - entry.time < exports.CACHE_EXPIRE_TIME)
}
/**
 * 手动清理过期和超额缓存
 */
function clearExpiredCache() {
    cleanupCache()
    saveDebounced?.()
}
//# sourceMappingURL=cache.js.map
