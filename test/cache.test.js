"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const cache_1 = require("../src/cache");
// Mock VSCode ExtensionContext for testing
class MockExtensionContext {
    globalState = {};
    getGlobalState(key, defaultValue = undefined) {
        return this.globalState[key] !== undefined ? this.globalState[key] : defaultValue;
    }
    async updateGlobalState(key, value) {
        this.globalState[key] = value;
    }
}
suite('Cache Test Suite', () => {
    setup(() => {
        // Reset cache before each test
        cache_1.translationCache.clear();
        cache_1.allowShowTranslated.splice(0, cache_1.allowShowTranslated.length);
    });
    test('isCacheValid should return true for non-expired entries', () => {
        const validTime = Date.now() - 1000; // 1 second ago
        const entry = {
            original: 'test',
            text: 'translation',
            time: validTime
        };
        const result = (0, cache_1.isCacheValid)(entry);
        assert.strictEqual(result, true);
    });
    test('isCacheValid should return false for expired entries', () => {
        const expiredTime = Date.now() - (cache_1.CACHE_EXPIRE_TIME + 1000); // Well past expiration
        const entry = {
            original: 'test',
            text: 'translation',
            time: expiredTime
        };
        const result = (0, cache_1.isCacheValid)(entry);
        assert.strictEqual(result, false);
    });
    test('isCacheValid should return false for undefined entry', () => {
        const result = (0, cache_1.isCacheValid)(undefined);
        assert.strictEqual(result, false);
    });
    test('cleanupCache should remove expired entries', () => {
        // Add an expired entry
        const expiredTime = Date.now() - (cache_1.CACHE_EXPIRE_TIME + 1000);
        const expiredEntry = {
            original: 'expired',
            text: 'expired translation',
            time: expiredTime
        };
        cache_1.translationCache.set('expired-hash', expiredEntry);
        // Add a valid entry
        const validTime = Date.now() - 1000;
        const validEntry = {
            original: 'valid',
            text: 'valid translation',
            time: validTime
        };
        cache_1.translationCache.set('valid-hash', validEntry);
        (0, cache_1.cleanupCache)();
        assert.strictEqual(cache_1.translationCache.has('expired-hash'), false);
        assert.strictEqual(cache_1.translationCache.has('valid-hash'), true);
    });
    test('cleanupCache should remove oldest entries when exceeding max size', () => {
        // Fill cache with more entries than max size
        for (let i = 0; i < cache_1.MAX_CACHE_SIZE + 5; i++) {
            const time = Date.now() - (1000 * i); // Older entries first
            const entry = {
                original: `text-${i}`,
                text: `translation-${i}`,
                time
            };
            cache_1.translationCache.set(`hash-${i}`, entry);
        }
        (0, cache_1.cleanupCache)();
        // Should only keep the most recent entries (MAX_CACHE_SIZE)
        assert.strictEqual(cache_1.translationCache.size, cache_1.MAX_CACHE_SIZE);
        // The oldest entries should be removed, newest should remain
        assert.strictEqual(cache_1.translationCache.has(`hash-0`), false); // Oldest
        assert.strictEqual(cache_1.translationCache.has(`hash-${cache_1.MAX_CACHE_SIZE - 1}`), true); // Newest
    });
    test('clearExpiredCache should clear expired entries', () => {
        // Add an expired entry
        const expiredTime = Date.now() - (cache_1.CACHE_EXPIRE_TIME + 1000);
        const expiredEntry = {
            original: 'expired',
            text: 'expired translation',
            time: expiredTime
        };
        cache_1.translationCache.set('expired-hash', expiredEntry);
        (0, cache_1.clearExpiredCache)();
        assert.strictEqual(cache_1.translationCache.has('expired-hash'), false);
    });
    test('initCache should initialize from globalState', () => {
        const mockContext = new MockExtensionContext();
        const testCache = {
            'test-hash': {
                original: 'test',
                text: 'translation',
                time: Date.now()
            }
        };
        mockContext.updateGlobalState('translationCache', testCache);
        (0, cache_1.initCache)(mockContext);
        assert.strictEqual(cache_1.translationCache.size, 1);
        assert.strictEqual(cache_1.translationCache.has('test-hash'), true);
    });
    test('initCache should handle empty globalState', () => {
        const mockContext = new MockExtensionContext();
        (0, cache_1.initCache)(mockContext);
        assert.strictEqual(cache_1.translationCache.size, 0);
    });
});
//# sourceMappingURL=cache.test.js.map