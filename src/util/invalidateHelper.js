/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { each } from './util/tools';


function invalidateHelper(items, options = {}) {
  const params = options.params;
  options.params = undefined;
  items = [].concat(items || []);

  each(items, function(item) {
    if (params) {
      item = item.withParams(params);
    }

    item.invalidate(options);
  });
}

export default invalidateHelper;
