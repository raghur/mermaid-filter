var pandoc=require('pandoc-filter');
var _ = require('lodash');

function mermaid(type, value, format, meta) {
    if (type != "CodeBlock")
        return null
    var content=value[1]
    var attrs = value[0]
    var classes = attrs[1]
    if (_.contains('mermaid', classes)) {
        console.log(content);
    }
    return null;

}

pandoc.toJSONFilter(mermaid);
