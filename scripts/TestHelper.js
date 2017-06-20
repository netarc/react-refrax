/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Refrax = require('Refrax');
const RefraxConstants = require('RefraxConstants');
const RefraxResourceDescriptor = require('RefraxResourceDescriptor');
const RefraxTools = require('RefraxTools');
const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const CLASSIFY_ITEM = RefraxConstants.classify.item;
const CLASSIFY_RESOURCE = RefraxConstants.classify.resource;


export function descriptorFrom(params) {
  var descriptor = new RefraxResourceDescriptor();
  descriptor.basePath = params.path || descriptor.path;
  RefraxTools.extend(descriptor, params);
  return descriptor;
}

export function descriptorCollection(params) {
  return RefraxTools.extend(descriptorFrom(params), {
    classify: CLASSIFY_COLLECTION
  });
}

export function descriptorCollectionItem(params) {
  return RefraxTools.extend(descriptorFrom(params), {
    classify: CLASSIFY_ITEM
  });
}

export function descriptorResource(params) {
  return RefraxTools.extend(descriptorFrom(params), {
    classify: CLASSIFY_RESOURCE
  });
}
