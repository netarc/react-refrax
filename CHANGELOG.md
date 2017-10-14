# Unreleased

## [v0.7.0]
- **Major** Removed addons (React) support to external lib `refrax-react`


# Released

## [v0.6.0](https://github.com/netarc/refrax/compare/v0.6.0...v0.6.1)
> Octobober 13, 2017

- **Bugfix** Mutable `setState` this reference
- **Minor** ResourceDescriptor now uses a default global `storeMap`
- **Major** Refactor store events to fully represent fragment/queries
- **Major** `Resource.fetch` and `MutableResource` methods promise value now is a tuple consisting of [result/response/descriptor]
- **Major** Added RefraxReact `createContainer` to supersede it's `Mixin` use
- **Feature** Added Schema `adapter` support with `XHRAdapter` / `LocalStorageAdapter` / `SessionStorageAdapter`

## [v0.6.0](https://github.com/netarc/refrax/compare/v0.5.16...v0.6.0)
> June 20, 2017

- **Feature** Added Schema class
- **Major** Refactor Schema to be instance based instead of a singleton
- **Major** Schema Collection/Resource no longer creates a Store when not supplied and instead delegates that responsibility to the Schema
- **Minor** Rename SchemaPath `uri` option to `path`
- **Minor** Cleanup SchemaPath tests
- **Bugfix** ActionEntity no longer attempts to process caught exceptions that are not RequestError's
- **Minor** Cleanup ResourceDescriptor logic
- **Minor** Rework SchemPath `invalidate` and added `invalidateLeafs`
- **Minor** Removed TreeNode and consolidated into SchemaNode
- **Major** Removed Store managing a global list of stores (now managed by a Schema StoreMap)
- **Major** Store no longer has `get` / `reset`, these are now on the Schema

## [v0.5.15](https://github.com/netarc/refrax/compare/v0.5.14...v0.5.15)
> June 13, 2017

- **Feature** Mutable `getErrors` support deep attributes

## [v0.5.14](https://github.com/netarc/refrax/compare/v0.5.13...v0.5.14)
> June 9, 2017

- **Bugfix** Mutable `set` no longer converts falsey strings to `null`
- **Bugfix** Mutable `set` accepts IE formatted events
- **Feature** Mutable `set` / `setter` now support deep attributes (cancellable with `option.shallow = true`)

## [v0.5.13](https://github.com/netarc/refrax/compare/v0.5.12...v0.5.13)
> May 8, 2017

- **Minor** Updated `isPlainObject` to check falseyness first to prevent null call
- **Minor** `processRequestSuccess` will now default falsey data to an empty value based on its classification

## [v0.5.12](https://github.com/netarc/refrax/compare/v0.5.11...v0.5.12)
> April 27, 2017

- **Minor** Updated `FragmentCache` to match param stripped query path so generic descriptors will aggressively match

## [v0.5.11](https://github.com/netarc/refrax/compare/v0.5.10...v0.5.11)
> April 18, 2017

- **Minor** Added `RefraxTreeNode` type and removed `classify` from `RefraxTreeNode` definitions
- **Bugfix** RefraxReact components `componentWillUnmount` will no longer lose itself via `this`

## [v0.5.10](https://github.com/netarc/refrax/compare/v0.5.9...v0.5.10)
> February 15, 2017

- **Bugfix** Handling of `axios` request error to properly fetch response object
- **Minor** Updated `._state` access in `mixinMutable` to be off `this._mutable` reference

## [v0.5.9](https://github.com/netarc/refrax/compare/v0.5.8...v0.5.9)
> January 31, 2017

- **Minor** Updated `axios` dependency version

## [v0.5.8](https://github.com/netarc/refrax/compare/v0.5.7...v0.5.8)
> January 24, 2017

- **Major** Attaching an action to a component through `RefraxReact` will implicitly share action instances

## [v0.5.7](https://github.com/netarc/refrax/compare/v0.5.6...v0.5.7)
> December 16, 2016

- **Bugfix** `.data` access on a `Mutable` will no longer disturb its state prototype

## [v0.5.6](https://github.com/netarc/refrax/compare/v0.5.5...v0.5.6)
> December 14, 2016

- **Minor** Add `Disposable` and rework Resource disposable handling
- **Feature** Add `Mutable` helepr methods `unsetErrors`, `setErrors`, `isMutated`

## [v0.5.5](https://github.com/netarc/refrax/compare/v0.5.4...v0.5.5)
> November 17, 2016

- **Bugfix** `mixinMutable` will now correctly `unset` state on its base when used with prototypes
- **Minor** Action invoke now will `unset` it mutable state when successful

## [v0.5.4](https://github.com/netarc/refrax/compare/v0.5.3...v0.5.4)
> November 16, 2016

- **Feature** Add `onSet` hook option to `mixinMutable` `set`/`setter`
- **Feature** Add `set` option to `mixinMutable` `set`/`setter`

## [v0.5.3](https://github.com/netarc/refrax/compare/v0.5.2...v0.5.3)
> November 14, 2016

- **Minor** Enhance `refKey` option on `RefraxReact` attach to safeguard cross action references and component detachment

## [v0.5.2](https://github.com/netarc/refrax/compare/v0.5.1...v0.5.2)
> November 14, 2016

- **Feature** Add `refKey` option to `RefraxReact` attach to create a shared `Action` instance reference sharing the same `refKey`

## [v0.5.1](https://github.com/netarc/refrax/compare/v0.5.0...v0.5.1)
> November 12, 2016

- **Minor** Refactor invokeDescriptor `fetch` into ResourceBase, providing it to `MutableResource`/`Action`
- **Minor** Upgraded `bluebird` dependency version

## [v0.5.0](https://github.com/netarc/refrax/compare/v0.4.10...v0.5.0)
> November 9, 2016

- **Major** Rewrite internal logic of Actions for an easier idiomatic approach to working with Action and changing of params/options
- **Feature** Add ActionInvoker `invalidate` helper method
- **Feature** Add SchemaNodeAccessor `enumerateLeafs` method
- **Feature** Add `invalidate` boolean option `cascade` to enumerate nested schema paths

## [v0.4.10](https://github.com/netarc/refrax/compare/v0.4.9...v0.4.10)
> September 10, 2016

- **Minor** Fix default import for `RefraxReact`
- **Minor** Fix SchemaNodeAccessor compareStack slicing bug

## [v0.4.9](https://github.com/netarc/refrax/compare/v0.4.8...v0.4.9)
> August 2, 2016

- **Minor** Pass `MutableResource` options into invocation methods

## [v0.4.8](https://github.com/netarc/refrax/compare/v0.4.7...v0.4.8)
> August 2, 2016

- **Minor** Remove `noPropagate` behavior from invoke fetch
- **Minor** Allow `null` values in an Action to override default values
- **Feature** Add `collectionStrategy` behavior for FragmentCache updating

## [v0.4.7](https://github.com/netarc/refrax/compare/v0.4.6...v0.4.7)
> July 25, 2016

- **Bugfix:** Fix Tools concatUnique consuming string key as array

## [v0.4.6](https://github.com/netarc/refrax/compare/v0.4.5...v0.4.6)
> July 25, 2016

- **Bugfix:** SchemaAccessor invalidate error when no options specified
- **Bugfix:** ResourceDescriptor not properly appending QueryParams to basePath
- **Minor:** FragmentCache returns ids affected on invalidate/update
- **Minor:** Tools concatUnique improved
- **Minor:** FragmentCache now concats id results (prev merge strategy)
- **Minor:** Resource will now invalidate prior to subscribing to descriptor Store

## [v0.4.5](https://github.com/netarc/refrax/compare/v0.4.4...v0.4.5)
> July 20, 2016

- **Bugfix:** Resource switches to passive when it detects resource destroy
- **Minor:** Rename Store event `type` to `action` and now `type` is the actual model type

## [v0.4.4](https://github.com/netarc/refrax/compare/v0.4.3...v0.4.4)
> July 15, 2016

- **Bugfix:** Fix SchemaNodeAccessor invalidate fetching data

## [v0.4.3](https://github.com/netarc/refrax/compare/v0.4.2...v0.4.3)
> July 8, 2016

- **Bugfix:** Fix bad param on descriptor processStack

## [v0.4.2](https://github.com/netarc/refrax/compare/v0.4.1...v0.4.2)
> July 6, 2016

- **Feature:** QueryParameters now encodes objects
- **Minor:** Rename Resource `query` utility method to `queryParams`

## [v0.4.1](https://github.com/netarc/refrax/compare/v0.4.0...v0.4.1)
> June 29, 2016

- **Bugfix:** Update FragmentCache to use descriptor classification when fetching data fixing an issue with resource type accessors

## [v0.4.0](https://github.com/netarc/refrax/compare/v0.3.20...v0.4.0)
> June 28, 2016

- **Feature:** Add `config`, `params`, `query` self chaining helper methods on ResourceBase
- **Feature:** Add `cacheStrategy` option to MutableResource to allow control over received data
- **Feature:** Add `invalidate` utility method for applying the same config to a list of items to invalidate
- **Minor:** Test updates surrounding FragmentCache
- **Bugfix:** Fix Resource not correctly updating cache on store change

## [v0.3.20](https://github.com/netarc/refrax/compare/v0.3.19...v0.3.20)
> June 22, 2016

- **BugFix:** Fix path handling from ResourceBase & Descriptor conversion

## [v0.3.19](https://github.com/netarc/refrax/compare/v0.3.18...v0.3.19)
> June 22, 2016

- **Feature:** FragmentCache now uses basePath instead of full path. MutableResource now consumes paths as modifiers (non basePath editing) and Resource consumes as non-modifier.

## [v0.3.18](https://github.com/netarc/refrax/compare/v0.3.17...v0.3.18)
> June 22, 2016

- **Minor:** ResourceBase consumes all objects into QueryParamter objects which nets the same functionality
- **Minor:** Descriptor now only consumes QueryParamter objects for its query params instead of payload data
- **Minor:** Export Parameters & Options classes

## [v0.3.17](https://github.com/netarc/refrax/compare/v0.3.16...v0.3.17)
> June 13, 2016

- **BugFix:** Resource will no longer get data on an update
- **BugFix:** FragmentCache update will properly update the timestamp on falsey data

## [v0.3.16](https://github.com/netarc/refrax/compare/v0.3.15...v0.3.16)
> June 8, 2016

- **Minor:** MutableResource action methods pass all arguments

## [v0.3.15](https://github.com/netarc/refrax/compare/v0.3.14...v0.3.15)
> June 8, 2016

- **Minor:** ResourceBase no longer consumes objects as params
- **Minor:** Action `.mutableFrom` consumes objects as params

## [v0.3.14](https://github.com/netarc/refrax/compare/v0.3.13...v0.3.14)
> June 6, 2016

- **Minor:** Resource constructor behavior now always consumes objects as params

## [v0.3.13](https://github.com/netarc/refrax/compare/v0.3.12...v0.3.13)
> June 3, 2016

- **Feature:** `noNotify` option support for store invalidation
- **Minor:** `params` option passing to Resource via SchemaNodeAccessor.invalidate
- **Minor:** Move partial default assignment to ResourceDescriptor instead of in FragmentCache

## [v0.3.12](https://github.com/netarc/refrax/compare/v0.3.11...v0.3.12)
> June 3, 2016

- **Feature:** `invokeAction` now optionally passes default data with the use of `includeDefault`

## [v0.3.11](https://github.com/netarc/refrax/compare/v0.3.10...v0.3.11)
> June 2, 2016

- **Feature:** Add status queries to Action objects
- **BugFix:** Fix hasData/isStale status queries via React components
- **Minor:** Re-enable invalidation option on Resource constructor

## [v0.3.10](https://github.com/netarc/refrax/compare/v0.3.9...v0.3.10)
> May 31, 2016

- **Feature:** React component Status mixin now queries Action as well

## [v0.3.9](https://github.com/netarc/refrax/compare/v0.3.8...v0.3.9)
> May 30, 2016

- **Bugfix:** Refactor ResourceDescriptor to properly handle query params
- **Bugfix:** Fix query cache updates

## [v0.3.8](https://github.com/netarc/refrax/compare/v0.3.6...v0.3.8)
> May 30, 2016

- **Feature:** Add FormData conversion for payloads that contain File data
- **Bugfix:** Fix collection cache timestamp set
- **Minor:** Change `isLoading` behavior to just check timestamp
- **Minor:** General cleanup & refactoring

## [v0.3.6](https://github.com/netarc/refrax/compare/v0.3.5...v0.3.6)
> May 27, 2016

- **Feature:** Add invalidate helper to SchemaNodeAccessor
- **Feature:** Add ResourceBase options passthrough via params

## [v0.3.5](https://github.com/netarc/refrax/compare/v0.3.4...v0.3.5)
> May 27, 2016

- **Bugfix:** Fix null descriptor in Store notify

## [v0.3.4](https://github.com/netarc/refrax/compare/v0.3.3...v0.3.4)
> May 27, 2016

- **Feature:** Store events now emit event data
- **Bugfix:** Invalidate will properly invalidate collections off a resource
- **Minor:** Invalidate noPropagate only affects Resource

## [v0.3.3](https://github.com/netarc/refrax/compare/v0.3.2...v0.3.3)
> May 27, 2016

- **Bugfix:** Descriptor no longer carries over partial resolve

## [v0.3.2](https://github.com/netarc/refrax/compare/v0.3.1...v0.3.2)
> May 26, 2016

- **Bugfix:** ResourceBase now consumes objects as Parameters

## [v0.3.1](https://github.com/netarc/refrax/compare/v0.3.0...v0.3.1)
> May 26, 2016

- **Bugfix:** Action mutable dispatching `change` event unless specified to not do so
- **Bugfix:** Action invocation properly dispatching `change` when complete

## [v0.3.0](https://github.com/netarc/refrax/compare/v0.2.0...v0.3.0)
> May 25, 2016

- **Feature:** Action `data` prototype accessor added
- **Feature:** `Resource.invalidate` is scoped to the invoked Resource now
- **Feature:** MutableResource `getErrors` will now return all errors when no parameter is passed
- **Minor:** General cleanup & refactoring

## [v0.2.0](https://github.com/netarc/refrax/compare/v0.1.0...v0.2.0)
> May 19, 2016

- **Feature:** Both Action & ActionInstance are mutable
- **Feature:** Add Schema `inspect` method
- **Feature:** Add `addDetachedLeaf` to Schema Accessors
- **Feature:** Add `isPending` status query to React mixin
- **Minor:** General cleanup & refactoring
