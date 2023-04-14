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

Options
--------------------

You have a couple of formatting options via attributes of the fenced code block to control the rendering

- Pandoc caption, the filename is this value cleaned up - Use `{.mermaid caption="Caption Text Here"}`
- Image Format - Use `{.mermaid format=svg}`     Default is png
- Width  - Use `{.mermaid width=400}`     default width is 800
- Theme - Use `{.mermaid theme=forest}` default is 'default'. Corresponds to `--theme`  flag of mermaid.cli
- Background - Use `{.mermaid background=transparent}` default is 'white'. Correponds to `--backgroundColor` flag of mermaid.cli
- Filename - Use `{.mermaid filename="file with space"}` to set the filename. This has priority over the caption
- Save path - Use `{.mermaid loc=img}`  default loc=inline which will
  encode the image in a `data uri` scheme.
    - Possible values for `loc`
        - `loc=inline` - default; encode image to data uri on img tag.
            - For widest compatibility, use png (default)
            - SVG has trouble on IE11
        - `loc=imgur` - upload png to imgur and link to it.
        - `loc=<anythingelse>` -treat as folder name to place images into

Note that to specify options, you need to use the curly braces syntax and have the `.mermaid` class attached.
Admittedly, this is uglier than the earlier syntax on top - but that's how Pandoc wants it.

It's also possible to override global defaults by using environment variables. The name for these environment variables are the same as the attributes prefixed with a `MERMAID_FILTER_` so that `width` would be `MERMAID_FILTER_WIDTH`.

You can also specify an ID to be applied to the rendered image. This may be useful to use [`pandoc-crossref`](https://github.com/lierdakil/pandoc-crossref) or similar packages to reference your diagrams, for example:

    ```{.mermaid #fig:example}
    // Your diagram code here
    ```

    This text has a reference @fig:example which is automatically inserted.

(Note that `pandoc-crossref` will automatically find and use the `caption=` option. Also note that the order of applying the filters matters - you must apply `mermaid-filter` *before* `pandoc-crossref` so that `pandoc-crossref` can find the images.)

JSON and CSS configuration
---------------------------

Mermaid cli allows you to specify additional options in a json configuration file and a css file. `mermaid-filter`
will look in the current working directory for `.mermaid-config.json` and `.mermaid.css` and if found, pass them in to
mermaid cli.

Puppeteer Configuration - `mermaid-filter` will look in the current working directory for a `.puppeteer.json` and pass it
on to mermaid cli (`-p` option of mmdc)if found
