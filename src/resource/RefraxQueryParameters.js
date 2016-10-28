/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');


/**
 * A RefraxQueryParameters is a wrapper around an object to identify it as a
 * set of query parameters.
 */
class RefraxQueryParameters {
  static validate(params) {
    if (!RefraxTools.isPlainObject(params)) {
      throw new TypeError(
        'RefraxQueryParameters expected argument of type `Object`\n\r' +
        'found: `' + params + '`'
      );
    }
  }

  constructor(...args) {
    RefraxTools.each(args, (params) => {
      RefraxQueryParameters.validate(params);
      RefraxTools.extend(this, params);
    });
  }
}

export default RefraxQueryParameters;
