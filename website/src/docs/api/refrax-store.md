---
title: RefraxStore
permalink: /docs/api/refrax-store.html
group: 1
layout: docs.pug
---

A Store holds a cached state of data and all its different representations for a unique `type`.

## Overview

*Implements*

<ul class="helperIndex">
  <li>
    <a href="/docs/api/mixin-subscribable.html">
      <pre>Subscribable &rarr;</pre>
    </a>
  </li>
</ul>

*Events*

<ul class="apiIndex">
  <li>
    <a href="#event-change">
      <pre>change</pre>
      Store cache has been modified.
    </a>
  </li>
  <li>
    <a href="#event-change-id">
      <pre>change:[id]</pre>
      Store cache has been modified for a specific resource.
    </a>
  </li>
</ul>

*Methods*

<ul class="apiIndex">
  <li>
    <a href="#get">
      <pre>static get([type])</pre>
      Find or create a Refrax Store instance for a given type.
    </a>
  </li>
  <li>
    <a href="#reset">
      <pre>static reset()</pre>
      Reset cache for all defined Stores.
    </a>
  </li>
  <li>
    <a href="#get">
      <pre>invalidate([options])</pre>
      Mark all internal cache as stale.
    </a>
  </li>
  <li>
    <a href="#reset">
      <pre>reset()</pre>
      Reset all internal cache.
    </a>
  </li>
</ul>

## Events

### {event} change

Emitted when Store cache has been modified with the following event data:

- `type` [:string]() representing the type represented by the [:store]().
- `action` [:string]() one of
  - `invalidate` Reset of status/timstamp/data cache
  - `touch` Update of cache metadata
  - `update` Update of cache data
  - `destroy` Removal of cache data

### {event} change:[id]

Emitted when Store cache has been modified for a particular resource with the following event data:

- `type` [:string]() representing the type represented by the [:store]().
- `id` [:string]() representing the id of the resource affected
- `action` [:string]() one of
  - `invalidate` Reset of status/timstamp/data cache
  - `touch` Update of cache metadata
  - `update` Update of cache data
  - `destroy` Removal of cache data

## Methods

### static get([type])

- `[type]` [:string]() An optional name identifying the type name this Store will contain. **NOTE:** type names are unique and two or more Stores cannot share the same type name.

Find or create a `Store` instance for a given type if it doesn't exist.

Returns [:store]().

### static reset()

Reset cache for all defined Stores.

### invalidate([options])

- `[options]` [:object]()
  - `noQueries` [:boolean]() When `true` will not mark queries as stale.
  - `noFragments` [:boolean]() When `true` will not mark fragments as stale.
  - `notify` [:boolean]() When `true` will cause the Store to emit a change event.

Mark all internal cache as stale.

### reset()

Reset all internal cache.
