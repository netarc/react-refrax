---
title: Subscribable (Mixin)
permalink: /docs/api/mixin-subscribable.html
group: 2
layout: docs.pug
---

A subscribable is similar to an `EventEmitter` pattern except that it offers a subscribe method that provides a `disposer` to self-remove the subscription.

## Overview

*Methods*

<ul class="list-methods">
  <li>
    <a href="/docs/api/mixin-subscribable.html#subscribe">
      <pre>subscribe(event, listener[, context])</pre>
      Adds the listener function to the end of the listeners array for the given event name.
    </a>
  </li>
  <li>
    <a href="/docs/api/mixin-subscribable.html#emit">
      <pre>emit(event[, arg1][, arg2][, ...])</pre>
      Synchronously calls each of the listeners registered for a given event.
    </a>
  </li>
</ul>

## Methods

### subscribe(event, listener, [context])

<div class="api_metadata">
  <span>Added in: v0.1.0</span>
</div>

 - `event` (*String*): The name of the event.
 - `listener` (*Function*): The listener function.
 - `[context]` (*Any*): The context (`this`) that will be applied to the listener function.

Adds the listener function to the end of the listeners array for the given event name. No checks are made to see if the listener has already been added. Multiple calls passing the same combination of eventName and listener will result in the listener being added, and called, multiple times

##### Returns

(*Function*): A disposer method; which when invoked, will remove itself from the subscribable.

### emit(event[, arg1][, arg2][, ...])

<div class="api_metadata">
  <span>Added in: v0.1.0</span>
</div>

 - `event` (*String*): The name of the event.
 - `[argN]` (*Any*): Any arguments to be passed along to the invocation of any listeners.

Synchronously calls each of the listeners registered for the event named eventName, in the order they were registered, passing the supplied arguments to each.
