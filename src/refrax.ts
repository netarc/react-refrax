/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Action from './actions/action';
import * as Entity from './actions/entity';
import { MutableResource } from './resource/mutableResource';
import { Resource } from './resource/resource';
import * as Response from './response/processResponse';
import { createSchemaCollection } from './schema/createSchemaCollection';
import { createSchemaNamespace } from './schema/createSchemaNamespace';
import { createSchemaResource } from './schema/createSchemaResource';
// @ts-ignore error TS4082: Default export of the module has or is using private name..
import { SchemaNode } from './schema/node';
import * as SchemaPath from './schema/path';
import * as Schema from './schema/schema';
import { Store } from './store/store';
import Config from './util/config';
import { invalidateHelper as invalidate } from './util/invalidateHelper';
import * as Tools from './util/tools';
import * as Constants from './util/types';

export * from './util/composableHash';
export * from './util/disposable';
export * from './actions/action';

// tslint:disable-next-line:no-default-export
export default {
  ActionEntity: Entity.ActionEntity,
  MutableResource,
  Resource,
  Schema,
  createSchema: Schema.createSchema,
  SchemaPath,
  createSchemaPath: SchemaPath.createSchemaPath,
  Store,
  Config,
  Tools,
  Constants,
  createAction: Action.createAction,
  createSchemaCollection,
  createSchemaNamespace,
  createSchemaResource,
  processResponse: Response.processResponse,
  invalidate
};
