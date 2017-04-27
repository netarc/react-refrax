/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxStoreMap = require('RefraxStoreMap');
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxSchemaPath = require('RefraxSchemaPath');


class RefraxSchema extends RefraxSchemaPath {
  constructor() {
    const storeMap = new RefraxStoreMap();
    // TODO: store our map/self in SchemaNode?
    super(new RefraxSchemaNode(null, null, {
      storeMap: storeMap
    }));

    Object.defineProperty(this, '__storeMap', {value: storeMap});
  }

  toString() {
    return 'RefraxSchema';
  }

  invalidate() {
    this.__storeMap.invalidate.apply(this.__storeMap, arguments);
  }

  reset() {
    this.__storeMap.reset.apply(this.__storeMap, arguments);
  }
}

export default RefraxSchema;
