/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { IStatus, ITimestamp } from 'util/types';

export class FragmentResult {
  status: IStatus;
  timestamp: ITimestamp;
  data: any;
  fragments?: string[];

  constructor(status?: IStatus, timestamp?: ITimestamp) {
    this.status = status || IStatus.stale;
    this.timestamp = timestamp || ITimestamp.stale;
    this.data = null;
  }
}
