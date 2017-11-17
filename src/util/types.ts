/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// import { BaseAdapter } from '../adapters/base';
import { ResourceDescriptor } from '../resource/descriptor';
import { RefraxPath } from '../resource/path';
// import { Store } from '../resource/store';
import {
  ComposableHash,
  RefraxOptions,
  RefraxParameters,
  RefraxQueryParameters
} from './composableHash';

export const enum IActionType {
  get = 'get',
  create = 'post',
  update = 'put',
  delete = 'delete',
  inspect = 'inspect'
}

export const enum IStoreEvent {
  touch = 'touch',
  update = 'update',
  destroy = 'destroy',
  invalidate = 'invalidate'
}

export const enum IStatus {
  complete = 'complete',
  partial = 'partial',
  stale = 'stale'
}

export const enum ITimestamp {
  stale = -1,
  loading = 0
}

export const enum IClassification {
  schema = 'schema',
  collection = 'collection',
  item = 'item',
  resource = 'resource',
  namespace = 'namespace'
}

export const enum IStrategy {
  replace = 'replace',
  merge = 'merge'
}
export interface IKeyValue {
  [key: string]: any;
}

export interface IAdapterResponse extends IKeyValue {
  status: number;
  data: any;
  request: {
    [key: string]: any;
    url: string;
  };
}

export interface IResponseHandlerResult {
  type: string;
  partial: string;
  data: any;
}
export type TResponseHandler = (descriptor: ResourceDescriptor, data: any) => IResponseHandlerResult;

export type TRequestResult = [any, IAdapterResponse, ResourceDescriptor];

export type TComposableHashHook = (result?: IKeyValue, self?: any) => (object | void | null);
export type TComposableHashParam = TComposableHashHook | object | ComposableHash | null | undefined;

export interface IStatusResource {
  isLoading(): boolean;
  hasData(): boolean;
  isStale(): boolean;
}

export interface IStatusActionable extends IStatusResource {
  isPending(): boolean;
}

export type TDescriptorRequestHook = (data: IKeyValue | any[],
                                      response: IAdapterResponse,
                                      descriptor: ResourceDescriptor) => (IKeyValue | any[] | void);

export type TStackItem = string | IKeyValue | RefraxPath |
                         RefraxOptions | RefraxParameters | RefraxQueryParameters;

export type TResourceArgument = string | IKeyValue | RefraxPath |
                                RefraxOptions | RefraxParameters | RefraxQueryParameters |
                                null;
