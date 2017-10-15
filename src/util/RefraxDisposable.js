/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { setPrototypeOf } from './RefraxTools';


function RefraxDisposable(disposer) {
  if (!(this instanceof RefraxDisposable)) {
    throw new Error('RefraxDisposable: Cannot be directly invoked');
  }

  if (!(typeof(disposer) === 'function')) {
    throw new TypeError(`RefraxDisposable: Expected function, but found \`${typeof(disposer)}\``);
  }

  let disposed = false;
  const disposable = () => {
    if (disposed) {
      return;
    }

    disposed = true;
    disposer();
  };
  setPrototypeOf(disposable, RefraxDisposable.prototype);

  Object.defineProperty(disposable, 'disposed', {
    get: function() {
      return disposed;
    }
  });

  return disposable;
}

RefraxDisposable.mixinDisposable = (target) => {
  var disposed = false
    , disposers = [];

  if (!target) {
    throw new ReferenceError('mixinCompoundDisposable: exepected non-null target');
  }

  Object.defineProperty(target, '_disposers', {
    get: function() {
      return [].concat(disposers);
    }
  });

  Object.defineProperty(target, 'disposed', {
    get: function() {
      return disposed;
    }
  });

  Object.defineProperty(target, 'addDisposable', {
    enumerable: false,
    writable: false,
    value: function(disposable) {
      if (!(disposable instanceof RefraxDisposable)) {
        throw new TypeError('mixinCompoundDisposable.addDisposable: exepected Disposable type');
      }

      if (disposed) {
        disposable();
      }
      else {
        disposers.push(disposable);
      }
    }
  });

  Object.defineProperty(target, 'dispose', {
    enumerable: false,
    writable: false,
    value: function() {
      if (disposed) {
        return;
      }

      disposed = true;
      for (let i = 0, len = disposers.length; i < len; i++) {
        const disposer = disposers[i];

        disposer.disposed && disposer();
      }
      disposers = [];
    }
  });

  return target;
};

export default RefraxDisposable;
