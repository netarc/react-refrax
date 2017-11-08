/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Disposable } from './util/disposable';
import * as Tools from './util/tools';
import * as Constants from './util/types';

export * from './util/disposable';
export * from './actions/action';

// export const ActionEntity = require('RefraxActionEntity');
// export const Config = require('RefraxConfig');
// export const MutableResource = require('MutableResource');
// // export const Options = require('RefraxOptions');
// // export const Parameters = require('RefraxParameters');
// export const Resource = require('RefraxResource');
// export const Schema = require('Schema');
// export const SchemaPath = require('schema/path');
// export const Store = require('store/store');
// // export const Tools = require('tools');
// // export const createAction = require('createAction');
// export const createSchemaCollection = require('schema/createSchemaCollection');
// export const createSchemaNamespace = require('createSchemaNamespace');
// export const createSchemaResource = require('schema/createSchemaResource');
// export const invalidate = require('invalidateHelper');
// export const processResponse = require('processResponse');

export {
  Tools,
  Disposable,
  Constants
};

/*
export namespace Refrax {
  // export class Foo {
  // };

  // export const Disposable = _Disposable;
  // export const CompoundDisposable = _CompoundDisposable;

  export interface IPromise { }

  // TODO: do we need all these to be interfaces once we migrate to TS?

  // export interface IDisposable {
  //   (): void;
  //   disposed: boolean;
  // }

  export interface IResource {
  }

  export interface IEventable {
    subscribe(event: string, callback: Function, context?: any): Disposable;
    once(event: string, callback: Function, context?: any): Disposable;
    emit(event: string, ...args: any[]): boolean;
  }

  export interface IComposableHash {
    [index: string]: any;

    __weakHooks: Function[];
    __hooks: Function[];
    __isWeak: boolean;

    weakify: (...args: any[]) => IComposableHash;
    clone: (...args: any[]) => IComposableHash;
    extend: (...args: any[]) => IComposableHash;
    hook: (...args: (() => object)[]) => IComposableHash;
    compose: (target: any) => object;
  }
  export interface IOptions extends IComposableHash { }
  export interface IParameters extends IComposableHash { }
  export interface IQueryParameters extends IComposableHash { }
  export interface Configurable {
    _options: IOptions;
    _parameters: IParameters;
    _queryParams: IQueryParameters;
    clone?: () => Configurable;
    withOptions: (...args: any[]) => Configurable;
    withParams: (...args: any[]) => Configurable;
    withQueryParams: (...args: any[]) => Configurable;
    seIKeyValue: (...args: any[]) => Configurable;
    setParams: (...args: any[]) => Configurable;
    setQueryParams: (...args: any[]) => Configurable;
  }

  export type ActionParam = IOptions | IParameters | IQueryParameters | string | object;
  export interface IAction extends Configurable, IEventable {
    (...ags: ActionParam[]): IPromise;

    clone: () => IAction;
    coextend: () => IAction;

    attached: boolean;
  }

  export interface IStore { }

  export interface ISchemaPath extends Configurable {
    enumerateLeafs(iteratee: (key: string, path: ISchemaPath) => void): void;
    inspect(result?: object): object;
    invalidate(options?: object): void;
    invalidateLeafs(options?: object): void;

    addLeaf(leaf: ISchemaPath): ISchemaPath;
    addLeaf(identifier: string, leaf: ISchemaPath): ISchemaPath;
    addDetachedLeaf(leaf: ISchemaPath): ISchemaPath;
    addDetachedLeaf(identifier: string, leaf: ISchemaPath): ISchemaPath;

    addCollection(path: string, options?: object): ISchemaPath;
    addCollection(path: string, store?: IStore, options?: object): ISchemaPath;
    addResource(path: string, options?: object): ISchemaPath;
    addResource(path: string, store?: IStore, options?: object): ISchemaPath;
    addNamespace(path: string, options?: object): ISchemaPath;
  }
}
*/

// export = Refrax;

// export default {
//   ActionEntity: require('RefraxActionEntity'),
//   Config: require('RefraxConfig'),
//   Constants: require('RefraxConstants'),
//   MutableResource: require('MutableResource'),
//   Options: require('RefraxOptions'),
//   Parameters: require('RefraxParameters'),
//   Resource: require('RefraxResource'),
//   Schema: require('Schema'),
//   SchemaPath: require('schema/path'),
//   Store: require('store/store'),
//   Tools: require('tools'),
//   createAction: require('createAction'),
//   createSchemaCollection: require('schema/createSchemaCollection'),
//   createSchemaNamespace: require('createSchemaNamespace'),
//   createSchemaResource: require('schema/createSchemaResource'),
//   invalidate: require('invalidateHelper'),
//   processResponse: require('processResponse')
// };
