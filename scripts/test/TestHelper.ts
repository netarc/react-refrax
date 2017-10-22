/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ResourceDescriptor } from 'resource/descriptor';
import { extend } from 'util/tools';
import { IClassification, IKeyValue } from 'util/types';


export const descriptorFrom = (params: IKeyValue) => {
  const descriptor = new ResourceDescriptor(null);
  descriptor.basePath = params.path || descriptor.path;
  descriptor.event = params.id || params.basePath;
  extend(descriptor, params);

  return descriptor;
};

export const descriptorCollection = (params: IKeyValue) =>
  extend(descriptorFrom(params), {
    classify: IClassification.collection
  });

export const descriptorCollectionItem = (params: IKeyValue) =>
  extend(descriptorFrom(params), {
    classify: IClassification.item
  });

export const descriptorResource = (params: IKeyValue) =>
  extend(descriptorFrom(params), {
    classify: IClassification.resource
  });
