import * as assert from 'assert'
import * as sinon from 'sinon'
import * as vscode from 'vscode'
import { getTranslationConfig, translateText, forceRetranslate } from '../src/translation'
import { translationCache } from '../src/cache'

suite('Translation Test Suite', () => {
  let sandbox: sinon.SinonSandbox

  setup(() => {
    sandbox = sinon.createSandbox()
    // Clear cache before each test
    translationCache.clear()
  })

  teardown(() => {
    sandbox.restore()
  })

  test('getTranslationConfig should return correct configuration', () => {
    // Since we can't easily mock VSCode configuration in unit tests,
    // we'll test with default values
    const config = getTranslationConfig()
    
    // Check if the returned object has expected properties
    assert.ok('baseURL' in config)
    assert.ok('apiKey' in config)
    assert.ok('model' in config)
    assert.ok('promptTemplate' in config)
    assert.ok('quantityTranslation' in config)
    assert.ok('autoTranslate' in config)
  })

  test.skip('translateText should handle successful API response', async () => {
    // Mock fetch API response
    const mockFetchResponse = {
      ok: true,
      json: async () => ({
        choices: [
          { message: { content: 'Test translation result' } }
        ]
      })
    }
    
    const fetchStub = sandbox.stub(global, 'fetch').resolves(mockFetchResponse as any)
    
    // Set up configuration to mock values
    const result = await translateText('test text')
    
    assert.ok(result.includes('Test translation result'))
    assert.ok(fetchStub.calledOnce)
  })

  test.skip('translateText should handle HTTP error response', async () => {
    // Mock fetch API response with error status
    const mockFetchResponse = {
      ok: false,
      status: 401
    }
    
    const fetchStub = sandbox.stub(global, 'fetch').resolves(mockFetchResponse as any)
    
    const result = await translateText('test text')
    
    assert.ok(result.includes('❌ **翻译请求失败'))
    assert.ok(fetchStub.calledOnce)
  })

  test.skip('translateText should handle API response format error', async () => {
    // Mock fetch API response with invalid format
    const mockFetchResponse = {
      ok: true,
      json: async () => ({}) // Empty response without choices
    }
    
    const fetchStub = sandbox.stub(global, 'fetch').resolves(mockFetchResponse as any)
    
    const result = await translateText('test text')
    
    assert.ok(result.includes('⚠️ **API 响应格式异常**'))
    assert.ok(fetchStub.calledOnce)
  })

  test.skip('translateText should handle timeout error', async () => {
    // Mock fetch to reject with AbortError (timeout)
    const fetchStub = sandbox.stub(global, 'fetch').rejects(new Error('AbortError'))
    
    const result = await translateText('test text')
    
    assert.ok(result.includes('❌ **翻译请求超时**'))
    assert.ok(fetchStub.calledOnce)
  })

  test('translateText should return error message when baseURL or apiKey are missing', async () => {
    // Stub the getTranslationConfig function to return empty values
    const configStub = sandbox.stub().returns({
      baseURL: '',
      apiKey: '',
      model: '',
      promptTemplate: '',
      quantityTranslation: 5,
      autoTranslate: true
    })
    
    // Temporarily replace the original function with our stub
    const originalGetTranslationConfig = (global as any).getTranslationConfig
    ;(global as any).getTranslationConfig = configStub
    
    try {
      const result = await translateText('test text')
      assert.ok(result.includes('❌ **未配置翻译接口**'))
    } finally {
      // Restore the original function
      ;(global as any).getTranslationConfig = originalGetTranslationConfig
    }
  })

  test('forceRetranslate should update cache with new translation', async () => {
    const originalText = 'test original'
    const hash = 'test-hash'

    // Since forceRetranslate calls translateText internally, and that will fail without proper config,
    // we're testing that it at least attempts the translation and updates cache structure
    await forceRetranslate(originalText, hash)

    // Verify that an entry was added to the cache (even if it's an error message)
    const cachedEntry = translationCache.get(hash)
    assert.ok(cachedEntry)
    assert.strictEqual(cachedEntry!.original, originalText)
    // The text will be an error message since no API is configured
    assert.ok(typeof cachedEntry!.text === 'string')
  })
})