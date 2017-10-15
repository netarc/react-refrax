/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import RefraxConstants from 'RefraxConstants';
import RefraxResourceDescriptor from 'RefraxResourceDescriptor';
import { extend } from 'RefraxTools';

const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const CLASSIFY_ITEM = RefraxConstants.classify.item;
const CLASSIFY_RESOURCE = RefraxConstants.classify.resource;


export function descriptorFrom(params) {
  var descriptor = new RefraxResourceDescriptor();
  descriptor.basePath = params.path || descriptor.path;
  descriptor.event = params.id || params.basePath;
  extend(descriptor, params);
  return descriptor;
}

export function descriptorCollection(params) {
  return extend(descriptorFrom(params), {
    classify: CLASSIFY_COLLECTION
  });
}

export function descriptorCollectionItem(params) {
  return extend(descriptorFrom(params), {
    classify: CLASSIFY_ITEM
  });
}

export function descriptorResource(params) {
  return extend(descriptorFrom(params), {
    classify: CLASSIFY_RESOURCE
  });
}
