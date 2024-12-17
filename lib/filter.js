const path = require('path')
const fs = require('fs')
const pandoc = require('pandoc-filter')
const exec = require('child_process').execSync
const sanfile = require('sanitize-filename')
const prefix = 'diagram'
let counter = 0
const folder = process.cwd()
const tmp = require('tmp')

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

// attributes are passed as an array of arrays
// ex: [['width', 600], ['format', 'svg']]
function getOptions (attrs, env) {
  env = env || process.env
  const options = {
    width: env.MERMAID_FILTER_WIDTH || 800,
    format: env.MERMAID_FILTER_FORMAT || 'png',
    loc: env.MERMAID_FILTER_LOC || 'inline',
    theme: env.MERMAID_FILTER_THEME || 'default',
    background: env.MERMAID_FILTER_BACKGROUND || 'white',
    caption: env.MERMAID_FILTER_CAPTION || '',
    filename: env.MERMAID_FILTER_FILENAME || '',
    scale: env.MERMAID_FILTER_SCALE || 1,
    imageClass: env.MERMAID_FILTER_IMAGECLASS || '',
  }
  const configFile = env.MERMAID_FILTER_MERMAID_CONFIG || path.join(folder, '.mermaid-config.json')
  options.confFileOpts = ''
  if (fs.existsSync(configFile)) {
    options.confFileOpts += ` -c "${configFile}"`
  }
  const puppeteerConfig = env.MERMAID_FILTER_PUPPETEER_CONFIG || path.join(folder, '.puppeteer.json')
  options.puppeteerOpts = ''
  if (fs.existsSync(puppeteerConfig)) {
    options.puppeteerOpts += ` -p "${puppeteerConfig}"`
  }
  const cssFile = env.MERMAID_FILTER_MERMAID_CSS || path.join(folder, '.mermaid.css')
  if (fs.existsSync(cssFile)) {
    options.confFileOpts += ` -C "${cssFile}"`
  }
  const fromAttribs = attrs || []
  fromAttribs.forEach(item => {
    if (item.length === 1) options[item[0]] = true
    else options[item[0]] = item[1]
  })

  if (options.caption !== '' && options.filename === '') {
    options.filename = sanfile(options.caption, { replacement: '' }).replace(/[#$~%+;()\[\]{}&=_\-\s]/g, '')
  }

  if (options.filename === '') {
    options.filename = `${prefix}-${counter}`
  }
  return options
}

function mermaid (type, value, _format, _meta) {
  if (type !== 'CodeBlock') return null
  const attrs = value[0]
  const content = value[1]
  const id = attrs[0]
  const classes = attrs[1]
  if (classes.indexOf('mermaid') < 0) return null

  const options = getOptions(attrs[2])
  counter++
  // console.log(content);
  const tmpfileObj = tmp.fileSync()
  // console.log(tmpfileObj.name);
  fs.writeFileSync(tmpfileObj.name, content)
  const outdir = options.loc !== 'imgur' ? options.loc : path.dirname(tmpfileObj.name)
  // console.log(outdir);

  const savePath = tmpfileObj.name + '.' + options.format
  let newPath = path.join(outdir, `${options.filename}.${options.format}`)
  const fullCmd = `${cmd}  ${options.confFileOpts} ${options.puppeteerOpts} -w ${options.width} -s ${options.scale} -f -i "${tmpfileObj.name}" -t ${options.theme} -b ${options.background} -o "${savePath}"`
  // console.log(fullCmd, savePath)
  exec(fullCmd)
  // console.log(oldPath, newPath);
  let data
  const imageClasses = options.imageClass ? [options.imageClass] : []
  if (options.loc === 'inline') {
    if (options.format === 'svg') {
      const svg = fs.readFileSync(savePath, 'utf8')
      // does not use default theme - picks the forest theme in the test.md
      return pandoc.RawBlock('html', svg)
      // return pandoc.Div(
      //   [id, imageClasses, []],
      //   [pandoc.RawBlock('html', svg)]
      // )
    } else if (options.format === 'pdf') {
      newPath = savePath
    } else {
      data = fs.readFileSync(savePath)
      newPath = 'data:image/png;base64,' + Buffer.from(data).toString('base64')
    }
  } else if (options.loc === 'imgur') {
    newPath = exec(`${imgur} ${savePath}`)
      .toString()
      .trim()
      .replace('http://', 'https://')
  } else {
    mv(savePath, newPath)
  }

  const fig = id.startsWith('fig:') ? 'fig:' : ''

  return pandoc.Figure(
    [id,imageClasses, []],
    // caption=[Array<inline>,Array<block>]
    [undefined, [
        pandoc.Plain([pandoc.Str(options.caption)])
    ]],
    [pandoc.Plain(
        [pandoc.Image(
            [id, imageClasses, []],
            [pandoc.Str(options.caption)],
            [newPath, fig]
        )]
    )]
  );
}
function mv (from, to) {
  const readStream = fs.createReadStream(from)
  const writeStream = fs.createWriteStream(to)

  const parent = path.dirname(to)
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true })
  }

  readStream.on('close', () => {
    fs.unlinkSync(from)
  })
  readStream.pipe(writeStream)
}

const cmd = externalTool('mmdc', process.env)
const imgur = externalTool('imgur', process.env)
exports.externalTool = externalTool
exports.mermaid = mermaid
exports.getOptions = getOptions
