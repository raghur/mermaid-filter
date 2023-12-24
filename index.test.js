/* global test jest describe it expect fail beforeEach */
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
const fs = require('fs')
// eslint-disable-next-line no-unused-vars
const process = require('process')
const exec = require('child_process').execSync
fs.existsSync = jest.fn().mockReturnValue(true)
const utils = require('./lib')

describe('external tool lookup', () => {
  function findTool (name, env) {
    return utils.externalTool(name, env, () => fail(`expected to find utility ${name}`))
  }
  it('should find mmdc tool', () => {
    findTool('mmdc')
  })
  it('should find imgur tool', () => {
    findTool('imgur')
  })
  describe('env overrides', () => {
    it('should allow tool override from env', () => {
      const path = findTool('mmdc', { MERMAID_FILTER_CMD_MMDC: '/usr/bin/ls' })
      expect(path).toEqual('"/usr/bin/ls"')
    })
    it('should only override where env key matches', () => {
      const path = findTool('imgur', { MERMAID_FILTER_CMD_MMDC: '/usr/bin/ls' })
      expect(path).not.toEqual('"/usr/bin/ls"')
    })
  })
})

describe('mermaid', () => {
  beforeEach(() => {
    fs.writeFileSync = jest.fn()
    fs.readFileSync = jest.fn().mockReturnValue('graph TD;\nA-->B;')
    jest.clearAllMocks()
  })
  test('returns null for non code block', () => {
    const type = 'Paragraph'
    const value = []
    const format = ''
    const meta = {}

    expect(utils.mermaid(type, value, format, meta)).toBeNull()
  })

  test('returns null if no mermaid class', () => {
    const type = 'CodeBlock'
    const value = [['id', ['other']], 'graph TD;\nA-->B;']
    const format = ''
    const meta = {}

    expect(utils.mermaid(type, value, format, meta)).toBeNull()
  })

  test('renders with default options', () => {
    utils.mermaid('CodeBlock', [['id', ['mermaid']], 'x'])

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
})

describe('getOptions', () => {
  test('sets default options', () => {
    const options = utils.getOptions()

    expect(options).toEqual(expect.objectContaining({
      width: 800,
      format: 'png'
    }))
  })

  describe('env overrides', () => {
    it.each([
      ['width', 600],
      ['format', 'svg'],
      ['loc', 'imgur'],
      ['theme', 'forest'],
      ['background', 'transparent'],
      ['caption', 'caption'],
      ['filename', 'filename'],
      ['scale', 2],
      ['imageClass', 'imageClass']
    ])('overrides options for %s from env', (key, value) => {
      const options = utils.getOptions([], { [`MERMAID_FILTER_${key.toUpperCase()}`]: value })
      expect(options[key]).toBe(value)
    })
  })

  describe('attribute overrides', () => {
    it.each([
      ['width', 600],
      ['format', 'svg'],
      ['loc', 'imgur'],
      ['theme', 'forest'],
      ['background', 'transparent'],
      ['caption', 'caption'],
      ['filename', 'filename'],
      ['scale', 2],
      ['imageClass', 'imageClass']
    ])('overrides options for %s from attributes', (key, value) => {
      const options = utils.getOptions([[key, value]])
      expect(options[key]).toBe(value)
    })
  })
})
