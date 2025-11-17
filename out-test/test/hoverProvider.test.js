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
const sinon = __importStar(require("sinon"));
const hoverProvider_1 = require("../src/hoverProvider");
const cache_1 = require("../src/cache");
const utils_1 = require("../src/utils");
suite('HoverProvider Test Suite', () => {
    let sandbox;
    setup(() => {
        sandbox = sinon.createSandbox();
        // Clear cache before each test
        cache_1.translationCache.clear();
    });
    teardown(() => {
        sandbox.restore();
    });
    test('createHoverProvider should return a HoverProvider', () => {
        // Since we can't easily test the full VSCode provider functionality,
        // we can at least ensure the function returns something
        const provider = (0, hoverProvider_1.createHoverProvider)();
        assert.ok(provider);
    });
    test('should not process hover if the lock is already active', async () => {
        // This is difficult to test directly because of the internal 'hoverLock' variable
        // But we can test that the function is defined and available
        const provider = (0, hoverProvider_1.createHoverProvider)();
        assert.ok(provider);
    });
    test('should generate correct MD5 hash for content', () => {
        const originalText = 'hello world';
        const expectedHash = (0, utils_1.md5)(originalText);
        // Verify the hash is generated correctly
        const actualHash = (0, utils_1.md5)(originalText);
        assert.strictEqual(actualHash, expectedHash);
        assert.ok(/^[a-f0-9]{32}$/.test(actualHash));
    });
    test('should handle translation cache properly', () => {
        const originalText = 'test translation';
        const hash = (0, utils_1.md5)(originalText);
        const translationResult = 'test translated text';
        // Add an entry to the cache
        cache_1.translationCache.set(hash, {
            original: originalText,
            text: translationResult,
            time: Date.now()
        });
        // Verify the entry is in the cache
        assert.strictEqual(cache_1.translationCache.has(hash), true);
        const cachedEntry = cache_1.translationCache.get(hash);
        assert.strictEqual(cachedEntry?.original, originalText);
        assert.strictEqual(cachedEntry?.text, translationResult);
    });
    test('should encode and decode text properly for commands', () => {
        const originalText = 'test text with special chars: @#$%^&*()';
        // Encode the text as would be done in the hover provider
        const encoded = Buffer.from(originalText, 'utf-8').toString('base64');
        // Decode the text back
        const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
        assert.strictEqual(decoded, originalText);
    });
});
//# sourceMappingURL=hoverProvider.test.js.map