/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
  each,
  invariant,
  isArray,
  isPlainObject,
  objToString
} from 'util/tools';
import { IKeyValue, IResponseHandlerResult, TResponseHandler } from 'util/types';

const parseObject = (object: IKeyValue): IKeyValue => {
  const result: IKeyValue = {};
  const data: IKeyValue = (result.data = {});

  invariant(isPlainObject(object),
    `parseNested:parseObject: expected object type but found \`${objToString.call(object)}\`.`
  );

  // TODO: we can't depend on an id if we are simply a "resource" non collection-item
  // if (!object.id) {
  //   throw new TypeError(
  //     'parseNested:parseObject: expected to find object id.'
  //   );
  // }

  each(object, (value, key: string) => {
    if (key[0] === '_') {
      if (key === '_type') {
        result.type = value;
      }
      else if (key === '_partial') {
        result.partial = value;
      }
      else {
        // tslint:disable-next-line:no-console
        console.warn(`parseNested:parseObject: ignoring unknown object property \`${key}\``);
      }

      return;
    }

    data[key] = value;
  });

  return result;
};

export const parseNested: TResponseHandler = (_descriptor, data): IResponseHandlerResult => {
  let result = null;
  let discoveredType = null;
  let discoveredPartial = null;
  let i;
  let resource;

  // collection
  if (isArray(data)) {
    result = [];

    for (i = 0; i < data.length; i++) {
      resource = parseObject(data[i]);

      if (resource.type) {
        invariant(!discoveredType || discoveredType === resource.type,
          `parseNested: Found conflicting types inside array of \`${discoveredType}\ and \`${resource.type}\`.`
        );

        discoveredType = resource.type;
      }

      if (resource.partial) {
        invariant(!discoveredPartial || discoveredPartial === resource.partial,
          `parseNested: Found conflicting partials inside array of \`${discoveredPartial}\ and \`${resource.partial}\`.`
        );

        discoveredPartial = resource.partial;
      }

      result.push(resource.data);
    }
  }
  // non-collection
  else {
    resource = parseObject(data);

    result = resource.data;
    discoveredType = resource.type;
    discoveredPartial = resource.partial;
  }

  return {
    type: discoveredType,
    partial: discoveredPartial,
    data: result
  };
};
