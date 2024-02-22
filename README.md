Sequence and Graph diagrams in your markdown files!
=========================

`mermaid-filter` is a pandoc filter that adds support for [mermaid](https://github.com/mermaid-js/mermaid) syntax diagrams in markdown.

Write your diagrams in fenced code blocks as usual like this:

    ~~~mermaid
    sequenceDiagram
        Alice->>John: Hello John, how are you?
        John-->>Alice: Great!
    ~~~


and get this in rendered doc <img
src="https://cdn.rawgit.com/raghur/mermaid-filter/master/img/diagram-1.svg"
width="100%"/>

Installation and usage
---------------------

1. `npm install --global mermaid-filter`
2. To convert your markdown file `something.md` into `something.html`, use `pandoc -t html -F mermaid-filter -o something.html something.md`


**WINDOWS** - you need `mermaid-filter.cmd` in the line above

**Windows 8.1** - On windows 8.1, `mermaid-filter.cmd` fails - apparently due to change in how the CMD.exe works
for subprocesses? - see this [issue thread](https://github.com/jgm/pandoc/issues/3458).
You have to edit the globally installed `mermaid-filter.cmd` located in `c:\users\<username>\AppData\Roaming\npm`
to use `~dp$PATH:0`.
Unfortunately, you will need to do this each time you install/update mermaid-filter since it overwrites the cmd file.

Attributes
--------------------

You have a couple of formatting options via attributes of the fenced code block to control the rendering

Note that to specify options in attribtues, you need to use the curly braces syntax and have the `.mermaid` class attached.
Admittedly, this is uglier than the earlier syntax on top - but that's how Pandoc wants it.

    // saves generated diagram in the img subfolder of the current working dir

    ```{.mermaid loc=img}
    // Your diagram code here
    ```


| Option Name | default value | env var | Notes|
|-------------|---------------|---------|------|
|   `caption` |             | `MERMAID_FILTER_CAPTION`| Sets `alt=` attribute on the image|
| `format`    | png         | `MERMAID_FILTER_FORMAT` | Allowed - `svg`|
| `width`     | 800           | `MERMAID_FILTER_WIDTH`  ||
| `theme`     | default       | `MERMAID_FILTER_THEME`  |Corresponds to `--theme`  flag of mermaid.cli|
|`background` | `white`       | `MERMAID_FILTER_BACKGROUND` |Correponds to `--backgroundColor` flag of mermaid.cli|
| `filename`  | NA            | `MERMAID_FILTER_FILENAME`| Takes precedence |
| `loc`| `inline` | `MERMAID_FILTER_LOC`| inline - generates a data url; `imgur` - uploads to imgur; `loc=anythingelse` saves images to folder `anythingelse`
| `scale` | 1|`MERMAID_FILTER_SCALE`| |
| `imageclass` ||`MERMAID_FILTER_IMAGECLASS`| |

You can also specify an ID to be applied to the rendered image. This may be useful to use [`pandoc-crossref`](https://github.com/lierdakil/pandoc-crossref) or similar packages to reference your diagrams, for example:

    ```{.mermaid #fig:example}
    // Your diagram code here
    ```

    This text has a reference @fig:example which is automatically inserted.

The `title` attribute is set to `fig:` by if the id specified starts with `fig:`

(Note that `pandoc-crossref` will automatically find and use the `caption=` option. Also note that the order of applying the filters matters - you must apply `mermaid-filter` *before* `pandoc-crossref` so that `pandoc-crossref` can find the images.)

JSON and CSS configuration
---------------------------

Mermaid cli allows you to specify additional options in a json configuration file and a css file. `mermaid-filter`
will look in the current working directory for `.mermaid-config.json` and `.mermaid.css` and if found, pass them in to
mermaid cli.

Puppeteer Configuration - `mermaid-filter` will look in the current working directory for a `.puppeteer.json` and pass it
on to mermaid cli (`-p` option of mmdc)if found
