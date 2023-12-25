/* global test jest describe expect beforeEach */
describe('mermaid', () => {
  let fs, exec, filter
  beforeEach(() => {
    jest.mock('fs')
    jest.mock('process', () => ({
      env: {}
    }))
    jest.mock('tmp', () => ({
      fileSync: jest.fn().mockReturnValue({
        name: 'tmpfile'
      })
    }))
    jest.mock('child_process', () => ({
      execSync: jest.fn()
    }))
    fs = require('fs')
    exec = require('child_process').execSync
    fs.existsSync = jest.fn().mockReturnValue(true)
    filter = require('./filter')

    fs.writeFileSync = jest.fn()
    fs.readFileSync = jest.fn().mockReturnValue('graph TD;\nA-->B;')
    jest.clearAllMocks()
  })
  test('returns null for non code block', () => {
    const type = 'Paragraph'
    const value = []
    const format = ''
    const meta = {}

    expect(filter.mermaid(type, value, format, meta)).toBeNull()
  })

  test('returns null if no mermaid class', () => {
    const type = 'CodeBlock'
    const value = [['id', ['other']], 'graph TD;\nA-->B;']
    const format = ''
    const meta = {}

    expect(filter.mermaid(type, value, format, meta)).toBeNull()
  })

  test('renders with default options', () => {
    filter.mermaid('CodeBlock', [['id', ['mermaid']], 'x'])

    expect(exec).toHaveBeenCalled()
    const cmd = exec.mock.lastCall[0]
    console.log('cmd', cmd)
    expect(cmd).toContain('mmdc')
    expect(cmd).toContain('-s 1')
    expect(cmd).toContain('-f')
    expect(cmd).toContain('-i "tmpfile"')
    expect(cmd).toContain('-t default')
    expect(cmd).toContain('-w 800')
    expect(cmd).toContain('-b white')
    expect(cmd).toContain('-o "tmpfile.png"')
  })

  test('returns RawBlock for svg inline', () => {
    const block = filter.mermaid('CodeBlock', [['id', ['mermaid'], [['format', 'svg']]], 'x'])

    expect(block).toEqual(expect.objectContaining({
      t: 'RawBlock',
      c: ['html', 'graph TD;\nA-->B;']
    }))
    expect(exec).toHaveBeenCalled()
    const cmd = exec.mock.lastCall[0]
    console.log('cmd', cmd)
    expect(cmd).toContain('mmdc')
    expect(cmd).toContain('-s 1')
    expect(cmd).toContain('-f')
    expect(cmd).toContain('-i "tmpfile"')
    expect(cmd).toContain('-t default')
    expect(cmd).toContain('-w 800')
    expect(cmd).toContain('-b white')
    expect(cmd).toContain('-o "tmpfile.svg"')
  })
})
