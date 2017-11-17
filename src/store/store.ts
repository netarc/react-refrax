/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ResourceDescriptor } from '../resource/descriptor';
import { Eventable } from '../util/eventable';
import { extend, invariant, isPlainObject, randomString } from '../util/tools';
import { IKeyValue, IStatus, IStoreEvent } from '../util/types';
import { FragmentCache } from './fragmentCache';
import { FragmentResult } from './fragmentResult';

const RandomUIDSize = 12;

const validateDefinition = (definition: IKeyValue | string) => {
  if (typeof(definition) === 'string') {
    definition = {
      type: definition
    };
  }

  invariant(isPlainObject(definition),
    `Store:validateDefinition - Expected Object definition but found \`${definition}\``
  );

  invariant(typeof(definition.type) === 'string',
    `Store:validateDefinition - Expected definition.type to be of type String but found \`${definition.type}\``
  );

  return definition;
};

/**
 * A Store is a wrapper around the FragmentCache object that offers
 * a Eventable interface to resource mutations.
 */
export class Store extends Eventable {
  definition: IKeyValue;
  cache: FragmentCache;

  constructor(definition?: IKeyValue | string) {
    super();

    if (!definition) {
      // We accept no definitions and just use an anonymous type name
      definition = {
        type: randomString(RandomUIDSize)
      };
    }

    this.definition = validateDefinition(definition);
    this.reset();
  }

  toString(): string {
    return `Store(${this.definition.type})`;
  }

  reset(): void {
    this.cache = new FragmentCache();
  }

  invalidate(resourceDescriptor: ResourceDescriptor | IKeyValue, options?: IKeyValue): void {
    if (!(resourceDescriptor instanceof ResourceDescriptor)) {
      if (!options && isPlainObject(resourceDescriptor)) {
        options = resourceDescriptor;
        resourceDescriptor = undefined!;
      }

      invariant(!resourceDescriptor,
        `Store:invalidate - Argument \`resourceDescriptor\` has invalid value \`${resourceDescriptor}\`.\n
        Expected type \`ResourceDescriptor\`, found \`${typeof(resourceDescriptor)}\`.`
      );
    }

    options = options || {};
    invariant(isPlainObject(options),
      `Store:invalidate - Argument \`options\` has invalid value \`${options}\`.\n
      Expected type \`Object\`, found \`${options}\`.`
    );

    const touched = this.cache.invalidate(resourceDescriptor as ResourceDescriptor, options);
    this._notifyChange(IStoreEvent.invalidate, touched, options);
  }

  // Fragment Map is intentionally separate to allow future switching depending
  // on the need; this concept may change.

  fetchResource(resourceDescriptor: ResourceDescriptor): FragmentResult {
    return this.cache.fetch(resourceDescriptor);
  }

  touchResource(resourceDescriptor: ResourceDescriptor, touch: IKeyValue, options: IKeyValue = {}): void {
    const touched = this.cache.touch(resourceDescriptor, touch);
    this._notifyChange(IStoreEvent.touch, touched, options);
  }

  updateResource(resourceDescriptor: ResourceDescriptor, data: any, status?: IStatus, options: IKeyValue = {}): void {
    const touched = this.cache.update(resourceDescriptor, data, status);
    this._notifyChange(IStoreEvent.update, touched, options);
  }

  destroyResource(resourceDescriptor: ResourceDescriptor, options: IKeyValue = {}): void {
    const touched = this.cache.destroy(resourceDescriptor);
    this._notifyChange(IStoreEvent.destroy, touched, options);
  }

  //

  _notifyChange(eventAction: IStoreEvent, touched: IKeyValue, options: IKeyValue): void {
    if (options.noNotify === true) {
      return;
    }

    const event = extend({}, options, {
      type: this.definition.type,
      action: eventAction
    });

    // fragments
    for (const id of touched.fragments) {
      this.emit(id, extend({}, event, { fragment: id }));
    }
    // queries
    for (const id of touched.queries) {
      this.emit(id, extend({}, event, { query: id }));
    }
  }
}
