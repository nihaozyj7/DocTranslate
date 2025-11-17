import * as assert from 'assert'
import { CacheEntry } from '../src/types'
import {
  CACHE_EXPIRE_TIME,
  MAX_CACHE_SIZE,
  translationCache,
  allowShowTranslated,
  initCache,
  saveCache,
  isCacheValid,
  clearExpiredCache
} from '../src/cache'

// Mock VSCode ExtensionContext for testing
class MockExtensionContext {
  globalState: { get: (key: string, defaultValue?: any) => any; update: (key: string, value: any) => Promise<void> } = {
    get: (key: string, defaultValue: any = undefined) => {
      return (this as any).globalStateData[key] !== undefined ? (this as any).globalStateData[key] : defaultValue
    },
    update: async (key: string, value: any) => {
      (this as any).globalStateData[key] = value
    }
  }
  private globalStateData: { [key: string]: any } = {}

  async updateGlobalState(key: string, value: any) {
    this.globalStateData[key] = value
  }
}

suite('Cache Test Suite', () => {
  setup(() => {
    // Reset cache before each test
    translationCache.clear()
    allowShowTranslated.splice(0, allowShowTranslated.length)
  })

  test('isCacheValid should return true for non-expired entries', () => {
    const validTime = Date.now() - 1000 // 1 second ago
    const entry: CacheEntry = {
      original: 'test',
      text: 'translation',
      time: validTime
    }
    
    const result = isCacheValid(entry)
    assert.strictEqual(result, true)
  })

  test('isCacheValid should return false for expired entries', () => {
    const expiredTime = Date.now() - (CACHE_EXPIRE_TIME + 1000) // Well past expiration
    const entry: CacheEntry = {
      original: 'test',
      text: 'translation',
      time: expiredTime
    }
    
    const result = isCacheValid(entry)
    assert.strictEqual(result, false)
  })

  test('isCacheValid should return false for undefined entry', () => {
    const result = isCacheValid(undefined)
    assert.strictEqual(result, false)
  })

  test('clearExpiredCache should remove expired entries', () => {
    // Add an expired entry
    const expiredTime = Date.now() - (CACHE_EXPIRE_TIME + 1000)
    const expiredEntry: CacheEntry = {
      original: 'expired',
      text: 'expired translation',
      time: expiredTime
    }
    translationCache.set('expired-hash', expiredEntry)

    // Add a valid entry
    const validTime = Date.now() - 1000
    const validEntry: CacheEntry = {
      original: 'valid',
      text: 'valid translation',
      time: validTime
    }
    translationCache.set('valid-hash', validEntry)

    clearExpiredCache()

    assert.strictEqual(translationCache.has('expired-hash'), false)
    assert.strictEqual(translationCache.has('valid-hash'), true)
  })

  test('clearExpiredCache should remove oldest entries when exceeding max size', () => {
    const entriesToAdd = MAX_CACHE_SIZE + 5;

    // Fill cache with more entries than max size
    for (let i = 0; i < entriesToAdd; i++) {
      // Create entries with increasing timestamps (older first)
      const time = Date.now() - (entriesToAdd - i) * 1000; // Earlier timestamps = older entries
      const entry: CacheEntry = {
        original: `text-${i}`,
        text: `translation-${i}`,
        time
      }
      translationCache.set(`hash-${i}`, entry)
    }

    clearExpiredCache()

    // Should only keep the most recent entries (MAX_CACHE_SIZE)
    assert.strictEqual(translationCache.size, MAX_CACHE_SIZE)

    // The oldest entries (with lower indices) should be removed
    // Entries with indices 0 to (entriesToAdd - MAX_CACHE_SIZE - 1) should be deleted
    const entriesToRemove = entriesToAdd - MAX_CACHE_SIZE; // = 5
    for (let i = 0; i < entriesToRemove; i++) {
      assert.strictEqual(translationCache.has(`hash-${i}`), false) // Oldest
    }
    // The most recent entries (with higher indices) should remain
    for (let i = entriesToRemove; i < entriesToAdd; i++) {
      assert.strictEqual(translationCache.has(`hash-${i}`), true) // Newest
    }
  })

  test('clearExpiredCache should clear expired entries', () => {
    // Add an expired entry
    const expiredTime = Date.now() - (CACHE_EXPIRE_TIME + 1000)
    const expiredEntry: CacheEntry = {
      original: 'expired',
      text: 'expired translation',
      time: expiredTime
    }
    translationCache.set('expired-hash', expiredEntry)
    
    clearExpiredCache()
    
    assert.strictEqual(translationCache.has('expired-hash'), false)
  })

  test('initCache should initialize from globalState', async () => {
    const mockContext = new MockExtensionContext()
    const testCache = {
      'test-hash': {
        original: 'test',
        text: 'translation',
        time: Date.now()
      } as CacheEntry
    }
    await mockContext.updateGlobalState('translationCache', testCache)

    initCache(mockContext as any)

    assert.strictEqual(translationCache.size, 1)
    assert.strictEqual(translationCache.has('test-hash'), true)
  })

  test('initCache should handle empty globalState', async () => {
    const mockContext = new MockExtensionContext()

    initCache(mockContext as any)

    assert.strictEqual(translationCache.size, 0)
  })
})