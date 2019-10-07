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
