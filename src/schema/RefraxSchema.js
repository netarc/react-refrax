/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxSchemaNodeAccessor = require('RefraxSchemaNodeAccessor');

const RootNode = new RefraxSchemaNode();
const Schema = new RefraxSchemaNodeAccessor(RootNode);

export default Schema;
