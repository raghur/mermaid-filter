/* global describe it expect fail */
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
