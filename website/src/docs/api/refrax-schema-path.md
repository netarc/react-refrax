---
title: RefraxSchemaPath
permalink: /docs/api/refrax-schema-path.html
group: 1
layout: docs.pug
---

`RefraxSchemaPath` represent a path in the Schema as well as nodes defining what type of information they represent and how to treat it.

## Overview

*Methods*

<ul class="apiIndex">
  <li>
    <a href="#static-createschemacollection">
      <pre>static createSchemaCollection(path[, store][, options])</pre>
      Create a SchemaNodeAccessor describing a collection.
    </a>
  </li>
  <li>
    <a href="#static-createschemaresource">
      <pre>static createSchemaResource(path[, store][, options])</pre>
      Create a SchemaNodeAccessor describing a resource.
    </a>
  </li>
  <li>
    <a href="#static-createschemanamespace">
      <pre>static createSchemaNamespace(path[, options])</pre>
      Create a SchemaNodeAccessor describing a namespace.
    </a>
  </li>
  <li>
    <a href="#inspect">
      <pre>inspect([result])</pre>
      Describe all visible leafs.
    </a>
  </li>
  <li>
    <a href="#addleaf">
      <pre>addLeaf([identifier, ]leaf)</pre>
      Add a leaf to the traversal of this node.
    </a>
  </li>
  <li>
    <a href="#adddetachedleaf">
      <pre>addDetachedLeaf([identifier, ]leaf)</pre>
      Add a detached leaf to the traversal of this node.
    </a>
  </li>
</ul>

## Methods

### static createSchemaCollection(path[, store][, options])

- `path` [:string]() A uri path for the base of the collection. The last path segment should be in plural form.
- `[store]` [:store]()|[:string]() The Store to represent the backing for the collection. If no Store is given, a default singular representation of the identifier will be used.
- `[options]` [:object]()
  - `identifier` [:string]() The identifier to use when creating the member leafs and the default store type reference.

Create a [:schema_path]() describing a collection at a given path. The supplied path is used as an identifier for leaf nesting seen below.

```js
Schema.addLeaf(createSchemaCollection("projects"))
Schema.projects.project
```

That same identifier is also used to the default store name, so in the example above if no store is supplied a default store referencing the type `project` would be used.

Returns [:schema_path]()

### static createSchemaResource(path[, store][, options])

- `path` [:string]() A uri path for the base of the collection. The last path segment should be in plural form.
- `[store]` [:store]()|[:string]() The optional Store to represent the backing for the collection. If no Store is given, a default singular representation of the identifier will be used.
- `[options]` [:object]()
  - `identifier` [:string]() The identifier to use when creating the member leafs and the default store type reference.

Create a [:schema_path]() describing a resource at a given path. The supplied path is used as an identifier for leaf nesting seen below.

```js
Schema.addLeaf(createSchemaResource("profile"))
Schema.profile
```

That same identifier is also used to the default store name, so in the example above if no store is supplied a default store referencing the type `profile` would be used.

Returns [:schema_path]()

### static createSchemaNamespace(path[, options])

- `path` [:string]() A uri path for the base of the collection. The last path segment should be in plural form.
- `[options]` [:object]()
  - `identifier` [:string]() The identifier to use when creating the member leafs and the default store type reference.

Create a [:schema_path]() describing a namespace or simply a path.

```js
Schema.addLeaf(createSchemaNamespace("api"))
Schema.api
```

Returns [:schema_path]()

### inspect([result])

Describe all visible leafs from the invoked SchemaNodeAccessor. In a project consisting simply of:

```js
Schema.addLeaf(createSchemaCollection("projects"))
```

It would yield something like:

```js
Schema.inspect() => {
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
  }
}
```

### addLeaf([identifier, ]leaf)

- `[identifier]` [:string]() A uri path for the base of the `SchemaNode`
- `leaf` [:schema_path]()

Add a given `leaf` to this node for traversal.

### addDetachedLeaf(identifier, leaf)

- `[identifier]` [:string]() A uri path for the base of the `SchemaNode`
- `leaf` [:schema_path]()

Add a given `leaf` to this node for traversal that is only visible in the current `scope` of traversal.

#### Example

```javascript
Profile = Refrax.createSchemaResource("profile");

Users = Refrax.createSchemaCollection("users");

Projects = Refrax.createSchemaCollection("projects");
Projects.project.addLeaf(Users);
Projects.project.users.user.addDetachedLeaf(Profile);

Schema.addLeaf(Users);
Schema.addLeaf(Projects);

Schema.inspect() => {
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
    coerce: "item",
    type: "user",
    ...
  },
  "/projects/:projectId/users/:userId": (ResourceDescriptor) {
    basePath: "/projects/:projectId/users/:userId",
    coerce: "item",
    type: "user",
    ...
  },
  "/projects/:projectId/users/:userId/profile": (ResourceDescriptor) {
    basePath: "/projects/:projectId/users/:userId/profile",
    coerce: "item",
    type: "profile",
    ...
  },
  "/users": (ResourceDescriptor) {
    basePath: "/users",
    coerce: "collection",
    type: "user",
    ...
  },
  "/users/:userId": (ResourceDescriptor) {
    basePath: "/users/:userId",
    coerce: "item",
    type: "user",
    ...
  }
}
```
