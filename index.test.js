/* global test describe it expect fail */
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
})

describe('getOptions', () => {
  test('sets default options', () => {
    const options = utils.getOptions()

    expect(options).toEqual(expect.objectContaining({
      width: 800,
      format: 'png'
    }))
  })

  test('overrides options from env', () => {
    const options = utils.getOptions([], { MERMAID_FILTER_WIDTH: 600 })
    expect(options.width).toBe(600)
  })
  test('overrides options from attributes', () => {
    const options = utils.getOptions([['width', 600]])
    expect(options.width).toBe(600)
  })

  // ... more tests
})
