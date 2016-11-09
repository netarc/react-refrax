## [v0.5.0]
> November 9, 2016

- **Major** Rewrite internal logic of Actions for an easier idiomatic approach to working with Action and changing of params/options
- **Feature** Add ActionInvoker `invalidate` helper method
- **Feature** Add SchemaNodeAccessor `enumerateLeafs` method
- **Feature** Add `invalidate` boolean option `cascade` to enumerate nested schema paths

## [v0.4.10]
> September 10, 2016

- **Minor** Fix default import for `RefraxReact`
- **Minor** Fix SchemaNodeAccessor compareStack slicing bug

[v0.4.10]: https://github.com/netarc/refrax/compare/v0.4.9...v0.4.10

## [v0.4.9]
> August 2, 2016

- **Minor** Pass `MutableResource` options into invocation methods

[v0.4.9]: https://github.com/netarc/refrax/compare/v0.4.8...v0.4.9

## [v0.4.8]
> August 2, 2016

- **Minor** Remove `noPropagate` behavior from invoke fetch
- **Minor** Allow `null` values in an Action to override default values
- **Feature** Add `collectionStrategy` behavior for FragmentCache updating

[v0.4.8]: https://github.com/netarc/refrax/compare/v0.4.7...v0.4.8

## [v0.4.7]
> July 25, 2016

- **Bugfix:** Fix Tools concatUnique consuming string key as array

[v0.4.7]: https://github.com/netarc/refrax/compare/v0.4.6...v0.4.7

## [v0.4.6]
> July 25, 2016

- **Bugfix:** SchemaAccessor invalidate error when no options specified
- **Bugfix:** ResourceDescriptor not properly appending QueryParams to basePath
- **Minor:** FragmentCache returns ids affected on invalidate/update
- **Minor:** Tools concatUnique improved
- **Minor:** FragmentCache now concats id results (prev merge strategy)
- **Minor:** Resource will now invalidate prior to subscribing to descriptor Store

[v0.4.6]: https://github.com/netarc/refrax/compare/v0.4.5...v0.4.6

## [v0.4.5]
> July 20, 2016

- **Bugfix:** Resource switches to passive when it detects resource destroy
- **Minor:** Rename Store event `type` to `action` and now `type` is the actual model type

[v0.4.5]: https://github.com/netarc/refrax/compare/v0.4.4...v0.4.5

## [v0.4.4]
> July 15, 2016

- **Bugfix:** Fix SchemaNodeAccessor invalidate fetching data

[v0.4.4]: https://github.com/netarc/refrax/compare/v0.4.3...v0.4.4

## [v0.4.3]
> July 8, 2016

- **Bugfix:** Fix bad param on descriptor processStack

[v0.4.3]: https://github.com/netarc/refrax/compare/v0.4.2...v0.4.3

## [v0.4.2]
> July 6, 2016

- **Feature:** QueryParameters now encodes objects
- **Minor:** Rename Resource `query` utility method to `queryParams`

[v0.4.2]: https://github.com/netarc/refrax/compare/v0.4.1...v0.4.2

## [v0.4.1]
> June 29, 2016

- **Bugfix:** Update FragmentCache to use descriptor classification when fetching data fixing an issue with resource type accessors

[v0.4.1]: https://github.com/netarc/refrax/compare/v0.4.0...v0.4.1

## [v0.4.0]
> June 28, 2016

- **Feature:** Add `config`, `params`, `query` self chaining helper methods on ResourceBase
- **Feature:** Add `cacheStrategy` option to MutableResource to allow control over received data
- **Feature:** Add `invalidate` utility method for applying the same config to a list of items to invalidate
- **Minor:** Test updates surrounding FragmentCache
- **Bugfix:** Fix Resource not correctly updating cache on store change

[v0.4.0]: https://github.com/netarc/refrax/compare/v0.3.20...v0.4.0

## [v0.3.20]
> June 22, 2016

- **BugFix:** Fix path handling from ResourceBase & Descriptor conversion

[v0.3.20]: https://github.com/netarc/refrax/compare/v0.3.19...v0.3.20

## [v0.3.19]
> June 22, 2016

- **Feature:** FragmentCache now uses basePath instead of full path. MutableResource now consumes paths as modifiers (non basePath editing) and Resource consumes as non-modifier.

[v0.3.19]: https://github.com/netarc/refrax/compare/v0.3.18...v0.3.19

## [v0.3.18]
> June 22, 2016

- **Minor:** ResourceBase consumes all objects into QueryParamter objects which nets the same functionality
- **Minor:** Descriptor now only consumes QueryParamter objects for its query params instead of payload data
- **Minor:** Export Parameters & Options classes

[v0.3.18]: https://github.com/netarc/refrax/compare/v0.3.17...v0.3.18

## [v0.3.17]
> June 13, 2016

- **BugFix:** Resource will no longer get data on an update
- **BugFix:** FragmentCache update will properly update the timestamp on falsey data

[v0.3.17]: https://github.com/netarc/refrax/compare/v0.3.16...v0.3.17

## [v0.3.16]
> June 8, 2016

- **Minor:** MutableResource action methods pass all arguments

[v0.3.16]: https://github.com/netarc/refrax/compare/v0.3.15...v0.3.16

## [v0.3.15]
> June 8, 2016

- **Minor:** ResourceBase no longer consumes objects as params
- **Minor:** Action `.mutableFrom` consumes objects as params

[v0.3.15]: https://github.com/netarc/refrax/compare/v0.3.14...v0.3.15

## [v0.3.14]
> June 6, 2016

- **Minor:** Resource constructor behavior now always consumes objects as params

[v0.3.14]: https://github.com/netarc/refrax/compare/v0.3.13...v0.3.14

## [v0.3.13]
> June 3, 2016

- **Feature:** `noNotify` option support for store invalidation
- **Minor:** `params` option passing to Resource via SchemaNodeAccessor.invalidate
- **Minor:** Move partial default assignment to ResourceDescriptor instead of in FragmentCache

[v0.3.13]: https://github.com/netarc/refrax/compare/v0.3.12...v0.3.13

## [v0.3.12]
> June 3, 2016

- **Feature:** `invokeAction` now optionally passes default data with the use of `includeDefault`

[v0.3.12]: https://github.com/netarc/refrax/compare/v0.3.11...v0.3.12

## [v0.3.11]
> June 2, 2016

- **Feature:** Add status queries to Action objects
- **BugFix:** Fix hasData/isStale status queries via React components
- **Minor:** Re-enable invalidation option on Resource constructor

[v0.3.11]: https://github.com/netarc/refrax/compare/v0.3.10...v0.3.11

## [v0.3.10]
> May 31, 2016

- **Feature:** React component Status mixin now queries Action as well

[v0.3.10]: https://github.com/netarc/refrax/compare/v0.3.9...v0.3.10

## [v0.3.9]
> May 30, 2016

- **Bugfix:** Refactor ResourceDescriptor to properly handle query params
- **Bugfix:** Fix query cache updates

[v0.3.9]: https://github.com/netarc/refrax/compare/v0.3.8...v0.3.9

## [v0.3.8]
> May 30, 2016

- **Feature:** Add FormData conversion for payloads that contain File data
- **Bugfix:** Fix collection cache timestamp set
- **Minor:** Change `isLoading` behavior to just check timestamp
- **Minor:** General cleanup & refactoring

[v0.3.8]: https://github.com/netarc/refrax/compare/v0.3.6...v0.3.8

## [v0.3.6]
> May 27, 2016

- **Feature:** Add invalidate helper to SchemaNodeAccessor
- **Feature:** Add ResourceBase options passthrough via params

[v0.3.6]: https://github.com/netarc/refrax/compare/v0.3.5...v0.3.6

## [v0.3.5]
> May 27, 2016

- **Bugfix:** Fix null descriptor in Store notify

[v0.3.5]: https://github.com/netarc/refrax/compare/v0.3.4...v0.3.5

## [v0.3.4]
> May 27, 2016

- **Feature:** Store events now emit event data
- **Bugfix:** Invalidate will properly invalidate collections off a resource
- **Minor:** Invalidate noPropagate only affects Resource

[v0.3.4]: https://github.com/netarc/refrax/compare/v0.3.3...v0.3.4

## [v0.3.3]
> May 27, 2016

- **Bugfix:** Descriptor no longer carries over partial resolve

[v0.3.3]: https://github.com/netarc/refrax/compare/v0.3.2...v0.3.3

## [v0.3.2]
> May 26, 2016

- **Bugfix:** ResourceBase now consumes objects as Parameters

[v0.3.2]: https://github.com/netarc/refrax/compare/v0.3.1...v0.3.2

## [v0.3.1]
> May 26, 2016

- **Bugfix:** Action mutable dispatching `change` event unless specified to not do so
- **Bugfix:** Action invocation properly dispatching `change` when complete

[v0.3.1]: https://github.com/netarc/refrax/compare/v0.3.0...v0.3.1

## [v0.3.0]
> May 25, 2016

- **Feature:** Action `data` prototype accessor added
- **Feature:** `Resource.invalidate` is scoped to the invoked Resource now
- **Feature:** MutableResource `getErrors` will now return all errors when no parameter is passed
- **Minor:** General cleanup & refactoring

[v0.3.0]: https://github.com/netarc/refrax/compare/v0.2.0...v0.3.0

## [v0.2.0]
> May 19, 2016

- **Feature:** Both Action & ActionInstance are mutable
- **Feature:** Add Schema `inspect` method
- **Feature:** Add `addDetachedLeaf` to Schema Accessors
- **Feature:** Add `isPending` status query to React mixin
- **Minor:** General cleanup & refactoring

[v0.2.0]: https://github.com/netarc/refrax/compare/v0.1.0...v0.2.0
