/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { each, isPlainObject, isArray } from 'RefraxTools';


function parseObject(object) {
  if (!isPlainObject(object)) {
    throw new TypeError(
      'parseUnnested:parseObject: expected object type but found `' + typeof(object) + '`.'
    );
  }

  var result = {}
    , data = (result.data = {});

  each(object, function(value, key) {
    if (key[0] === '_') {
      if (key === '_type') {
        result.type = value;
      }
      else if (key === '_partial') {
        result.partial = value;
      }
      else {
        console.warn('parseUnnested:parseObject: ignoring unknown object property `' + key + '`');
      }

      return;
    }

    // while parsing an object, any array/object is considered embedded data
    // so we just treat it like the start of a unknown request
    if (isArray(value) || isPlainObject(value)) {
      parseUnnested(value);
    }
    else {
      data[key] = value;
    }
  });

  return result;
}

function parseUnnested(data, descriptor) {
  var result = null
    , discoveredType = null
    , discoveredPartial = null
    , i, resource;

  descriptor = descriptor || {};

  // collection
  if (isArray(data)) {
    result = [];

    for (i = 0; i < data.length; i++) {
      resource = parseObject(data[i]);

      if (resource.type) {
        if (discoveredType && discoveredType !== resource.type) {
          throw new TypeError(
            'parseUnnested: Found conflicting types inside array of `' + discoveredType +
            '` and `' + resource.type + '`.'
          );
        }
        discoveredType = resource.type;
      }

      if (resource.partial) {
        if (discoveredPartial && discoveredPartial !== resource.partial) {
          throw new TypeError(
            'parseUnnested: Found conflicting partials inside array of `' + discoveredPartial +
            '` and `' + resource.partial + '`.'
          );
        }
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
}

export default parseUnnested;
