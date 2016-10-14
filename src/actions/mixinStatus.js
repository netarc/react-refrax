/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');


const MixinStatus = {
  isPending: function() {
    return this._promises.length > 0;
  },
  isLoading: function() {
    return this.default && this.default.isLoading && this.default.isLoading();
  },
  hasData: function() {
    return this.default && this.default.hasData && this.default.hasData();
  },
  isStale: function() {
    return this.default && this.default.isStale && this.default.isStale();
  }
};

function mixinStatus(target) {
  Object.defineProperty(target, '_promises', {value: []});

  return RefraxTools.extend(target, MixinStatus);
}

export default mixinStatus;
