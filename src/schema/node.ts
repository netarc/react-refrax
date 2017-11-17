/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Store } from '../store/store';
import { StoreMap } from '../store/storeMap';
import { each, extend, invariant, isArray, isPlainObject } from '../util/tools';
import { IClassification, IKeyValue } from '../util/types';

const validDefinitionKeys: { [key: string]: object } = {};

validDefinitionKeys[IClassification.schema] = [
  'storeMap',
  'adapter'
];

validDefinitionKeys[IClassification.namespace] = [
  'path'
];

validDefinitionKeys[IClassification.resource] = [
  'partial',
  'fragments',
  'path',
  'store'
];

validDefinitionKeys[IClassification.collection] = [
  'partial',
  'fragments',
  'path',
  'store',
  'paramId',
  'paramMap'
];

validDefinitionKeys[IClassification.item] = [
  'partial',
  'fragments',
  'path',
  'store',
  'paramId',
  'paramMap'
];

const validateDefinition = (type: IClassification, definition: IKeyValue) => {
  const definitionKeys: IKeyValue = validDefinitionKeys[type];

  invariant(Boolean(definitionKeys), `SchemaNode - Invalid type \`${type}\`.`);

  invariant(isPlainObject(definition),
    `SchemaNode - You're attempting to pass an invalid definition of type \`${typeof(definition)}\`. ` +
    'A valid definition type is a regular object.'
  );

  each(definition, (_value: any, key: string) => {
    invariant(definitionKeys.indexOf(key) > -1,
      `SchemaNode - Invalid definition option \`${key}\`. `
    );
  });

  invariant(!('storeMap' in definition) || definition.storeMap instanceof StoreMap,
    'SchemaNode - Option `storeMap` can only be of type StoreMap but found ' +
    `type \`${typeof(definition.storeMap)}\`.`
  );

  invariant(!('partial' in definition) || typeof(definition.partial) === 'string',
    'SchemaNode - Option `partial` can only be of type String but found ' +
    `type \`${typeof(definition.partial)}\`.`
  );

  if ('fragments' in definition) {
    const fragments = definition.fragments;

    invariant(isArray(fragments),
      `SchemaNode - Option \`fragments\` can only be of type Array but found type \`${typeof(fragments)}\`.`
    );

    each(fragments, (value: any) => {
      invariant(typeof(value) === 'string',
        `SchemaNode - Option \`fragments\` contains a non-String value \`${typeof(value)}\`.`
      );
    });
  }

  invariant(!('path' in definition) || typeof(definition.path) === 'string',
    'SchemaNode - Option `path` can only be of type String but found ' +
    `type \`${typeof(definition.path)}\`.`
  );

  invariant(!('paramId' in definition) || typeof(definition.paramId) === 'string',
    'SchemaNode - Option `paramId` can only be of type String but found ' +
    `type \`${typeof(definition.paramId)}\`.`
  );

  invariant(!('paramMap' in definition) || isPlainObject(definition.paramMap),
    'SchemaNode - Option `paramMap` can only be of type Object but found ' +
    `type \`${typeof(definition.paramMap)}\`.`
  );

  invariant(!('store' in definition) || typeof(definition.store) === 'string' || definition.store instanceof Store,
    'SchemaNode - Option `store` can only be of type String/Store but found ' +
    `type \`${typeof(definition.store)}\`.`
  );

  return definition;
};

export class SchemaNode {
  type: IClassification;
  identifier: string;
  definition: IKeyValue;
  leafs: IKeyValue;

  constructor(type = IClassification.namespace, identifier?: string | IKeyValue | null, definition?: IKeyValue) {
    if (isPlainObject(identifier) && !definition) {
      definition = identifier as any as IKeyValue;
      identifier = undefined;
    }

    // shallow copy since we mutate below
    definition = definition ? extend({}, definition) : {};

    invariant(!identifier || typeof(identifier) === 'string',
      'SchemaNode - A identifier argument can only be of type `String`, ' +
      `but found type \`${typeof(identifier)}\`.`
    );

    validateDefinition(type, definition!);

    // TODO: Do we need to classify this anymore?
    definition!.classify = type;

    Object.defineProperty(this, 'type', { value: type });
    Object.defineProperty(this, 'identifier', { value: identifier });
    Object.defineProperty(this, 'definition', { value: definition });
    Object.defineProperty(this, 'leafs', { value: {} });
  }
}
