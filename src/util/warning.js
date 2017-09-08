/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
let warning = () => {};

if (__DEV__) {
  function printWarning(format, ...args) {
    var argIndex = 0
      , message = 'Warning: ' + format.replace(/%s/g, () => args[argIndex++]);

    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      throw new Error(message);
    }
    catch (x) {}
  }

  warning = function(condition, format, ...args) {
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning message argument'
      );
    }

    if (!condition) {
      printWarning(format, ...args);
    }
  };
}

export default warning;
