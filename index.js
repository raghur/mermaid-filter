#! /usr/bin/env node
var pandoc=require('pandoc-filter');
var _ = require('lodash');
var tmp = require('tmp');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').execSync;
var process = require('process')
var sanfile = require('sanitize-filename')

var prefix="diagram";
var cmd = externalTool("mmdc");
var imgur = externalTool("imgur");
var counter = 0;
var folder = process.cwd()
// console.log(folder)
function mermaid(type, value, format, meta) {
    if (type != "CodeBlock") return null;
    var attrs = value[0],
        content = value[1];
    var id = attrs[0],
        classes = attrs[1];
    var options = {
        width: process.env.MERMAID_FILTER_WIDTH || 800,
        format: process.env.MERMAID_FILTER_FORMAT || 'png',
        loc: process.env.MERMAID_FILTER_LOC || 'inline',
        theme: process.env.MERMAID_FILTER_THEME || 'default',
        caption: process.env.MERMAID_FILTER_CAPTION || '',
        filename: process.env.MERMAID_FILTER_FILENAME || ''
    };
    var configFile = path.join(folder, ".mermaid-config.json")
    var confFileOpts = ""
    if (fs.existsSync(configFile)) {
        confFileOpts += " -c " + configFile
    }
    var puppeteerConfig = path.join(folder, ".puppeteer.json")
    var puppeteerOpts = ""
    if (fs.existsSync(puppeteerConfig)) {
        puppeteerOpts += " -p " + puppeteerConfig
    }
    var cssFile = path.join(folder, ".mermaid.css")
    if (fs.existsSync(cssFile)) {
        confFileOpts += " -C " + cssFile
    }

    // console.log(classes)
    if (classes.indexOf('mermaid') < 0) return null;

    // console.log(attrs, content);
    attrs[2].map(item => {
        if (item.length  === 1) options[item[0]] = true;
        else options[item[0]] = item[1];
    });
    // console.log(options);
    // if (options.loc === 'inline') options.format = 'svg'
    counter++;
    //console.log(content);
    var tmpfileObj = tmp.fileSync();
    // console.log(tmpfileObj.name);
    fs.writeFileSync(tmpfileObj.name, content);
    var outdir = options.loc !== 'imgur' ? options.loc : path.dirname(tmpfileObj.name);
    // console.log(outdir);

    if (options.caption !== "" && options.filename === ""){
      options.filename = sanfile(options.caption, {replacement: ''}).replace(/[#$~%+;()\[\]{}&=_\-\s]/g, '');
    }

    if (options.filename === ""){
      options.filename = `${prefix}-${counter}`;
    }

    var savePath = tmpfileObj.name + "." + options.format
    var newPath = path.join(outdir, `${options.filename}.${options.format}`);
    var fullCmd = `${cmd}  ${confFileOpts} ${puppeteerOpts} -w ${options.width} -f -i ${tmpfileObj.name} -t ${options.theme} -o ${savePath}`
    // console.log(fullCmd, savePath)
    exec(fullCmd);
    //console.log(oldPath, newPath);
    if (options.loc == 'inline') {
        if (options.format === 'svg') {
            var data = fs.readFileSync(savePath, 'utf8')
            newPath = "data:image/svg+xml;base64," + new Buffer(data).toString('base64');
        } else  {
            var data = fs.readFileSync(savePath)
            newPath = 'data:image/png;base64,' + new Buffer(data).toString('base64');
        }
    } else if (options.loc === 'imgur')
        newPath = exec(`${imgur} ${savePath}`)
            .toString()
            .trim()
            .replace("http://", "https://");
    else {
        mv(savePath, newPath);
    }

    var fig = "";

    if (options.caption != "") {
        fig = "fig:";
    }
    return pandoc.Para(
        [
            pandoc.Image(
                [id, [], []],
                [pandoc.Str(options.caption)],
                [newPath, fig]
            )
    ]);
}

function externalTool(command) {
    return firstExisting([
        path.resolve(__dirname, "node_modules", ".bin", command),
        path.resolve(__dirname, "..", ".bin", command)],
        function() {
            console.error("External tool not found: " + command);
            process.exit(1);
        });
}

function mv(from, to) {
    var readStream = fs.createReadStream(from)
    var writeStream = fs.createWriteStream(to);

    readStream.on('close', () => {
        fs.unlinkSync(from);
    });
    readStream.pipe(writeStream);
}

function firstExisting(paths, error) {
    for (var i = 0; i < paths.length; i++) {
        if (fs.existsSync(paths[i])) return `"${paths[i]}"`;
    }
    error();
}

pandoc.toJSONFilter(function(type, value, format, meta) {
    // redirect stderr to file - if it logs to stdout, then pandoc hangs due to improper json
    errFile = path.join(folder,  "mermaid-filter.err");
    errorLog = fs.createWriteStream(errFile);
    var origStdErr = process.stderr.write;
    process.stderr.write = errorLog.write.bind(errorLog);
    return mermaid(type, value, format, meta);
});
