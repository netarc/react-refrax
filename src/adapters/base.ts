/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Promise from 'bluebird';

import { ResourceDescriptor } from '../resource/descriptor';
import { invariant, isPlainObject } from '../util/tools';
import { IKeyValue, TRequestResult } from '../util/types';

export interface IStorage {
  setItem(id: string, val: string): void;
  getItem(id: string): string;
  removeItem(id: string): void;
}

const validateConfig = (config: IKeyValue): void => {
  // tslint:disable-next-line:max-line-length
  invariant(isPlainObject(config), `BaseAdapter - You're attempting to pass an invalid config of type \`${typeof(config)}\`. A valid config type is a regular object.`);
};

export class BaseAdapter {
  config: IKeyValue;

  constructor(config: IKeyValue = {}) {
    validateConfig(config);

    this.config = config;
  }

  invoke(this: this, _descriptor: ResourceDescriptor, _options: IKeyValue = {}): Promise<TRequestResult> {
    invariant(true, `RefraxAdapter(${this.constructor.name || this.toString()}) missing invoke override`);

    return null as never;
  }
}
