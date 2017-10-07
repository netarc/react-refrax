/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Promise = require('bluebird');
const RequestError = require('RequestError');
const RefraxResourceDescriptor = require('RefraxResourceDescriptor');
const RefraxAdapter = require('RefraxAdapter');
const RefraxTools = require('RefraxTools');
const RefraxConstants = require('RefraxConstants');
const ACTION_GET = RefraxConstants.action.get;
const ACTION_CREATE = RefraxConstants.action.create;
const ACTION_UPDATE = RefraxConstants.action.update;
const ACTION_DELETE = RefraxConstants.action.delete;
const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const CLASSIFY_ITEM = RefraxConstants.classify.item;


function decodeGet(localStorage, key) {
  return JSON.parse(localStorage.getItem(key));
}

function encodeSet(localStorage, key, data) {
  return localStorage.setItem(key, JSON.stringify(data));
}

function getCollection(localStorage, key) {
  return decodeGet(localStorage, key) || { list: [], guid: 0 };
}

function asString(value) {
  return ('' + value);
}

// Essentially just blindly accepts data and uses merge/replace strategies where applicable
class LocalStorageAdapter extends RefraxAdapter {
  constructor(config = {}) {
    super(config);

    this.storage = global.localStorage || global.window && global.window.localStorage;
  }

  invoke(descriptor, options = {}) {
    if (!(descriptor instanceof RefraxResourceDescriptor)) {
      throw new TypeError(
        `StorageAdapter expected descriptor, but found \`${descriptor}\``
      );
    }

    const storage = this.storage;
    if (!storage) {
      throw new ReferenceError(
        'StorageAdapter no storage reference'
      );
    }

    const response = {
      data: null,
      status: 200,
      request: {
        url: descriptor.basePath
      }
    };
    let result = null;

    if (descriptor.action === ACTION_GET) {
      if (descriptor.classify === CLASSIFY_COLLECTION) {
        result = getCollection(storage, descriptor.basePath).list;
      }
      else {
        result = decodeGet(storage, descriptor.basePath);
      }

      if (!result) {
        response.status = 404;
        return Promise.reject(new RequestError(response));
      }

      response.data = result;
      return Promise.resolve([response.data, response, descriptor]);
    }
    else if (descriptor.action === ACTION_CREATE ||
             descriptor.action === ACTION_UPDATE) {
      let data = descriptor.payload;

      if (descriptor.classify === CLASSIFY_COLLECTION) {
        const collection = getCollection(storage, descriptor.collectionPath);

        if (descriptor.action === ACTION_CREATE) {
          data = RefraxTools.extend({}, data, { id: ++collection.guid });
          collection.list.push(data);
          encodeSet(storage, descriptor.collectionPath + '/' + data.id, data);
        }
        else {
          collection.list = data;

          let maxId = collection.guid;
          // Apply each item in the array into item spots based on collectionPath
          for (let i = 0, length = collection.list.length; i < length; i++) {
            let item = collection.list[i];

            if (item.id) {
              const itemKey = descriptor.collectionPath + '/' + item.id;
              const existingItem = decodeGet(storage, itemKey) || {};

              collection.list[i] = item = RefraxTools.extend(item, existingItem);
              encodeSet(storage, descriptor.collectionPath + '/' + item.id, item);

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
      else if (descriptor.classify === CLASSIFY_ITEM) {
        const collection = getCollection(storage, descriptor.collectionPath);

        // It's not really "proper" to create on the ITEM endpoint itself but we do it anyways..
        if (descriptor.action === ACTION_CREATE) {
          data = RefraxTools.extend({}, data, { id: (parseInt(descriptor.id, 10) || ++collection.guid) });
          collection.list.push(data);
          encodeSet(storage, descriptor.collectionPath + '/' + data.id, data);
        }

        let maxId = collection.guid
          , i
          , length;
        for (i = 0, length = collection.list.length; i < length; i++) {
          const item = collection.list[i];

          if (asString(item.id) === asString(descriptor.id)) {
            data = collection.list[i] = RefraxTools.extend(item, data);
            encodeSet(storage, descriptor.basePath, data);

            // Attempt to maintain a proper GUID
            if (item.id > maxId) {
              maxId = item.id;
            }
            break;
          }
        }
        if (i >= length) {
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
    else if (descriptor.action === ACTION_DELETE) {
      if (descriptor.classify === CLASSIFY_ITEM) {
        const collection = getCollection(storage, descriptor.collectionPath);

        for (let i = 0, length = collection.list.length; i < length; i++) {
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
    else {
      throw new TypeError(
        `StorageAdapter unexpected descriptor action \`${descriptor.action}\``
      );
    }
  }
}

export default LocalStorageAdapter;
