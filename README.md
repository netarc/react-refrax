# [Refrax](https://github.com/netarc/refrax/) [![npm version](https://badge.fury.io/js/refrax.svg)](http://badge.fury.io/js/refrax)[![npm downloads](https://img.shields.io/npm/dm/refrax.svg?style=flat-square)](https://www.npmjs.com/package/refrax)

Refrax is a JavaScript framework for building api-based data-driven applications. Inspired by collaboration with [sarahhenkens](https://github.com/sarahhenkens) and [omab](https://github.com/omab) and concepts from similar libraries.

* **Unidirectional:** User interaction in views propagate **actions** that affect **stores**, triggering view updates for those that reference data from affected **stores**.
* **Colocation:** Resources and actions can live next to the views that rely on them, so you can easily reason about your app.
* **Partials:** Data can be partially represented across various resources allowing views to efficiently fetch a small subset of data that can be re-used when a more detailed subset of data is needed.
* **Mutations:** Refrax lets you mutate data on the client and propagate to a server using actions and mutable resources directly, and offers automatic data consistency, optimistic updates, and error handling.

### Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save refrax

### Documentation

* [Basics](/docs/basics/README.md)
* [API Reference](/docs/api/README.md)
* [Change Log](/CHANGELOG.md)

### Example

The repository comes with an implementation of [TodoMVC](http://todomvc.com/). To try it out:

```
git clone https://github.com/netarc/refrax.git
cd refrax/examples/todo && npm install
npm start
```

Then, just point your browser at `http://localhost:3000`.

### License

Refrax is [BSD licensed](./LICENSE).
