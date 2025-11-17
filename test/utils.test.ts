import * as assert from 'assert'
import * as vscode from 'vscode'
import { md5, debounce, getContextAround } from '../src/utils'

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

  test('getContextAround should extract context around position correctly', () => {
    // Create a mock document
    const content = [
      'function example() {',
      '  const x = 1;',
      '  const y = 2;',
      '  return x + y;',
      '}',
      '',
      'console.log("hello");'
    ].join('\n')

    // Create a mock TextDocument
    const document = {
      lineAt: (lineNumber: number) => {
        const lines = content.split('\n')
        return {
          text: lines[lineNumber],
          lineNumber: lineNumber,
          range: new vscode.Range(lineNumber, 0, lineNumber, lines[lineNumber].length)
        }
      },
      lineCount: content.split('\n').length
    } as any as vscode.TextDocument

    // Test getting context around line 2 (const y = 2;)
    const position = new vscode.Position(2, 0)
    const context = getContextAround(document, position, 1, 1000) // 1 line each side

    const expected = [
      '  const x = 1;',
      '  const y = 2;',
      '  return x + y;'
    ].join('\n')

    assert.strictEqual(context, expected)
  })

  test('getContextAround should handle edge cases (beginning of file)', () => {
    const content = [
      'function example() {',
      '  const x = 1;',
      '  const y = 2;',
      '  return x + y;',
      '}'
    ].join('\n')

    const document = {
      lineAt: (lineNumber: number) => {
        const lines = content.split('\n')
        return {
          text: lines[lineNumber],
          lineNumber: lineNumber,
          range: new vscode.Range(lineNumber, 0, lineNumber, lines[lineNumber].length)
        }
      },
      lineCount: content.split('\n').length
    } as any as vscode.TextDocument

    // Test getting context around line 0 (first line)
    const position = new vscode.Position(0, 0)
    const context = getContextAround(document, position, 2, 1000) // 2 lines each side

    const expected = [
      'function example() {',
      '  const x = 1;',
      '  const y = 2;'
    ].join('\n')

    assert.strictEqual(context, expected)
  })

  test('getContextAround should handle edge cases (end of file)', () => {
    const content = [
      'function example() {',
      '  const x = 1;',
      '  const y = 2;',
      '  return x + y;',
      '}'
    ].join('\n')

    const document = {
      lineAt: (lineNumber: number) => {
        const lines = content.split('\n')
        return {
          text: lines[lineNumber],
          lineNumber: lineNumber,
          range: new vscode.Range(lineNumber, 0, lineNumber, lines[lineNumber].length)
        }
      },
      lineCount: content.split('\n').length
    } as any as vscode.TextDocument

    // Test getting context around last line
    const position = new vscode.Position(4, 0)
    const context = getContextAround(document, position, 2, 1000) // 2 lines each side

    const expected = [
      '  const y = 2;',
      '  return x + y;',
      '}'
    ].join('\n')

    assert.strictEqual(context, expected)
  })

  test('getContextAround should truncate content if it exceeds max length', () => {
    const content = [
      'function example() {',
      '  const x = 1;', // 13 chars
      '  const y = 2;', // 13 chars
      '  return x + y;', // 15 chars
      '}' // 1 char
    ].join('\n')

    const document = {
      lineAt: (lineNumber: number) => {
        const lines = content.split('\n')
        return {
          text: lines[lineNumber],
          lineNumber: lineNumber,
          range: new vscode.Range(lineNumber, 0, lineNumber, lines[lineNumber].length)
        }
      },
      lineCount: content.split('\n').length
    } as any as vscode.TextDocument

    // Test with a very small max length to trigger truncation
    const position = new vscode.Position(2, 0) // at "const y = 2;" line
    const context = getContextAround(document, position, 2, 20) // Very small limit

    // Should be truncated
    assert.ok(context.length <= 20 + '... (上下文截断)'.length)
    assert.ok(context.endsWith('... (上下文截断)'))
  })

  test('getContextAround should return empty string for empty document', () => {
    const content = ''

    const document = {
      lineAt: (lineNumber: number) => {
        const lines = content.split('\n')
        return {
          text: lines[lineNumber],
          lineNumber: lineNumber,
          range: new vscode.Range(lineNumber, 0, lineNumber, lines[lineNumber].length)
        }
      },
      lineCount: content.split('\n').length
    } as any as vscode.TextDocument

    const position = new vscode.Position(0, 0)
    const context = getContextAround(document, position, 2, 1000)

    assert.strictEqual(context, '')
  })
})