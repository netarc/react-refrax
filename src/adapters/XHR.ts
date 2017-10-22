/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Axios, { AxiosResponse } from 'axios';
import * as Promise from 'bluebird';

import { ResourceDescriptor } from 'resource/descriptor';
import { RequestError } from 'util/requestError';
import { any, each, invariant } from 'util/tools';
import {
  IActionType,
  IAdapterResponse,
  IKeyValue,
  IStatus,
  ITimestamp,
  TRequestResult
} from 'util/types';
import { BaseAdapter } from './base';

const containsMultipart = (data: IKeyValue) =>
  data && any(data, (value: any) =>
    (global as any).File && value instanceof (global as any).File);

const composeFormData = (data: IKeyValue) => {
  const result = new (global as any).FormData();

  each(data, (value: any, key: string) => {
    result.append(key, value);
  });

  return result;
};

export class XHRAdapter extends BaseAdapter {
  invoke(this: this, descriptor: ResourceDescriptor, options: IKeyValue = {}): Promise<TRequestResult> {
    invariant(descriptor instanceof ResourceDescriptor,
      `xhrAdapter expected descriptor, but found \`${descriptor}\``
    );

    const store = descriptor.store;
    const touchParams: IKeyValue = {
      timestamp: ITimestamp.loading
    };
    const requestConfig: IKeyValue = {
      method: descriptor.action,
      url: descriptor.path
    };

    if (descriptor.action === IActionType.get) {
      touchParams.status = IStatus.stale;
    }
    else {
      requestConfig.data = descriptor.payload;

      if (containsMultipart(requestConfig.data)) {
        requestConfig.data = composeFormData(requestConfig.data);
      }
    }

    if (store) {
      store.touchResource(descriptor, touchParams, options);
    }

    return new Promise((resolve: (result: TRequestResult) => void, reject: (err: any) => void) => {
      Axios(requestConfig)
        .then((response: AxiosResponse) => {
          resolve([response.data || null, response as any as IAdapterResponse, descriptor]);
        }, (err: any) => {
          // Convert errors that look like Axios request errors into Refrax request errors
          if ('request' in err && 'response' in err) {
            reject(new RequestError(err.response));
          }
          else {
            reject(err);
          }
        });
    });
  }
}
