/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// tslint:disable-next-line:interface-name
export interface RequestError {
  message: string;
  response: any;
  name: string;
  new (response: any): this;
}

export const RequestError = function(this: RequestError, response: any): void {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this);
  }

  // tslint:disable-next-line:prefer-template
  this.message = '' + response.statusText;
  this.response = response;
  this.name = 'RequestError';
} as any as RequestError;

(RequestError as any).prototype = Object.create(Error.prototype);
