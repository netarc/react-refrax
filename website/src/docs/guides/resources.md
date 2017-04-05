---
title: Resources
permalink: /docs/guides/resources.html
group: 2
layout: docs.pug
---

When a Schema is defined, what you really are doing is describing a path to access your data. We can access that data in a read-only form by a [:resource]().

This is just a simple container that provides some base information such as `status` / `timestamp` but more importantly provides us with a `data` accessor to our read-only data.

Let's take a look at our simple Schema example for todos again and create a resource to represent the collection of todos.

#### Example

```javascript
import {createSchemaCollection, Schema, Resource} from 'Refrax';

Schema.addLeaf(createSchemaCollection("todos"));

var Todos = new Resource(Schema.todos);
```

As we have seen before, this creates a collection describing the `todo` object type; but here we also see a [:resource]() object being instantiated pointed at the collection of `todo` objects.

Behind the scenes this has already started a XHR request to fetch the collection of `todo` objects from `/todos`. If we tried to immediately access this data through its `.data` accessor we would probably just end up with `null` since our data has not yet loaded. Generally you will need to make use of a Resource's [:subscribable]() method <a href="/docs/api/mixin-subscribable.html#subscribe">subscribe(event, listener[, context])</a>.

### Example

```javascript
import {createSchemaCollection, Schema, Resource} from 'Refrax';

Schema.addLeaf(createSchemaCollection("todos"));

var Todos = new Resource(Schema.todos);

var disposer = Todos.subscribe('change', () => {
  disposer();
  console.info("Todos loaded!");
  console.info(Todos.data);
});

```
