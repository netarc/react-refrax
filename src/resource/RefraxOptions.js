/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');


/**
 * A RefraxOptions is a wrapper around an object to identify it as a set of options.
 */
class RefraxOptions {
  static validate(options) {
    if (options && !RefraxTools.isPlainObject(options)) {
      throw new TypeError(
        'RefraxOptions expected argument of type `Object`\n\r' +
        'found: `' + options + '`'
      );
    }
  }

  constructor(...args) {
    RefraxTools.each(args, (options) => {
      RefraxOptions.validate(options);
      RefraxTools.extend(this, options);
    });
  }
}

export default RefraxOptions;
