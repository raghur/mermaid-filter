/* global test describe it expect fail */
const utils = require('./filter')

describe('external tool lookup', () => {
  function findTool (name, env, onNotFound) {
    return utils.externalTool(name, env, function () {
      if (onNotFound) onNotFound()
      else fail(`expected to find utility ${name}`)
    })
  }
  it('should find mmdc tool', () => {
    findTool('mmdc')
  })
  it('should throw for non existent tool', () => {
    expect(() => findTool('someName', {}, () => {
      throw new Error('expected to fail')
    })).toThrow()
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
      const path = findTool('imgur', {
        MERMAID_FILTER_CMD_MMDC: '/usr/bin/ls'
      })
      expect(path).not.toEqual('"/usr/bin/ls"')
    })
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
    it('adds fig option from attributes', () => {
      const options = utils.getOptions([['#fig:ref']])
      expect(options.id).toBe('fig:ref')
    })
  })
})
