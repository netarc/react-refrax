/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import LocalStorageAdapter from 'LocalStorageAdapter';


class SessionStorageAdapter extends LocalStorageAdapter {
  constructor(config = {}) {
    super(config);

    this.storage = global.sessionStorage || global.window && global.window.sessionStorage;
  }
}

export default SessionStorageAdapter;
