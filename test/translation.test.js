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
const translation_1 = require("../src/translation");
const cache_1 = require("../src/cache");
suite('Translation Test Suite', () => {
    let sandbox;
    setup(() => {
        sandbox = sinon.createSandbox();
        // Clear cache before each test
        cache_1.translationCache.clear();
    });
    teardown(() => {
        sandbox.restore();
    });
    test('getTranslationConfig should return correct configuration', () => {
        // Since we can't easily mock VSCode configuration in unit tests,
        // we'll test with default values
        const config = (0, translation_1.getTranslationConfig)();
        // Check if the returned object has expected properties
        assert.ok('baseURL' in config);
        assert.ok('apiKey' in config);
        assert.ok('model' in config);
        assert.ok('promptTemplate' in config);
        assert.ok('quantityTranslation' in config);
        assert.ok('autoTranslate' in config);
    });
    test.skip('translateText should handle successful API response', async () => {
        // Mock fetch API response
        const mockFetchResponse = {
            ok: true,
            json: async () => ({
                choices: [
                    { message: { content: 'Test translation result' } }
                ]
            })
        };
        const fetchStub = sandbox.stub(global, 'fetch').resolves(mockFetchResponse);
        // Set up configuration to mock values
        const result = await (0, translation_1.translateText)('test text');
        assert.ok(result.includes('Test translation result'));
        assert.ok(fetchStub.calledOnce);
    });
    test.skip('translateText should handle HTTP error response', async () => {
        // Mock fetch API response with error status
        const mockFetchResponse = {
            ok: false,
            status: 401
        };
        const fetchStub = sandbox.stub(global, 'fetch').resolves(mockFetchResponse);
        const result = await (0, translation_1.translateText)('test text');
        assert.ok(result.includes('❌ **翻译请求失败'));
        assert.ok(fetchStub.calledOnce);
    });
    test.skip('translateText should handle API response format error', async () => {
        // Mock fetch API response with invalid format
        const mockFetchResponse = {
            ok: true,
            json: async () => ({}) // Empty response without choices
        };
        const fetchStub = sandbox.stub(global, 'fetch').resolves(mockFetchResponse);
        const result = await (0, translation_1.translateText)('test text');
        assert.ok(result.includes('⚠️ **API 响应格式异常**'));
        assert.ok(fetchStub.calledOnce);
    });
    test.skip('translateText should handle timeout error', async () => {
        // Mock fetch to reject with AbortError (timeout)
        const fetchStub = sandbox.stub(global, 'fetch').rejects(new Error('AbortError'));
        const result = await (0, translation_1.translateText)('test text');
        assert.ok(result.includes('❌ **翻译请求超时**'));
        assert.ok(fetchStub.calledOnce);
    });
    test('translateText should return error message when baseURL or apiKey are missing', async () => {
        // Stub the getTranslationConfig function to return empty values
        const configStub = sandbox.stub().returns({
            baseURL: '',
            apiKey: '',
            model: '',
            promptTemplate: '',
            quantityTranslation: 5,
            autoTranslate: true
        });
        // Temporarily replace the original function with our stub
        const originalGetTranslationConfig = global.getTranslationConfig;
        global.getTranslationConfig = configStub;
        try {
            const result = await (0, translation_1.translateText)('test text');
            assert.ok(result.includes('❌ **未配置翻译接口**'));
        }
        finally {
            // Restore the original function
            ;
            global.getTranslationConfig = originalGetTranslationConfig;
        }
    });
    test('forceRetranslate should update cache with new translation', async () => {
        const originalText = 'test original';
        const hash = 'test-hash';
        const newTranslation = 'newly translated text';
        // Mock the translateText function to return a specific value
        const translateStub = sandbox.stub().resolves(newTranslation);
        // Since we can't easily replace the function, we need to verify the function
        // is called and the cache is updated
        // We'll test the function behavior by checking cache after call
        await (0, translation_1.forceRetranslate)(originalText, hash);
        // Verify that the translated entry was added to the cache
        const cachedEntry = cache_1.translationCache.get(hash);
        assert.ok(cachedEntry);
        assert.strictEqual(cachedEntry.original, originalText);
        assert.strictEqual(cachedEntry.text, newTranslation);
    });
});
//# sourceMappingURL=translation.test.js.map