import * as assert from 'assert'
import { CacheEntry } from '../src/types'

suite('Types Test Suite', () => {
  test('CacheEntry interface should have correct structure', () => {
    // Create a sample CacheEntry object
    const sampleEntry: CacheEntry = {
      original: 'test original',
      text: 'test translation',
      time: Date.now()
    }
    
    // Verify that all required properties exist and have correct types
    assert.strictEqual(typeof sampleEntry.original, 'string')
    assert.strictEqual(typeof sampleEntry.text, 'string')
    assert.strictEqual(typeof sampleEntry.time, 'number')
    
    // Test with different values
    const anotherEntry: CacheEntry = {
      original: 'another test',
      text: 'another translation',
      time: 1234567890
    }
    
    assert.strictEqual(anotherEntry.original, 'another test')
    assert.strictEqual(anotherEntry.text, 'another translation')
    assert.strictEqual(anotherEntry.time, 1234567890)
  })
})