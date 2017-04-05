---
title: RefraxAction
permalink: /docs/api/refrax-action.html
group: 1
layout: docs.pug
---

`RefraxAction` is a mechanism to functionally represent a mutation to be performed on data.

Refrax actions are created using <a href="/docs/api/refrax.html#createAction">Refrax.createAction</a>.

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

<ul class="list-methods">
  <li>
    <a href="#event-mutated">
      <pre>mutated</pre>
      Mutable state has been modified.
    </a>
  </li>
  <li>
    <a href="#event-start">
      <pre>start</pre>
      Action invocation has started.
    </a>
  </li>
  <li>
    <a href="#event-end">
      <pre>end</pre>
      Action invocation has endend.
    </a>
  </li>
</ul>

*Methods*

<ul class="list-methods">
  <li>
    <a href="#get">
      <pre>get(attribute)</pre>
      Get the current state or default state for a given attribute.
    </a>
  </li>
  <li>
    <a href="#set">
      <pre>set(attribute[, value][, options])</pre>
      Set the current state for an attribute.
    </a>
  </li>
  <li>
    <a href="#setter">
      <pre>setter(attribute[, options])</pre>
      Generate a setter for a given attribute.
    </a>
  </li>
  <li>
    <a href="#unset">
      <pre>unset()</pre>
      Reset current state to default.
    </a>
  </li>
  <li>
    <a href="#geterrors">
      <pre>getErrors([attribute])</pre>
      Get current state errors.
    </a>
  </li>
  <li>
    <a href="#ispending">
      <pre>isPending()</pre>
      Is the action currently processing any invocations.
    </a>
  </li>
</ul>

## Events

### {event} mutated

### {event} start

### {event} end

## Methods

### get(attribute)

- `attribute` [:string]() An attribute name.

Get the current state (or default) for a given attribute.

### set(attribute[, value][, options])

- `attribute` [:string]() An attribute name.
- `value` [:any]() Value to set the current state for an attribute. Defaults to `null`.
- `[options]` [:object]()
  - `noPropagate` [:boolean]() When `true` will note events to not propagate across Resources.
  - `set` [:object]() Additional attributes state values to update.
  - `onSet` [:function]() Callback function that receives the key value pair when state changes.

Set the current state for an attribute.

#### Example

```javascript
action.set("state_id", 123, {
  set: {
    city_id: null,
    park_id: () => { return this.current_park_id; }
  }
});
```

### setter(attribute[, options])

- `attribute` [:string]() An attribute name.
- `[options]` [:object]() Reference [set](#set)

Generate a setter for a given attribute.

#### Example

```javascript
setter = action.setter("state_id", {
  set: {
    city_id: null,
    park_id: () => { return this.current_park_id; }
  }
});

setter(123);
```

### unset()

Reset current state to default.

### getErrors([attribute])

- `attribute` [:string]() An attribute name.

Get current state errors for an a given attribute or all state errors.

Returns [:object]() | [:array]()

### isPending()

Returns [:boolean]() indicating if the action is currently processing any invocations.
