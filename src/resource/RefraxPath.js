/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { cleanPath } from 'RefraxTools';


/**
 * A RefraxPath is a wrapper around a string to identify it as a uri path.
 */
class RefraxPath {
  constructor(path, isModifier) {
    if (typeof(path) !== 'string') {
      throw new TypeError(
        'RefraxPath expected path argument of type `String`\n\r' +
        'found: `' + path + '`'
      );
    }

    this.path = cleanPath(path);
    this.isModifier = !!isModifier;
  }
}

export default RefraxPath;
