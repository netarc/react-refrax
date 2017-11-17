/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Promise from 'bluebird';

import { ResourceDescriptor } from '../resource/descriptor';
import { RequestError } from '../util/requestError';
import { extend, invariant } from '../util/tools';
import {
  IActionType,
  IAdapterResponse,
  IClassification,
  IKeyValue
} from '../util/types';
import { BaseAdapter, IStorage } from './base';

const decodeGet = (localStorage: IStorage, key: string): object =>
  JSON.parse(localStorage.getItem(key));

const encodeSet = (localStorage: IStorage, key: string, data: object | any[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getCollection = (localStorage: IStorage, key: string): IKeyValue =>
  decodeGet(localStorage, key) || { list: [], guid: 0 };

// tslint:disable-next-line:prefer-template
const asString = (value: any): string => ('' + value);

// Essentially just blindly accepts data and uses merge/replace strategies where applicable
export class LocalStorageAdapter extends BaseAdapter {
  storage: IStorage;

  constructor(config: IKeyValue = {}) {
    super(config);

    this.storage = (global as any).localStorage ||
      ((global as any).window && (global as any).window.localStorage);
  }

  invoke(this: this, descriptor?: ResourceDescriptor, _options: IKeyValue = {}): Promise<any> {
    if (!(descriptor instanceof ResourceDescriptor)) {
      throw new TypeError(
        `StorageAdapter expected descriptor, but found \`${descriptor}\``
      );
    }

    // tslint:disable-next-line:max-line-length
    invariant(Boolean(this.storage), 'LocalStorageAdapter no storage reference found via global.localStoarge & window.localStorage');

    const response: IAdapterResponse = {
      data: null,
      status: 200,
      request: {
        url: descriptor.basePath
      }
    };

    if (descriptor.action === IActionType.get) {
      return this._invokeGet(descriptor, this.storage, response);
    }
    else if (descriptor.action === IActionType.create ||
             descriptor.action === IActionType.update) {
      return this._invokeModify(descriptor, this.storage, response);
    }
    else if (descriptor.action === IActionType.delete) {
      return this._invokeDestroy(descriptor, this.storage, response);
    }
    else {
      throw new TypeError(
        `StorageAdapter unexpected descriptor action \`${descriptor.action}\``
      );
    }
  }

  _invokeGet(this: this,
             descriptor: ResourceDescriptor,
             storage: IStorage,
             response: IAdapterResponse): Promise<any> {
    const result = descriptor.classify === IClassification.collection ?
      getCollection(storage, descriptor.basePath).list : decodeGet(storage, descriptor.basePath);

    if (!result) {
      // tslint:disable-next-line:no-magic-numbers
      response.status = 404;

      return Promise.reject(new RequestError(response));
    }

    response.data = result;

    return Promise.resolve([response.data, response, descriptor]);
  }

  _invokeModify(this: this,
                descriptor: ResourceDescriptor,
                storage: IStorage,
                response: IAdapterResponse): Promise<any> {
    let data = descriptor.payload;

    if (descriptor.classify === IClassification.collection) {
      const collection = getCollection(storage, descriptor.collectionPath);

      if (descriptor.action === IActionType.create) {
        data = extend({}, data, { id: ++collection.guid });
        collection.list.push(data);
        encodeSet(storage, `${descriptor.collectionPath}/${data.id}`, data);
      }
      else {
        collection.list = data;

        let maxId = collection.guid;
        const collectionSize = collection.list.length;
        // Apply each item in the array into item spots based on collectionPath
        for (let i = 0; i < collectionSize; i++) {
          let item = collection.list[i];

          if (item.id) {
            const itemKey = `${descriptor.collectionPath}/${item.id}`;
            const existingItem = decodeGet(storage, itemKey) || {};

            collection.list[i] = item = extend(item, existingItem);
            encodeSet(storage, `${descriptor.collectionPath}/${item.id}`, item);

            // Attempt to maintain a proper GUID
            if (item.id > maxId) {
              maxId = item.id;
            }
          }
        }

        collection.guid = maxId;
      }

      encodeSet(storage, descriptor.basePath, collection);
    }
    else if (descriptor.classify === IClassification.item) {
      const collection = getCollection(storage, descriptor.collectionPath);

      // It's not really "proper" to create on the ITEM endpoint itself but we do it anyways..
      if (descriptor.action === IActionType.create) {
        // tslint:disable-next-line:no-magic-numbers
        data = extend({}, data, { id: (parseInt('' + descriptor.id, 10) || ++collection.guid) });
        collection.list.push(data);
        encodeSet(storage, `${descriptor.collectionPath}/${data.id}`, data);
      }

      let i;
      let maxId = collection.guid;
      const collectionSize = collection.list.length;
      for (i = 0; i < collectionSize; i++) {
        const item = collection.list[i];

        if (asString(item.id) === asString(descriptor.id)) {
          data = collection.list[i] = extend(item, data);
          encodeSet(storage, descriptor.basePath, data);

          // Attempt to maintain a proper GUID
          if (item.id > maxId) {
            maxId = item.id;
          }
          break;
        }
      }
      if (i >= collectionSize) {
        collection.list.push(data);

        if (data.id && data.id > maxId) {
          maxId = data.id;
        }
      }
      collection.guid = maxId;

      encodeSet(storage, descriptor.collectionPath, collection);
      encodeSet(storage, descriptor.basePath, data);
    }
    else {
      encodeSet(storage, descriptor.basePath, data);
    }

    response.data = data;

    return Promise.resolve([response.data, response, descriptor]);
  }

  _invokeDestroy(this: this,
                 descriptor: ResourceDescriptor,
                 storage: IStorage,
                 response: IAdapterResponse): Promise<any> {
    if (descriptor.classify === IClassification.item) {
      const collection = getCollection(storage, descriptor.collectionPath);

      const collectionSize = collection.list.length;
      for (let i = 0; i < collectionSize; i++) {
        const item = collection.list[i];

        if (asString(item.id) === asString(descriptor.id)) {
          collection.list.splice(i, 1);
          encodeSet(storage, descriptor.collectionPath, collection);
          break;
        }
      }
    }

    storage.removeItem(descriptor.basePath);

    return Promise.resolve([response.data, response, descriptor]);
  }
}
