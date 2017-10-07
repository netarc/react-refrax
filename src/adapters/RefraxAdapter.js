/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');


function validateConfig(config) {
  if (!RefraxTools.isPlainObject(config)) {
    throw new TypeError(
      'RefraxAdapter - You\'re attempting to pass an invalid config of type `' + typeof(config) + '`. ' +
      'A valid config type is a regular object.'
    );
  }
}

class RefraxAdapter {
  constructor(config = {}) {
    validateConfig(config);

    Object.defineProperty(this, 'config', { value: config });
  }

  invoke() {
    throw new Error('RefraxAdapter(%s) missing invoke override', this.constructor.name || this.toString());
  }
}

export default RefraxAdapter;
