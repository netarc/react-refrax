---
title: RefraxResource
permalink: /docs/api/refrax-resource.html
group: 1
layout: docs.pug
---

`RefraxResource` represents an item or a collection through a data point on a server.

## Overview

*Implements*

<ul class="helperIndex">
  <li>
    <a href="/docs/api/mixin-subscribable.html">
      <pre>Subscribable &rarr;</pre>
    </a>
  </li>
</ul>

*Methods*

<ul class="list-methods">
  <li>
    <a href="#static-from">
      <pre>from(accessor[, ...])</pre>
      Alias for `new Resource`
    </a>
  </li>
  <li>
    <a href="#static-from">
      <pre>hasData()</pre>
      Does this resource contain any data (stale or not).
    </a>
  </li>
  <li>
    <a href="#static-from">
      <pre>invalidate([options])</pre>
      Invalidate associated Store cache for this Resource.
    </a>
  </li>
  <li>
    <a href="#static-from">
      <pre>isLoading()</pre>
      Is this Resource actively processing a request.
    </a>
  </li>
  <li>
    <a href="#static-from">
      <pre>isStale()</pre>
      Is the data contained in this Resource considered stale.
    </a>
  </li>
</ul>

## Methods

### static from(accessor[, ...])

- `accessor` [:schema_path]() A SchemaNodeAccessor that describes where this data can be accessed from.
- `[...]` [:any]() Additional arguments to pass to the constructor that will be processed into the resources stack.

Alias for `new MutableResource(accessor[, ...])`.

Returns [:mutable_resource]()

### hasData()

Does this resource contain any data (stale or not).

Returns [:boolean]()

### invalidate([options])

- [:object]() See [invalidate([options])](/docs/api/refrax-store.html#invalidate)

Invalidate associated Store cache for this Resource.

### isLoading()

Is this resource actively processing a request.

Returns [:boolean]()

### isStale()

Is the data contained in this Resource considered stale.

Returns [:boolean]()
