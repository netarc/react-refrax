/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Promise from 'bluebird';

import { BaseAdapter } from '../adapters/base';
import { processResponse } from '../response/processResponse';
import { RequestError } from '../util/requestError';
import { invariant, isPromise } from '../util/tools';
import {
  // @ts-ignore - Exported variable .. cannot be named https://github.com/Microsoft/TypeScript/issues/9944
  IAdapterResponse,
  IKeyValue,
  TDescriptorRequestHook,
  TRequestResult
} from '../util/types';
import { ResourceDescriptor } from './descriptor';

// We only quietly consume RequestError's
Promise.onPossiblyUnhandledRejection((err: any, _promise: Promise<any>) => {
  if (err instanceof RequestError) {
    return;
  }
  throw err;
});

export const requestForDescriptor = (descriptor: ResourceDescriptor,
                                     options: IKeyValue = {},
                                     callback?: TDescriptorRequestHook | null): Promise<TRequestResult> => {
  const store = descriptor.store;

  invariant(Boolean(descriptor.adapter), 'requestForDescriptor: no adapter specified');
  invariant(descriptor.adapter instanceof BaseAdapter,
    `requestForDescriptor: expected BaseAdapter base but found \`${descriptor.adapter!.constructor.name}\``
  );

  let promise = descriptor.adapter!.invoke(descriptor, options);

  // Callback acts as a way to inject into our request and modify the result or
  // perform some action before the result feeds into processResponse.
  if (callback) {
    // tslint:disable-next-line:max-line-length
    promise = promise.then(([data, response, _descriptor]: TRequestResult): TRequestResult | Promise<TRequestResult> => {
      let result = callback(data, response, _descriptor);

      if (result === undefined) {
        result = data;
      }
      // If our result is a promise, lets chain off it to ensure we return the expected tuple
      else if (isPromise(result)) {
        return (result as Promise<any>).then((_data: any): TRequestResult =>
          [_data, response, _descriptor]);
      }

      return [result, response, _descriptor];
    });
  }

  return promise
    .then(([data, response, _descriptor]: TRequestResult): TRequestResult => {
      processResponse(_descriptor, data, null, options);

      const result = store && store.fetchResource(_descriptor) || {};

      return [result, response, _descriptor];
    })
    // We deliberately catch after our processResponse so we can more gracefully
    // reset to a finished state (timestamp)
    .catch((err: any) => {
      if (store) {
        store.touchResource(descriptor, { timestamp: Date.now() }, options);
      }
      throw err;
    });
};
