/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Promise from 'bluebird';

import { requestForDescriptor } from '../resource/requestForDescriptor';
import { SchemaPath } from '../schema/path';
import { map } from '../util/tools';
import {
  IActionType,
  IKeyValue,
  TDescriptorRequestHook,
  TRequestResult,
  TResourceArgument
} from '../util/types';
import { BaseResource } from './base';
import { ResourceDescriptor } from './descriptor';
import { RefraxPath } from './path';

/**
 * MutableResource is a public facing interface class to modifying through a Schema Node.
 */
export class MutableResource extends BaseResource {
  static from(schemaPath: SchemaPath, ...args: TResourceArgument[]): MutableResource {
    return new MutableResource(schemaPath, ...args);
  }

  constructor(schemaPath: SchemaPath, ...args: TResourceArgument[]) {
    // Mutable path modifiers do not count as the basePath
    args = map(args, (arg: TResourceArgument) => {
      if (typeof(arg) === 'string') {
        arg = new RefraxPath(arg, true);
      }

      return arg;
    });

    super(schemaPath, ...args);
  }

  create(data: IKeyValue | any[], callback?: TDescriptorRequestHook): Promise<TRequestResult> {
    const doRequest = (descriptor: ResourceDescriptor, options: IKeyValue): Promise<TRequestResult> =>
      requestForDescriptor(descriptor, options, callback);

    return this._generateDescriptor(IActionType.create, [data], doRequest);
  }

  destroy(data: IKeyValue | any[], callback?: TDescriptorRequestHook): Promise<TRequestResult> {
    const doRequest = (descriptor: ResourceDescriptor, options: IKeyValue): Promise<TRequestResult> =>
      requestForDescriptor(descriptor, options, callback);

    return this._generateDescriptor(IActionType.delete, [data], doRequest);
  }

  update(data: IKeyValue | any[], callback?: TDescriptorRequestHook): Promise<TRequestResult> {
    const doRequest = (descriptor: ResourceDescriptor, options: IKeyValue): Promise<TRequestResult> =>
      requestForDescriptor(descriptor, options, callback);

    return this._generateDescriptor(IActionType.update, [data], doRequest);
  }
}
