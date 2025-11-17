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
    globalState = {
        get: (key, defaultValue = undefined) => {
            return this.globalStateData[key] !== undefined ? this.globalStateData[key] : defaultValue;
        },
        update: async (key, value) => {
            this.globalStateData[key] = value;
        }
    };
    globalStateData = {};
    async updateGlobalState(key, value) {
        this.globalStateData[key] = value;
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
    test('clearExpiredCache should remove expired entries', () => {
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
        (0, cache_1.clearExpiredCache)();
        assert.strictEqual(cache_1.translationCache.has('expired-hash'), false);
        assert.strictEqual(cache_1.translationCache.has('valid-hash'), true);
    });
    test('clearExpiredCache should remove oldest entries when exceeding max size', () => {
        const entriesToAdd = cache_1.MAX_CACHE_SIZE + 5;
        // Fill cache with more entries than max size
        for (let i = 0; i < entriesToAdd; i++) {
            // Create entries with increasing timestamps (older first)
            const time = Date.now() - (entriesToAdd - i) * 1000; // Earlier timestamps = older entries
            const entry = {
                original: `text-${i}`,
                text: `translation-${i}`,
                time
            };
            cache_1.translationCache.set(`hash-${i}`, entry);
        }
        (0, cache_1.clearExpiredCache)();
        // Should only keep the most recent entries (MAX_CACHE_SIZE)
        assert.strictEqual(cache_1.translationCache.size, cache_1.MAX_CACHE_SIZE);
        // The oldest entries (with lower indices) should be removed
        // Entries with indices 0 to (entriesToAdd - MAX_CACHE_SIZE - 1) should be deleted
        const entriesToRemove = entriesToAdd - cache_1.MAX_CACHE_SIZE; // = 5
        for (let i = 0; i < entriesToRemove; i++) {
            assert.strictEqual(cache_1.translationCache.has(`hash-${i}`), false); // Oldest
        }
        // The most recent entries (with higher indices) should remain
        for (let i = entriesToRemove; i < entriesToAdd; i++) {
            assert.strictEqual(cache_1.translationCache.has(`hash-${i}`), true); // Newest
        }
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
    test('initCache should initialize from globalState', async () => {
        const mockContext = new MockExtensionContext();
        const testCache = {
            'test-hash': {
                original: 'test',
                text: 'translation',
                time: Date.now()
            }
        };
        await mockContext.updateGlobalState('translationCache', testCache);
        (0, cache_1.initCache)(mockContext);
        assert.strictEqual(cache_1.translationCache.size, 1);
        assert.strictEqual(cache_1.translationCache.has('test-hash'), true);
    });
    test('initCache should handle empty globalState', async () => {
        const mockContext = new MockExtensionContext();
        (0, cache_1.initCache)(mockContext);
        assert.strictEqual(cache_1.translationCache.size, 0);
    });
});
//# sourceMappingURL=cache.test.js.map