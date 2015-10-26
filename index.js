#! /usr/bin/env node
var pandoc=require('pandoc-filter');
var _ = require('lodash');
var tmp = require('tmp');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').execSync;

var prefix="diagram-";
var outdir= "img";
var mermaid_opts = "-v -o " + outdir;
var cmd = "mermaid " + mermaid_opts;
var counter = 0;
function mermaid(type, value, format, meta) {
    if (type != "CodeBlock") return null;
    var content=value[1];
    var attrs = value[0];
    var classes = attrs[1];
    if (!_.contains('mermaid', classes)) return null;
    counter++;
    //console.log(content);
    var tmpfileObj = tmp.fileSync();
    //console.log(tmpfile);
    fs.writeFileSync(tmpfileObj.name, content);
    var oldPath = path.join(outdir, path.basename(tmpfileObj.name) + ".png"); 
    var newPath = path.join(outdir, prefix + counter + ".png");
    exec(cmd + " " + tmpfileObj.name);
    fs.renameSync(oldPath, newPath);
    return pandoc.Para([pandoc.Image([],[newPath, ""])]);
}

pandoc.toJSONFilter(mermaid);
