#! /usr/bin/env node
var pandoc=require('pandoc-filter');
var _ = require('lodash');
var tmp = require('tmp');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').execSync;

var prefix="diagram";
var cmd = "mermaid -v ";
var imgur=  __dirname + "/node_modules/.bin/imgur";
var counter = 0;
function mermaid(type, value, format, meta) {
    if (type != "CodeBlock") return null;
    var attrs = value[0],
        content = value[1];
    var classes = attrs[1];
    var options = {width: '500', format: 'png', loc: 'imgur'};

    if (classes.indexOf('mermaid') < 0) return null;

    counter++;
    // console.log(attrs, content);
    attrs[2].map(item => {
        if (item.length  === 1) options[item[0]] = true;
        else options[item[0]] = item[1];
    });
    // console.log(options);
    if (!_.contains('mermaid', classes)) return null;
    counter++;
    //console.log(content);
    var tmpfileObj = tmp.fileSync();
    // console.log(tmpfileObj.name);
    fs.writeFileSync(tmpfileObj.name, content);
    var outdir = options.loc !== 'imgur' ? options.loc : path.dirname(tmpfileObj.name);
    // console.log(outdir);
    var savePath = path.join(outdir, path.basename(tmpfileObj.name) + "." + options.format);
    var newPath = path.join(outdir, `${prefix}-${counter}.${options.format}`);
    var fullCmd = `${cmd} -o ${outdir} -w ${options.width} ${options.format==='png' ? "-p": "-s"}  ${tmpfileObj.name}`
    // console.log(fullCmd, savePath)
    exec(fullCmd);
    //console.log(oldPath, newPath);
    if (options.loc === 'imgur')
        newPath = exec(`${imgur} ${savePath}`)
                .toString()
                .trim()
                .replace("http://", "https://");
    else {
        fs.renameSync(savePath, newPath);
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

pandoc.toJSONFilter(mermaid);
