/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import RefraxFragmentCache from 'RefraxFragmentCache';
import partialFragmentCacheFetch from 'RefraxFragmentCache-fetch.specp';
import partialFragmentCacheInvalidate from 'RefraxFragmentCache-invalidate.specp';
import partialFragmentCacheTouch from 'RefraxFragmentCache-touch.specp';
import partialFragmentCacheDestroy from 'RefraxFragmentCache-destroy.specp';
import partialFragmentCacheUpdateReplace from 'RefraxFragmentCache-updateReplace.specp';
import partialFragmentCacheUpdateMerge from 'RefraxFragmentCache-updateMerge.specp';


describe('RefraxFragmentCache', function() {
  var fragmentCache;

  beforeEach(function() {
    fragmentCache = new RefraxFragmentCache();
  });

  describe('instantiation', function() {
    it('should look like a FragmentCache', function() {
      expect(Object.keys(fragmentCache)).to.deep.equal(['fragments', 'queries']);
    });
  });

  describe('instance method', function() {
    partialFragmentCacheFetch();
    partialFragmentCacheInvalidate();
    partialFragmentCacheTouch();
    partialFragmentCacheDestroy();
    partialFragmentCacheUpdateReplace();
    partialFragmentCacheUpdateMerge();
  });
});
