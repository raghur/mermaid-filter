this is a markdown file
with a code block


```{.mermaid width=100 format=png loc=img}
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
```

```{.mermaid width=100 format=png loc=img}
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
```

```{.mermaid width=100 format=svg }
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
```

With theme specified
---------------------

```{.mermaid width=100 format=svg theme=forest}
sequenceDiagram
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
