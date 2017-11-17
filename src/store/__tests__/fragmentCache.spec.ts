/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';

import { FragmentCache } from '../../store/fragmentCache';
import partialFragmentCacheDestroy from './fragmentCache-destroy.specp';
import partialFragmentCacheFetch from './fragmentCache-fetch.specp';
import partialFragmentCacheInvalidate from './fragmentCache-invalidate.specp';
import partialFragmentCacheTouch from './fragmentCache-touch.specp';
import partialFragmentCacheUpdateMerge from './fragmentCache-updateMerge.specp';
import partialFragmentCacheUpdateReplace from './fragmentCache-updateReplace.specp';

describe('FragmentCache', () => {
  let fragmentCache: FragmentCache;

  beforeEach(() => {
    fragmentCache = new FragmentCache();
  });

  describe('instantiation', () => {
    it('should look like a FragmentCache', () => {
      expect(Object.keys(fragmentCache)).to.deep.equal(['fragments', 'queries']);
    });
  });

  describe('instance method', () => {
    partialFragmentCacheFetch();
    partialFragmentCacheInvalidate();
    partialFragmentCacheTouch();
    partialFragmentCacheDestroy();
    partialFragmentCacheUpdateReplace();
    partialFragmentCacheUpdateMerge();
  });
});
