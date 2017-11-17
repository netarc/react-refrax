/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Resource } from '../resource/resource';
import { Schema } from '../schema/schema';
import { Store } from '../store/store';
import { each } from './tools';
import { IKeyValue } from './types';

export type TInvalidable = Schema | Resource | Store;

export const invalidateHelper = (items: TInvalidable | TInvalidable[], options: IKeyValue = {}) => {
  const params = options.params;
  options.params = undefined;
  items = ([] as TInvalidable[]).concat(items || []);

  each(items, (item) => {
    if (params) {
      item = item.withParams(params);
    }

    item.invalidate(options);
  });
};
