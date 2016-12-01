---
title: Schema
permalink: /docs/guides/schema.html
group: 1
layout: docs.pug
---

Not to be confused with a database `Schema`, the `Schema` in `Refrax` refers to how data relates to api end-points.

When defining the Schema for your site you will typically use the following helper methods imported from [Refrax](/docs/api/refrax.html):

- [createSchemaCollection](/docs/api/refrax.html#static-createschemacollection)
- [createSchemaResource](/docs/api/refrax.html#static-createschemaresource)
- [createSchemaNamespace](/docs/api/refrax.html#static-createschemanamespace)

These all return a [:schema_path]() object that represent a path in the Schema as well as nodes defining what type of information they represent and how to treat it.

Let's take the typical todo app, we might have a collection of todo accessable via some end-points:

- `GET /todos`
- `GET /todos/:id`

For this we would make use of the [createSchemaCollection](/docs/api/refrax.html#static-createschemacollection) method that defines a collection.

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

We need to let `Refrax` know what to do with these paths, so we need to be explicit and reference the root [Schema](/docs/api/refrax.html) object and use the [addLeaf([identifier, ]leaf)](/docs/api/refrax-schema-path.html#addleaf) method available on any [:schema_path]() object.

#### Example

```javascript
import {createSchemaCollection, Schema} from 'Refrax';

Schema.addLeaf(createSchemaCollection("todos"));
```

This combines the definition of the `todos` collection into the root [Schema](/docs/api/refrax.html). As you define the Schema, it also becomes walkable.

Using a real world example, let's say we want to add a collection of users to a collection of projects.

#### Example

```javascript
import {createSchemaCollection, Schema} from 'Refrax';

Schema.addLeaf(createSchemaCollection("projects"));

// Adding the above collection means we can now walk it and add a nested collection
Schema.projects.project.addLeaf(createSchemaCollection("users"));
```

As you would expect this gives the following from inspection:

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
