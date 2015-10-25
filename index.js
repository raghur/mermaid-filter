var pandoc=require('pandoc-filter');
var _ = require('lodash');
var tmp = require('tmp');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var prefix="diagram-";
var outdir= "img"
var mermaid_opts = "-v -o " + outdir;
var cmd = "mermaid " + mermaid_opts;
var counter = 0;
function mermaid(type, value, format, meta) {
    if (type != "CodeBlock")
        return null
    var content=value[1]
    var attrs = value[0]
    var classes = attrs[1]
    if (_.contains('mermaid', classes)) {
        counter++;
        console.log(content);
        tmp.file(function(err, tmpfile, fd, cleanup) {
           if(err) throw err;
           console.log(tmpfile);
           fs.writeFile(tmpfile, content, function(err) {
               if(err) throw err;
               exec(cmd + " " + tmpfile, function(err, stdin, stdout) {
                if (err) throw err;
                console.log(stdout);
                var oldPath = path.join(outdir, path.basename(tmpfile) + ".png"); 
                var newPath = path.join(outdir, prefix + counter + ".png");
                console.log(oldPath, newPath);
                fs.renameSync(oldPath, newPath);
               });
           });
        });

    }
    return null;

}

pandoc.toJSONFilter(mermaid);
