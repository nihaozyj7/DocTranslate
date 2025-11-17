import * as assert from 'assert'
import { md5, debounce } from '../src/utils'

suite('Utils Test Suite', () => {
  test('md5 function should generate a valid hash', () => {
    const input = 'hello world'
    const result = md5(input)

    // Check that the result is a valid 32-character hex string
    assert.ok(/^[a-f0-9]{32}$/.test(result))

    // Also verify that different inputs produce different hashes
    const result2 = md5('hello world!')
    assert.notStrictEqual(result, result2)
  })

  test('md5 function should handle empty string', () => {
    const input = ''
    const expectedHash = 'd41d8cd98f00b204e9800998ecf8427e'
    const result = md5(input)
    
    assert.strictEqual(result, expectedHash)
  })

  test('md5 function should handle special characters', () => {
    const input = 'hello@#$%世界'
    const result = md5(input)
    
    // Just ensure it returns a valid MD5 hash (32 hex characters)
    assert.ok(/^[a-f0-9]{32}$/.test(result))
  })

  test('debounce function should delay execution', (done) => {
    let callCount = 0
    const debouncedFn = debounce(() => {
      callCount++
    }, 10)

    // Call multiple times in quick succession
    debouncedFn()
    debouncedFn()
    debouncedFn()

    // Wait longer than debounce delay
    setTimeout(() => {
      assert.strictEqual(callCount, 1)
      done()
    }, 50)
  })

  test('debounce function should not execute if cleared', (done) => {
    let callCount = 0
    const debouncedFn = debounce(() => {
      callCount++
    }, 10)

    debouncedFn()
    // Clear the timeout by calling debounced function again after a short delay
    setTimeout(() => {
      debouncedFn() // This should clear the previous timeout
      setTimeout(() => {
        assert.strictEqual(callCount, 1) // Only the last call should execute
        done()
      }, 50)
    }, 5)
  })
})