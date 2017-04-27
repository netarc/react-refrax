/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
function RequestError(response) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this);
  }
  this.message = '' + response.statusText;
  this.response = response;
  this.name = 'RequestError';
}
RequestError.prototype = Object.create(Error.prototype);

export default RequestError;
