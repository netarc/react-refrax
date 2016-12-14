/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
function mixinDisposable(target) {
  var isDisposed = false
    , disposers = [];

  if (!target) {
    throw new TypeError('mixinDisposable - exepected non-null target');
  }

  Object.defineProperty(target, '_disposers', {
    get: function() {
      return [].concat(disposers);
    }
  });

  Object.defineProperty(target, 'isDisposed', {
    get: function() {
      return isDisposed;
    }
  });

  target.onDispose = function(disposer) {
    if (isDisposed) {
      disposer();
    }
    else {
      disposers.push(disposer);
    }
  };

  target.dispose = function() {
    if (isDisposed) {
      return;
    }

    isDisposed = true;
    for (let i = 0, len = disposers.length; i < len; i++) {
      disposers[i]();
    }
    disposers = [];
  };

  return target;
}

export default mixinDisposable;
