## basic png with width override
with a code block

```{.mermaid format=png loc=img}
sequenceDiagram
    Note right of John: png, folder img
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
```

## Nested folder

```{.mermaid format=png loc=img/child alt="should show up"}
sequenceDiagram
    Note right of John: png, folder img/child
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
```
## fig ref
If an id starts with `fig:`, then `title` attribute is set to `fig:`
```{.mermaid #fig:ref caption="Caption" format=png loc=img/child alt="should have id of fig:ref"}
sequenceDiagram
    Note right of John: png with id as attr
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
```

With theme specified
---------------------

**The following two diagram themes don't work because mermaid generates the svg with the same id and the last set of styles applied wins.**

```{.mermaid format=svg }
---
config:
  theme: dark
  deterministicIds: true
  deterministicIdSeed: first
title: first
---
sequenceDiagram
    Note right of John: SVG output with dark theme
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
```

```{.mermaid #item2 width=100 format=svg }
---
config:
  theme: forest
  deterministicIds: true
  deterministicIdSeed: second
title: first
---
sequenceDiagram
    Note right of John: SVG output with forest theme
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
```

Bug #37
-------------------

```{.mermaid}
graph LR;
    A-->B;
    click A callback "Tooltip for a callback"
    click B "http://www.github.com" "This is a tooltip for a link"
```

## Bug 81


```{.mermaid theme=forest}
gitGraph
   commit
   commit
   branch develop
   checkout develop
   commit
   commit
   checkout main
   merge develop
   commit
   commit
```


```{.mermaid theme=forest}
gitGraph:
  commit
  commit

  branch feature/x
  checkout feature/x
  commit
  commit
  
  checkout main

  merge feature/x
  
  branch feature/y
  checkout feature/y
  commit
  commit
  
  checkout main

  merge feature/y
  
  branch release/x
  checkout release/x

  commit tag: "X.X.X-qualifier.X"
  
  checkout main
  branch feature/z
  checkout feature/z
  commit
  commit
  
  checkout main

  merge feature/z
      
```
