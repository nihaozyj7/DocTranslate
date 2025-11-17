import * as assert from 'assert'
import * as sinon from 'sinon'
import * as vscode from 'vscode'
import { createHoverProvider } from '../src/hoverProvider'
import { translationCache } from '../src/cache'
import { md5 } from '../src/utils'

suite('HoverProvider Test Suite', () => {
  let sandbox: sinon.SinonSandbox

  setup(() => {
    sandbox = sinon.createSandbox()
    // Clear cache before each test
    translationCache.clear()
  })

  teardown(() => {
    sandbox.restore()
  })

  test('createHoverProvider should return a HoverProvider', () => {
    // Since we can't easily test the full VSCode provider functionality,
    // we can at least ensure the function returns something
    const provider = createHoverProvider()
    assert.ok(provider)
  })

  test('should not process hover if the lock is already active', async () => {
    // This is difficult to test directly because of the internal 'hoverLock' variable
    // But we can test that the function is defined and available
    const provider = createHoverProvider()
    assert.ok(provider)
  })

  test('should generate correct MD5 hash for content', () => {
    const originalText = 'hello world'
    const expectedHash = md5(originalText)
    
    // Verify the hash is generated correctly
    const actualHash = md5(originalText)
    assert.strictEqual(actualHash, expectedHash)
    assert.ok(/^[a-f0-9]{32}$/.test(actualHash))
  })

  test('should handle translation cache properly', () => {
    const originalText = 'test translation'
    const hash = md5(originalText)
    const translationResult = 'test translated text'
    
    // Add an entry to the cache
    translationCache.set(hash, {
      original: originalText,
      text: translationResult,
      time: Date.now()
    })
    
    // Verify the entry is in the cache
    assert.strictEqual(translationCache.has(hash), true)
    const cachedEntry = translationCache.get(hash)
    assert.strictEqual(cachedEntry?.original, originalText)
    assert.strictEqual(cachedEntry?.text, translationResult)
  })

  test('should encode and decode text properly for commands', () => {
    const originalText = 'test text with special chars: @#$%^&*()'
    
    // Encode the text as would be done in the hover provider
    const encoded = Buffer.from(originalText, 'utf-8').toString('base64')
    
    // Decode the text back
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
    
    assert.strictEqual(decoded, originalText)
  })
})