/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import sinon from 'sinon';
import RefraxSchema from 'RefraxSchema';


/* eslint-disable no-new */
describe('RefraxSchema', function() {
  describe('instance method', function() {
    describe('reset', function() {
      it('correctly forwards to storeMap', function() {
        var schema = new RefraxSchema();
        sinon.spy(schema.__node.definition.storeMap, 'reset');

        schema.reset();
        expect(schema.__node.definition.storeMap.reset.callCount).to.equal(1);
      });
    });

    describe('invalidate', function() {
      it('correctly forwards to storeMap', function() {
        var schema = new RefraxSchema();
        sinon.spy(schema.__node.definition.storeMap, 'invalidate');

        schema.invalidate();
        expect(schema.__node.definition.storeMap.invalidate.callCount).to.equal(1);
      });
    });
  });
});
