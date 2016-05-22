/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxSchema = require('RefraxSchema');
const RefraxConfig = require('RefraxConfig');
const RefraxTools = require('RefraxTools');
const RefraxResource = require('RefraxResource');
const RefraxMutableResource = require('RefraxMutableResource');
const createAction = require('createAction');
const createSchemaCollection = require('createSchemaCollection');
const createSchemaResource = require('createSchemaResource');
const createSchemaNamespace = require('createSchemaNamespace');
const processResponse = require('processResponse');
const RefraxStore = require('RefraxStore');


export default {
  Config: RefraxConfig,
  MutableResource: RefraxMutableResource,
  Resource: RefraxResource,
  Schema: RefraxSchema,
  Store: RefraxStore,
  Tools: RefraxTools,
  createAction,
  createSchemaCollection,
  createSchemaNamespace,
  createSchemaResource,
  processResponse
};
