/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import RefraxConstants from 'RefraxConstants';

const STATUS_STALE = RefraxConstants.status.stale;
const TIMESTAMP_STALE = RefraxConstants.timestamp.stale;


class RefraxFragmentResult {
  constructor(status, timestamp) {
    this.status = status || STATUS_STALE;
    this.timestamp = timestamp || TIMESTAMP_STALE;
    this.data = null;
  }
}

export default RefraxFragmentResult;
