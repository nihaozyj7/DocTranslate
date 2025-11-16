/** 缓存条目的结构 */
export interface CacheEntry {
  /** 原文 */
  original: string

  /** 翻译文本或错误提示 */
  text: string

  /** 缓存时间戳 */
  time: number
}
