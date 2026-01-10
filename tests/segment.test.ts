import { describe, it, expect } from 'vitest'
import { segmentText } from '../lib/segment'

describe('segmentText', () => {
  it('segments English sentences by punctuation', () => {
    const input = 'Hello world! This is a test. Right?'
    const out = segmentText(input, 'en')
    expect(out).toEqual(['Hello world!', 'This is a test.', 'Right?'])
  })

  it('segments Chinese sentences by punctuation', () => {
    const input = '你好世界！这是一个测试。对吗？'
    const out = segmentText(input, 'zh')
    expect(out).toEqual(['你好世界！', '这是一个测试。', '对吗？'])
  })

  it('trims and filters empty results', () => {
    const input = '   '
    const out = segmentText(input, 'en')
    expect(out).toEqual([])
  })

  it('handles no trailing punctuation gracefully', () => {
    const input = 'This has no punctuation at end'
    const out = segmentText(input, 'en')
    expect(out).toEqual(['This has no punctuation at end'])
  })
})
