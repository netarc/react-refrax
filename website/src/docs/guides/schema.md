---
title: Schema
permalink: /docs/guides/schema.html
group: 1
layout: docs.pug
---

The `Schema` in Refrax describes how to access your data/end-points. It also describes what the proper name of that data is (IE `User` or `Project`) and if it should be treated as a collection / resource or simple namespace.

When defining the overall Schema you will typically use the following helper methods imported from [Refrax](/docs/api/refrax.html):

- [defineSchemaCollection](/docs/api/refrax.html#static-defineschemacollection)
- [defineSchemaResource](/docs/api/refrax.html#static-defineschemaresource)
- [defineSchemaNamespace](/docs/api/refrax.html#static-defineschemanamespace)

These all return a [:schema_path]() object that simply represents an idomatic path/location in the Schema (IE `/projects`) as well as any child paths (trails). They also represent how the data should be treated when being interacted with (such as a collection or resource).

Let's take the typical TODO app, from our server we might expect to have a collection and its associated item end-points:

- `GET /todos`
- `GET /todos/:id`

We can make use of the [defineSchemaCollection](/docs/api/refrax.html#static-defineschemacollection) method that defines a collection.

#### Example

```javascript
import {createSchemaCollection} from 'Refrax';

var Todos = createSchemaCollection("todos");
```

If you wanted to look closer under the hood you can see the end-points that this collection represents by making use of the [inspect()](/docs/api/refrax-schema-path#inspect) method available on any [:schema_path]().

#### Example

```javascript
Todos.inspect();
=> {
  "/todos": (ResourceDescriptor) {
    basePath: "/todos",
    coerce: "collection",
    type: "todo",
    ...
  },
  "/todos/:todoId": (ResourceDescriptor) {
    basePath: "/todos/:todoId",
    coerce: "item",
    type: "todo",
    ...
  }
}
```

We can see that collection assumed some details such as taking the `todos` identifier and using that for its type name and pathing. This is configurable via [:schema_path]() options but for most this works as-is just fine.

Next, we need to let `Refrax` know what to do with these paths, so we need to be explicit and reference the root [Schema](/docs/api/refrax.html) object and use the [addLeaf([identifier, ]leaf)](/docs/api/refrax-schema-path.html#addleaf) method available on any [:schema_path]() object.

#### Example

```javascript
import {createSchemaCollection, Schema} from 'Refrax';

Schema.addLeaf(createSchemaCollection("todos"));
```

This combines the definition of the `todos` collection into the root [Schema](/docs/api/refrax.html).

As you define the Schema, it also provides an idiomatic approach to describing/acessing a particualr path and in itself becomes walkable.

Using a real world example, let's say we want to add a collection of users to a collection of projects.

#### Example

```javascript
import {createSchemaCollection, Schema} from 'Refrax';

Schema.addLeaf(createSchemaCollection("projects"));

// Adding the above collection means we can now walk it and add a nested collection
Schema.projects.project.addLeaf(createSchemaCollection("users"));
```

And just to look under the hood again, as you would expect this gives the following from inspection:

```javascript
Schema.inspect();
=> {
  "/projects": (ResourceDescriptor) {
    basePath: "/projects",
    coerce: "collection",
    type: "project",
    ...
  },
  "/projects/:projectId": (ResourceDescriptor) {
    basePath: "/projects/:projectId",
    coerce: "item",
    type: "project",
    ...
  },
  "/projects/:projectId/users": (ResourceDescriptor) {
    basePath: "/projects/:projectId/users",
    coerce: "collection",
    type: "user",
    ...
  },
  "/projects/:projectId/users/:userId": (ResourceDescriptor) {
    basePath: "/projects/:projectId/users/:userId",
    coerce: "item",
    type: "user",
    ...
  }
}
```

Just for some insight to whats possible, let's take a look at a more involved setup of a Schema.

#### Example

```javascript
import {createSchemaCollection, createSchemaNamespace, createSchemaResource, Schema} from 'Refrax';

var Projects = createSchemaCollection("projects");
var Users = createSchemaCollection("users");

Schema.addLeaf(Projects);
Schema.addLeaf(createSchemaNamespace('admin'));

Schema.admin.addLeaf(Projects);
Schema.admin.projects.project.addDetachedLeaf(Users);
Schema.admin.addLeaf(Users);
Schema.admin.users.user.addDetachedLeaf(Projects);
```

This show cases some new methods and techniques but from an inspection you will see the following:

```javascript
Schema.inspect();
=> {
  "/projects": (ResourceDescriptor) {
    basePath: "/project",
    coerce: "collection",
    type: "project",
    ...
  },
  "/projects/:projectId": (ResourceDescriptor) {
    basePath: "/projects/:projectId",
    coerce: "item",
    type: "project",
    ...
  },
  "/admin/projects": (ResourceDescriptor) {
    basePath: "/admin/projects",
    coerce: "collection",
    type: "project",
    ...
  },
  "/admin/projects/:projectId": (ResourceDescriptor) {
    basePath: "/admin/projects/:projectId",
    coerce: "item",
    type: "project",
    ...
  },
  "/admin/projects/:projectId/users": (ResourceDescriptor) {
    basePath: "/admin/projects/:projectId/users",
    coerce: "collection",
    type: "user",
    ...
  },
  "/admin/projects/:projectId/users/:userId": (ResourceDescriptor) {
    basePath: "/admin/projects/:projectId/users/:userId",
    coerce: "item",
    type: "user",
    ...
  },
  "/admin/users": (ResourceDescriptor) {
    basePath: "/admin/users",
    coerce: "collection",
    type: "user",
    ...
  },
  "/admin/users/:userId": (ResourceDescriptor) {
    basePath: "/admin/users/:userId",
    coerce: "item",
    type: "user",
    ...
  },
  "/admin/users/:userId/projects": (ResourceDescriptor) {
    basePath: "/admin/users/:userId/projects",
    coerce: "collection",
    type: "project",
    ...
  },
  "/admin/users/:userId/projects/:projectId": (ResourceDescriptor) {
    basePath: "/admin/users/:userId/projects/:projectId",
    coerce: "item",
    type: "project",
    ...
  }
}
```

<div class="docs-prevnext"><a class="docs-next" href="/docs/guides/resources.html">Next →</a></div>
