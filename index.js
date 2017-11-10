#! /usr/bin/env node
var pandoc=require('pandoc-filter');
var _ = require('lodash');
var tmp = require('tmp');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').execSync;
var process = require('process')

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
    var classes = attrs[1];
    var options = {width: '500', format: 'png', loc: 'inline', theme: "default"};
    var configFile = path.join(folder, ".mermaid-config.json")
    var confFileOpts = ""
    if (fs.existsSync(configFile)) {
        confFileOpts += " -c " + configFile
    }
    var cssFile = path.join(folder, ".mermaid.css")
    if (fs.existsSync(cssFile)) {
        confFileOpts += " -C " + cssFile
    }

    if (classes.indexOf('mermaid') < 0) return null;

    // console.log(attrs, content);
    attrs[2].map(item => {
        if (item.length  === 1) options[item[0]] = true;
        else options[item[0]] = item[1];
    });
    // console.log(options);
    // if (options.loc === 'inline') options.format = 'svg'
    if (!_.contains('mermaid', classes)) return null;
    counter++;
    //console.log(content);
    var tmpfileObj = tmp.fileSync();
    // console.log(tmpfileObj.name);
    fs.writeFileSync(tmpfileObj.name, content);
    var outdir = options.loc !== 'imgur' ? options.loc : path.dirname(tmpfileObj.name);
    // console.log(outdir);
    var savePath = tmpfileObj.name + "." + options.format
    var newPath = path.join(outdir, `${prefix}-${counter}.${options.format}`);
    var fullCmd = `${cmd}  ${confFileOpts} -w ${options.width} -i ${tmpfileObj.name} -t ${options.theme} -o ${savePath}` 
    // console.log(fullCmd, savePath)
    exec(fullCmd);
    //console.log(oldPath, newPath);
    if (options.loc == 'inline') {

        if (options.format === 'svg') {
            var data = fs.readFileSync(savePath, 'utf8')
            data = data.replace (/"/g, "'");
            // console.log(data);
            newPath = "data:image/svg+xml," + encodeURIComponent(data);
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


    return pandoc.Para(
        [
            pandoc.Image(
                ['', [], []],
                [],
                [newPath, ""]
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

    readStream.pipe(writeStream);

    fs.unlinkSync(from);
}

function firstExisting(paths, error) {
    for (var i = 0; i < paths.length; i++) {
        if (fs.existsSync(paths[i])) return paths[i];
    }
    error();
}

pandoc.toJSONFilter(mermaid);
