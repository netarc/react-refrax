/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const RefraxSchema = require('RefraxSchema');
const RefraxSchemaPath = require('RefraxSchemaPath');
const expect = chai.expect;


describe('RefraxSchema', function() {
  it('should represent the Root Schema Node', function() {
    expect(RefraxSchema).to.be.an.instanceof(RefraxSchemaPath);
  });
});
