---
title: RefraxMutableResource
permalink: /docs/api/refrax-mutable-resource.html
group: 1
layout: docs.pug
---

`RefraxMutableResource` represents an item or a collection through a data point on a server that can be `REST`fully acted upon.

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

<ul class="apiIndex">
  <li>
    <a href="#static-from">
      <pre>from(accessor[, ...])</pre>
      Alias for `new MutableResource`
    </a>
  </li>
  <li>
    <a href="#static-from">
      <pre>create([params])</pre>
      Invoke a request to create(`post`) a resource.
    </a>
  </li>
  <li>
    <a href="#static-from">
      <pre>destroy([params])</pre>
      Invoke a request to destroy(`delete`) a resource.
    </a>
  </li>
  <li>
    <a href="#static-from">
      <pre>update([params])</pre>
      Invoke a request to update(`put`) a resource.
    </a>
  </li>
</ul>

## Methods

### static from(accessor[, ...])

 - `accessor` [:schema_path]() A SchemaNodeAccessor that describes where this data can be accessed from.
 - `[...]` [:any]() Additional arguments to pass to the constructor that will be processed into the resources stack.

Alias for `new MutableResource(accessor[, ...])`.

Returns [:mutable_resource]()

### create([params])

Invoke a request to create(`post`) a resource.

Return [:promise]() representing the request to mutate the resource.

### destroy([params])

Invoke a request to destroy(`delete`) a resource.

Return [:promise]() representing the request to mutate the resource.

### update([params])

Invoke a request to update(`put`) a resource.

Return [:promise]() representing the request to mutate the resource.
