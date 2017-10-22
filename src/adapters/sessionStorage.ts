/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { IKeyValue } from 'util/types';
import { LocalStorageAdapter } from './localStorage';

export class SessionStorageAdapter extends LocalStorageAdapter {
  constructor(config: IKeyValue = {}) {
    super(config);

    this.storage = (global as any).sessionStorage || ((global as any).window && (global as any).window.sessionStorage);
  }
}
