/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Promise from 'bluebird';
import Axios from 'axios';
import RefraxResourceDescriptor from 'RefraxResourceDescriptor';
import RefraxAdapter from 'RefraxAdapter';
import { any, each } from 'RefraxTools';
import RequestError from 'RequestError';
import RefraxConstants from 'RefraxConstants';

const ACTION_GET = RefraxConstants.action.get;
const STATUS_STALE = RefraxConstants.status.stale;
const TIMESTAMP_LOADING = RefraxConstants.timestamp.loading;


function containsMultipart(data) {
  return data && any(data, function(value) {
    return global.File && value instanceof global.File;
  });
}

function composeFormData(data) {
  const result = new global.FormData();

  each(data, function(value, key) {
    result.append(key, value);
  });

  return result;
}

class XHRAdapter extends RefraxAdapter {
  invoke(descriptor, options = {}) {
    if (!(descriptor instanceof RefraxResourceDescriptor)) {
      throw new TypeError(
        `xhrAdapter expected descriptor, but found \`${descriptor}\``
      );
    }

    const store = descriptor.store;
    const touchParams = {
      timestamp: TIMESTAMP_LOADING
    };
    const requestConfig = {
      method: descriptor.action,
      url: descriptor.path
    };

    if (descriptor.action === ACTION_GET) {
      touchParams.status = STATUS_STALE;
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

    return new Promise(function(resolve, reject) {
      // eslint-disable-next-line new-cap
      Axios(requestConfig)
        .then(function(response) {
          resolve([response.data || null, response, descriptor]);
        }, function(err) {
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

export default XHRAdapter;
