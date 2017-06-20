/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const sinon = require('sinon');
const RefraxSchema = require('RefraxSchema');
const expect = chai.expect;


/* eslint-disable no-new */
describe('RefraxSchema', function() {
  describe('instance method', function() {
    describe('reset', function() {
      it('correctly forwards to storeMap', function() {
        var schema = new RefraxSchema();
        sinon.spy(schema.__storeMap, 'reset');

        schema.reset();
        expect(schema.__storeMap.reset.callCount).to.equal(1);
      });
    });

    describe('invalidate', function() {
      it('correctly forwards to storeMap', function() {
        var schema = new RefraxSchema();
        sinon.spy(schema.__storeMap, 'invalidate');

        schema.invalidate();
        expect(schema.__storeMap.invalidate.callCount).to.equal(1);
      });
    });
  });
});
