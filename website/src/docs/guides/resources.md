---
title: Resources
permalink: /docs/guides/resources.html
group: 2
layout: docs.pug
---

Once a Schema is defined we then can begin to access data through a particular [:schema_path]() by the way of a [:resource]() or [:mutable_resource]().

Let's take a look at our simple Schema example for todos again and create a resource to represent the collection of todos.

#### Example

```javascript
import {createSchemaCollection, Schema, Resource} from 'Refrax';

Schema.addLeaf(createSchemaCollection("todos"));

Todos = new Resource(Schema.todos);
```
