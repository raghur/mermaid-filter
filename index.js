#! /usr/bin/env node
const pandoc = require('pandoc-filter')
const process = require('process')
const utils = require('./lib/filter')
const tmp = require('tmp')
const fs = require('fs')

// Create a writeable stream to redirect stderr to file - if it logs to stdout, then pandoc hangs due to improper json.
// errorLog is used in pandoc.toJSONFilter
const tmpObj = tmp.fileSync({ mode: 0o644, prefix: 'mermaid-filter-', postfix: '.err' })
const errorLog = fs.createWriteStream(tmpObj.name)

pandoc.toJSONFilter(function (ele,format,meta) {
  // Redirect stderr to a globally created writeable stream
  process.stderr.write = errorLog.write.bind(errorLog)
  return utils.mermaid(ele.t, ele.c, format, meta)
})
