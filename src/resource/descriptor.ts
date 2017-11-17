/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BaseAdapter } from '../adapters/base';
import { SchemaNode } from '../schema/node';
import { Store } from '../store/store';
import { StoreMap } from '../store/storeMap';
import {
  RefraxOptions,
  RefraxParameters,
  RefraxQueryParameters
} from '../util/composableHash';
import RefraxConfig from '../util/config';
import {
  each,
  extend,
  invariant,
  isArray,
  isPlainObject,
  map,
  select
} from '../util/tools';
import {
  IActionType ,
  IClassification,
  IKeyValue,
  IStrategy
} from '../util/types';
import { RefraxPath } from './path';

const GlobalStoreMap = new StoreMap();

interface IResolver {
  errorOnInvalid: boolean;
  paramId: string | null;
  lastURIParamId: string | null;
  paramMap: IKeyValue;
  queryParams: IKeyValue;
  paths: string[];
  collectionPaths: string[];
  appendPaths: RefraxPath[];
  navPaths: string[];
  pathErrors: any[];
  store: Store | string | null;
  storeMap: StoreMap | null;
}

// simple-depth serialize to avoid circular references for error debugging
const serializer = (): ((key: string, value: any) => any) => {
  const stack: any[] = [];

  return function(this: any, _key: string, value: any): any {
    if (stack.length > 0) {
      if (stack.indexOf(this) === -1 && typeof(value) === 'object') {
        return '...';
      }
    }
    else {
      stack.push(value);
    }

    return value;
  };
};

const fillURI = (uri: string, params: IKeyValue, paramMap: IKeyValue): IKeyValue => {
  const vars = uri.match(/:(\w+)/g) || [];
  const paramsUsed: IKeyValue = {};
  let value;
  let param: string | null = null;
  const errors: string[] = [];

  for (const v of vars) {
    param = v.substr(1);
    if (paramMap && paramMap[param]) {
      param = paramMap[param];
    }

    paramsUsed[param!] = params[param!];
    if ((value = params[param!])) {
      uri = uri.replace(v, value);
    }
    else {
      errors.push(param!);
      uri = uri.replace(v, ':' + param);
    }
  }

  return {
    paramsUsed,
    lastParamKey: param,
    uri,
    errors
  };
};

const encodeURIValue = (value: any): string => {
  if (isPlainObject(value)) {
    value = JSON.stringify(value);
  }

  return global.encodeURIComponent(value);
};

const encodeURIData = (data: any): string => {
  const result: string[] = [];

  each(data || [], (value: any, key: string) => {
    if (isArray(value)) {
      each(value, (v: any) => {
        result.push(`${key}[]=${encodeURIValue(v)}`);
      });
    }
    else {
      result.push(`${key}=${encodeURIValue(value)}`);
    }
  });

  return result.length > 0 ? '?' + result.join('&') : '';
};

const resetScope = (resourceDescriptor: ResourceDescriptor, resolver: IKeyValue): void => {
  resourceDescriptor.classify = IClassification.resource;
  resourceDescriptor.partial = RefraxConfig.defaultFragment;
  resourceDescriptor.fragments = [];

  resolver.store = null;
  resolver.paramId = null;
};

const resolveOptions = (resourceDescriptor: ResourceDescriptor, resolver: IKeyValue, options: IKeyValue): void => {
  if (options.store) {
    resolver.store = options.store;
  }

  if (options.paramMap) {
    extend(resolver.paramMap, options.paramMap);
  }

  if (options.paramId) {
    resolver.paramId = resolver.paramId;
  }

  resourceDescriptor.partial = options.partial || RefraxConfig.defaultFragment;
  resourceDescriptor.fragments = options.fragments || [];

  if (options.cacheStrategy) {
    resourceDescriptor.cacheStrategy = options.cacheStrategy;
  }

  if (options.collectionStrategy) {
    resourceDescriptor.collectionStrategy = options.collectionStrategy;
  }

  if (typeof(options.errorOnInvalid) === 'boolean') {
    resolver.errorOnInvalid = options.errorOnInvalid;
  }
};

const resolveStack = (resolver: IResolver,
                      invoker: any,
                      resourceDescriptor: ResourceDescriptor,
                      stack: any[]): void => {
  for (const item of stack) {
    invariant(Boolean(item), `resolveStack: Found null stack element in stack \`${JSON.stringify(stack)}\``);

    if (item instanceof SchemaNode) {
      if (item.type === IClassification.schema) {
        resourceDescriptor.adapter = item.definition.adapter;
      }

      if (item.type !== IClassification.item) {
        resetScope(resourceDescriptor, resolver);
      }

      resourceDescriptor.classify = item.type;

      if (item.definition.storeMap) {
        resolver.storeMap = item.definition.storeMap;
      }

      resolveOptions(resourceDescriptor, resolver, item.definition);
    }
    else if (item instanceof RefraxOptions) {
      resolveOptions(resourceDescriptor, resolver, item.compose(invoker));
    }
    else if (item instanceof RefraxParameters) {
      extend(resourceDescriptor.params, item.compose(invoker));
    }
    else if (item instanceof RefraxQueryParameters) {
      extend(resolver.queryParams, item.compose(invoker));
    }
    else if (item instanceof RefraxPath) {
      resolver.appendPaths.push(item);
    }
    else if (isPlainObject(item)) {
      extend(resourceDescriptor.payload, item);
    }
    else {
      invariant(false, `resolveStack: Unknown stack object \`${item}\``);
    }
  }
};

const resolvePaths = (resolver: IResolver, resourceDescriptor: ResourceDescriptor, stack: any[]): void => {
  for (const item of stack) {
    if (item instanceof SchemaNode) {
      const definition = item.definition;
      let result = null;

      resolver.navPaths.push(item.identifier);

      if (definition.path) {
        result = fillURI(definition.path, resourceDescriptor.params, resolver.paramMap);
      }
      else if (definition.paramId) {
        result = fillURI(':' + definition.paramId, resourceDescriptor.params, resolver.paramMap);
      }

      if (result) {
        resolver.pathErrors = resolver.pathErrors.concat(result.errors);
        resolver.paths.push(result.uri);
        resolver.lastURIParamId = result.lastParamKey;
        extend(resourceDescriptor.pathParams, result.paramsUsed);
      }

      if (item.type === IClassification.collection) {
        resolver.collectionPaths = ([] as string[]).concat(resolver.paths);
      }
    }
  }
};

/**
 * Given a stack representing a path in our Schema tree and options affecting it, we
 * reduce and resolve it down to a descriptor describing a resource.
 */
const processStack = (invoker: any, resourceDescriptor: ResourceDescriptor, stack: any[]): void => {
  const action = resourceDescriptor.action;
  const resolver: IResolver = {
    errorOnInvalid: action !== 'inspect',
    paramId: null,
    lastURIParamId: null,
    paramMap: {},
    queryParams: {},
    paths: [],
    collectionPaths: [],
    appendPaths: [],
    navPaths: [],
    pathErrors: [],
    store: null,
    storeMap: GlobalStoreMap
  };

  resolveStack(resolver, invoker, resourceDescriptor, stack);

  if (typeof(resolver.store) === 'string') {
    invariant(resolver.storeMap instanceof StoreMap, 'processStack: failed to find StoreMap');

    resourceDescriptor.store = resolver.storeMap!.getOrCreate(resolver.store);
    resourceDescriptor.type = resourceDescriptor.store!.definition.type;
  }
  else if (resolver.store instanceof Store) {
    resourceDescriptor.store = resolver.store;
    resourceDescriptor.type = resourceDescriptor.store.definition.type;
  }

  resolvePaths(resolver, resourceDescriptor, stack);

  resolver.appendPaths = map(
    select(resolver.appendPaths, (rPath: RefraxPath): boolean =>
      rPath.isModifier || !Boolean(resolver.paths.push(rPath.path))
    ),
    (rPath: RefraxPath): string => rPath.path
  );

  resourceDescriptor.navPath = resolver.navPaths.join('.');

  // If we have no base path's ignore pathing all together
  if (resolver.paths.length > 0) {
    const hostPath = RefraxConfig.hostname + '/';

    resourceDescriptor.basePath = resourceDescriptor.path = hostPath + resolver.paths.join('/');

    if (resolver.collectionPaths.length > 0) {
      resourceDescriptor.collectionPath = hostPath + resolver.collectionPaths.join('/');
    }

    if (resolver.appendPaths.length > 0) {
      resourceDescriptor.path += '/' + resolver.appendPaths.join('/');
    }

    if (action === IActionType.get) {
      // NOTE: we append QueryParams to both basePath & path since basePath is typically used
      //  for cache query reference and path is used as the actual request path
      const encodedQueryParams = encodeURIData(resolver.queryParams);
      resourceDescriptor.basePath += encodedQueryParams;
      resourceDescriptor.path += encodedQueryParams;
    }
  }

  resolver.paramId = resolver.paramId || resolver.lastURIParamId || 'id';
  if (resolver.paramMap[resolver.paramId]) {
    resolver.paramId = resolver.paramMap[resolver.paramId];
  }

  resourceDescriptor.id = (resourceDescriptor.id = resourceDescriptor.params[resolver.paramId!]) &&
                          ('' + resourceDescriptor.id) || null;
  resourceDescriptor.event = resourceDescriptor.id || resourceDescriptor.basePath || 'change';

  resourceDescriptor.fragments = resourceDescriptor.fragments.reverse();

  if (resolver.pathErrors.length > 0) {
    resourceDescriptor.valid = false;

    // tslint:disable-next-line:max-line-length
    invariant(!resolver.errorOnInvalid, `Failed to map path: \`${resourceDescriptor.path}\` using params: ${JSON.stringify(resourceDescriptor.params, serializer())}`);
  }
};

export interface IResourceDescriptor {
  action: IActionType;
  adapter: BaseAdapter | null;
  cacheStrategy: IStrategy;
  classify: IClassification;
  collectionStrategy: IStrategy;
  event: string | null;
  fragments: string[];
  id: string | null;
  navPath: string;
  path: string;
  basePath: string;
  collectionPath: string;
  params: IKeyValue;
  partial: string;
  pathParams: IKeyValue;
  payload: IKeyValue;
  queryParams: IKeyValue;
  store: Store | null;
  type: string | null;
  valid: boolean;
}

export class ResourceDescriptor implements IResourceDescriptor {
  static storeMap: StoreMap = GlobalStoreMap;

  static idFrom(target: IKeyValue): string | null {
    return target && target.id && ('' + target.id);
  }

  action: IActionType;
  adapter: BaseAdapter | null;
  cacheStrategy: IStrategy;
  classify: IClassification;
  collectionStrategy: IStrategy;
  event: string | null;
  fragments: string[];
  id: string | null;
  navPath: string;
  path: string;
  basePath: string;
  collectionPath: string;
  params: IKeyValue;
  partial: string;
  pathParams: IKeyValue;
  payload: IKeyValue;
  queryParams: IKeyValue;
  store: Store | null;
  type: string | null;
  valid: boolean;

  constructor(invoker: any, action: IActionType = IActionType.get, stack: any[] = []) {
    this.action = action;
    this.adapter = null;
    this.cacheStrategy = IStrategy.replace;
    this.classify = IClassification.resource;
    this.collectionStrategy = action === IActionType.create ? IStrategy.merge : IStrategy.replace;
    this.event = null;
    this.fragments = [];
    this.id = null;
    this.params = {};
    this.partial = RefraxConfig.defaultFragment;
    this.pathParams = {};
    this.payload = {};
    this.queryParams = {};
    this.store = null;
    this.type = null;
    this.valid = true;

    if (!isArray(stack)) {
      stack = [stack];
    }

    processStack(invoker, this, stack);
  }
}
