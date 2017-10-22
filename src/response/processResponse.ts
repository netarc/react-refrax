/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ResourceDescriptor } from 'resource/descriptor';
import { invariant, isPlainObject } from 'util/tools';
import { IActionType, IKeyValue, IStatus, TResponseHandler } from 'util/types';
import { parseNested } from './handlers/parseNested';
import { parseUnnested } from './handlers/parseUnnested';

// tslint:disable-next-line: class-name
export interface IProcessResposne {
  (descriptor: ResourceDescriptor, data: any, handler?: TResponseHandler | null, options?: IKeyValue): void;
  handlers: {
    [key: string]: TResponseHandler;
  };
  defaultHandler: TResponseHandler;
}

export const processResponse: IProcessResposne = (
  (descriptor: ResourceDescriptor, data: any, handler?: TResponseHandler | null, options: IKeyValue = {}): void => {
    invariant(descriptor instanceof ResourceDescriptor,
      `processResponse: descriptor of type \`ResourceDescriptor\` expected but found \`${typeof(descriptor)}\`.`
    );

    if (isPlainObject(handler)) {
      options = handler!;
      handler = null!;
    }

    handler = handler || processResponse.defaultHandler;
    invariant(Boolean(handler) && typeof(handler) === 'function',
      `processResponse: expected handler \`Function\`, but found \`${typeof(handler)}\`.`
    );

    invariant(isPlainObject(options),
      `processResponse: options of type \`Object\` expected but found \`${typeof(options)}\`.`
    );

    const result: IKeyValue = data && handler!(descriptor, data) || {};

    invariant(!result.type || result.type === descriptor.type,
      `processResponse: Type mismatch on processed data, expected \`${descriptor.type}\`` +
      `but found \`${result.type}\`.`
    );

    const store = descriptor.store;
    if (store) {
      if (descriptor.action === IActionType.delete) {
        store.destroyResource(descriptor, options);
      }
      else {
        store.updateResource(descriptor, result.data, IStatus.complete, options);
      }
    }
  }) as any as IProcessResposne;

/**
 * responseHandler serves as a collection/object parser for the resulting JSON of
 * a request. This parser will gather objects and send them off the the associated
 * Store for storage.
 *
 * New handlers can be added and the default able to be changed so one can
 * customize how they expect their backend show data and how RPS imports that data.
 */
processResponse.handlers = {
  parseNested,
  parseUnnested
};

processResponse.defaultHandler = parseNested;
