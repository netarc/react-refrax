/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const processResponse = require('processResponse');
const RefraxResourceDescriptor = require('RefraxResourceDescriptor');
const RefraxTools = require('RefraxTools');
const expect = chai.expect;


/* eslint-disable no-new */
describe('processResponse', () => {
  describe('when invoked', () => {
    describe('with invalid arguments', () => {
      it('should error with an invalid descriptor', () => {
        RefraxTools.each([
          undefined, null, 123, 'foo', {}, () => {}
        ], (descriptor) => {
          expect(function() {
            processResponse({}, descriptor);
          }).to.throw(TypeError, 'processResponse: descriptor of type `ResourceDescriptor` expected');
        });
      });

      it('should error with an invalid handler', () => {
        RefraxTools.each([123, 'foo'], (handler) => {
          expect(function() {
            processResponse({}, new RefraxResourceDescriptor(), handler);
          }).to.throw(TypeError, 'processResponse: expected handler Function');
        });
      });
    });

    describe('with valid arguments', () => {

    });
  });
});
