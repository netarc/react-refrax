/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BaseAdapter } from '../adapters/base';
import { LocalStorageAdapter } from '../adapters/localStorage';
import { SessionStorageAdapter } from '../adapters/sessionStorage';
import { XHRAdapter } from '../adapters/XHR';
import { StoreMap } from '../store/storeMap';
import { extend, invariant, isPlainObject } from '../util/tools';
import { IClassification, IKeyValue } from '../util/types';
import { SchemaNode } from './node';
import { SchemaPath } from './path';

const validateDefinition = (definition: IKeyValue) => {
  invariant(isPlainObject(definition),
    `Schema - You're attempting to pass an invalid definition of type \`${typeof(definition)}\`. ` +
    'A valid definition type is a regular object.'
  );

  // Shallow copy so modifications don't affect the source
  definition = extend({}, definition);

  invariant(!('storeMap' in definition) || definition.storeMap instanceof StoreMap,
    `Schema - Option \`storeMap\` can only be of type StoreMap but found type \`${typeof(definition.storeMap)}\`. `
  );

  definition.storeMap = definition.storeMap || new StoreMap();

  if ('adapter' in definition) {
    invariant(typeof(definition.adapter) !== 'string' || (definition.adapter = Schema.adapters[definition.adapter]),
      `Schema - No adapter found named \`${definition.adapter}\``
    );

    invariant(definition.adapter instanceof BaseAdapter,
      `Schema - Option \`adapter\` can only be of type BaseAdapter but found type \`${typeof(definition.adapter)}\`.`
    );
  }
  else {
    definition.adapter = new XHRAdapter();
  }

  return definition;
};

export class Schema extends SchemaPath {
  static adapters: IKeyValue = {
    base: BaseAdapter,
    xhr: XHRAdapter,
    localStorage: LocalStorageAdapter,
    sessionStorage: SessionStorageAdapter
  };

  constructor(definition: IKeyValue = {}) {
    definition = validateDefinition(definition);

    super(new SchemaNode(IClassification.schema, null, definition));
  }

  // @ts-ignore @todo proper fallback index signature?
  toString(): string {
    return 'Schema';
  }

  // @ts-ignore @todo proper fallback index signature?
  invalidate(): void {
    const storeMap = this.__node.definition.storeMap;
    storeMap.invalidate.apply(storeMap, arguments);
  }

  // @ts-ignore @todo proper fallback index signature?
  reset(): void {
    const storeMap = this.__node.definition.storeMap;
    storeMap.reset.apply(storeMap, arguments);
  }
}
