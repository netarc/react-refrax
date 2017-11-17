/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import { spy } from 'sinon';

import { createSchema } from '../../schema/schema';

/* eslint-disable no-new */
describe('Schema', () => {
  describe('instance method', () => {
    describe('reset', () => {
      it('correctly forwards to storeMap', () => {
        const schema = createSchema();
        spy(schema.__node.definition.storeMap, 'reset');

        schema.reset();
        expect(schema.__node.definition.storeMap.reset.callCount).to.equal(1);
      });
    });

    describe('invalidate', () => {
      it('correctly forwards to storeMap', () => {
        const schema = createSchema();
        spy(schema.__node.definition.storeMap, 'invalidate');

        schema.invalidate();
        expect(schema.__node.definition.storeMap.invalidate.callCount).to.equal(1);
      });
    });
  });
});
