/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');


/**
 * A RefraxStore is a wrapper around the RefraxFragmentCache object that offers
 * a Subscribable interface to resource mutations.
 */
class RefraxPath {
  constructor(path) {
    this.path = RefraxTools.cleanPath(path);
  }
}

export default RefraxPath;
