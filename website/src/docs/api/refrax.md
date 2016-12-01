---
title: Refrax
permalink: /docs/api/refrax.html
group: 1
layout: docs.pug
---

`RefraxAction` is a mechanism to functionally represent a mutation to be performed on data.

Refrax actions are created using <a href="/docs/api/refrax.html#createAction">Refrax.createAction</a>.

## Overview

*Properties*

<ul class="helperIndex">
  <li>
    <a href="/docs/api/refrax-config.html">
      <pre>Config &rarr;</pre>
    </a>
  </li>
  <li>
    <a href="/docs/api/refrax-mutable-resource.html">
      <pre>MutableResource &rarr;</pre>
    </a>
  </li>
  <li>
    <a href="/docs/api/refrax-resource.html">
      <pre>Resource &rarr;</pre>
    </a>
  </li>
  <li>
    <a href="/docs/api/refrax-schema-path.html">
      <pre>Schema &rarr;</pre>
      Root SchemaPath
    </a>
  </li>
  <li>
    <a href="/docs/api/refrax-store.html">
      <pre>Store &rarr;</pre>
    </a>
  </li>
</ul>

*Methods*

<ul class="apiIndex">
  <li>
    <a href="#static-createaction">
      <pre>static createAction(method)</pre>
      Create an Action wrapper around a given method.
    </a>
  </li>
  <li>
    <a href="#static-createschemacollection">
      <pre>static createSchemaCollection(path[, store][, options])</pre>
    </a>
  </li>
  <li>
    <a href="#static-createschemaresource">
      <pre>static createSchemaResource(path[, store][, options])</pre>
    </a>
  </li>
  <li>
    <a href="#static-createschemanamespace">
      <pre>static createSchemaNamespace(path[, options])</pre>
    </a>
  </li>
  <li>
    <a href="#static-processresponse">
      <pre>static processResponse(data, resourceDescriptor[, handler])</pre>
    </a>
  </li>
</ul>

## Methods

### static createAction(method)

- `[method]` [:function]() Internal method to call upon action invocation.

Create an [:action]() wrapper around a given method.

Returns [:action]().

### static createSchemaCollection(path[, store][, options])

- `[method]` [:function]() A method to create a [:action]() surrounding.

Returns [:action]().

### static createSchemaResource(path[, store][, options])

- `[method]` [:function]() A method to create a [:action]() surrounding.

Returns [:action]().

### processResponse(data[, resourceDescriptor][, handler])
