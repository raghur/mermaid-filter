const path = require('path')
const fs = require('fs')

function firstExisting (paths, error) {
  for (let i = 0; i < paths.length; i++) {
    if (fs.existsSync(paths[i])) return `"${paths[i]}"`
  }
  error()
}

function externalTool (command, env, onError) {
  env = env || {}
  let paths = [
    path.resolve(__dirname, '..', 'node_modules', '.bin', command),
    path.resolve(__dirname, '..', '.bin', command)
  ]
  // Ability to replace path of external tool by environment variable
  // to replace `mmdc` use `MERMAID_FILTER_CMD_MMDC`
  // to replace `imgur` use `MERMAID_FILTER_CMD_IMGUR`
  const envCmdName = 'MERMAID_FILTER_CMD_' + (command || '').toUpperCase().replace(/[^A-Z0-9-]/g, '_')
  const envCmd = env[envCmdName]
  if (envCmd) {
    paths = [envCmd]
    command = 'env: ' + envCmdName // for error message
  }
  return firstExisting(paths,
    function () {
      if (onError) return onError()
      console.error('External tool not found: ' + command)
      process.exit(1)
    })
}

exports.externalTool = externalTool
