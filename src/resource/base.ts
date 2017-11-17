/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { SchemaPath, SchemaPathClass } from '../schema/path';
import {
  RefraxOptions,
  RefraxParameters,
  RefraxQueryParameters
} from '../util/composableHash';
import {
  // @ts-ignore - Exported variable .. cannot be named https://github.com/Microsoft/TypeScript/issues/9944
  Configurable,
  mixinConfigurable
} from '../util/configurable';
import { CompoundDisposable, Disposable } from '../util/disposable';
import {
  // @ts-ignore - Exported variable .. cannot be named https://github.com/Microsoft/TypeScript/issues/9944
  Eventable,
  mixinEventable
} from '../util/eventable';
import {
  extend,
  invariant,
  isArray,
  isFunction,
  isPlainObject
} from '../util/tools';
import {
  IActionType,
  IKeyValue,
  TResourceArgument,
  TStackItem
} from '../util/types';
import { ResourceDescriptor } from './descriptor';
import { RefraxPath } from './path';

export type IGenerateDescriptorCallback<T = any> = (descriptor: ResourceDescriptor, options: IKeyValue) => T;

/**
 * Resource is a public facing interface class to querying a Schema Node.
 */
export class BaseResource extends mixinEventable(mixinConfigurable(CompoundDisposable)) {
  _schemaPath: SchemaPath;
  _paths: Array<string | RefraxPath>;

  constructor(schemaPath: SchemaPath, ...args: TResourceArgument[]) {
    super();

    invariant(schemaPath instanceof SchemaPathClass,
      `BaseResource expected valid SchemaPath\n\rfound: \`${schemaPath}\``
    );

    const paths = [];

    this._options.extend(schemaPath._options);
    this._parameters.extend(schemaPath._parameters);
    this._queryParams.extend(schemaPath._queryParams);

    for (const arg of args) {

      if (arg === undefined || arg === null) {
        continue;
      }
      else if (typeof(arg) === 'string') {
        paths.push(new RefraxPath(arg));
      }
      else if (arg instanceof RefraxPath) {
        paths.push(arg);
      }
      else if (arg instanceof RefraxOptions) {
        this._options.extend(arg);
      }
      else if (arg instanceof RefraxParameters) {
        this._parameters.extend(arg);
      }
      else if (arg instanceof RefraxQueryParameters ||
               isPlainObject(arg)) {
        this._queryParams.extend(arg);
      }
      else {
        // tslint:disable-next-line:no-console
        console.warn(`resourceBase: unexpected argument \`${arg}\` passed to constructor.`);
      }
    }

    // `invalidate: true` is an alias for `{ noPropgate: true }`
    if (this._options.invalidate === true) {
      this._options.invalidate = { noPropagate: true };
    }

    this._schemaPath = schemaPath;
    this._paths = paths;

    this.addDisposable(new Disposable(() => {
      this._emitter.removeAllListeners();
    }));
  }

  //

  _generateStack(): TStackItem[] {
    return ([] as TStackItem[]).concat(
      this._schemaPath.__stack,
      this._paths,
      this._parameters,
      this._queryParams,
      this._options
    );
  }

  _generateDescriptor(action: IActionType): ResourceDescriptor;
  _generateDescriptor<T>(action: IActionType, onValid: IGenerateDescriptorCallback<T>): T;
  _generateDescriptor(action: IActionType, stack: TStackItem[]): ResourceDescriptor;
  _generateDescriptor<T>(action: IActionType, stack: TStackItem[], onValid: IGenerateDescriptorCallback<T>): T;
  _generateDescriptor(action: IActionType, options: IKeyValue): ResourceDescriptor;
  _generateDescriptor<T>(action: IActionType, options: IKeyValue, onValid: IGenerateDescriptorCallback<T>): T;
  // tslint:disable-next-line:max-line-length
  _generateDescriptor<T>(action: IActionType, options: IKeyValue, stack: TStackItem[], onValid: IGenerateDescriptorCallback<T>): T;
  _generateDescriptor(action: IActionType, ...args: any[]): any {
    let stackAppend = [];
    let options = null;
    let onValid: IGenerateDescriptorCallback | null = null;

    while (args.length > 0) {
      const arg = args.pop();

      if (isFunction(arg)) {
        onValid = arg;
      }
      else if (isArray(arg)) {
        stackAppend = arg;
      }
      else if (isPlainObject(arg)) {
        options = arg;
      }
      else {
        invariant(false, `_generateDescriptor invalid argument found: \`${arg}\``);
      }
    }

    const stack = this._generateStack().concat(stackAppend);
    const descriptor = new ResourceDescriptor(this, action, stack);
    options = extend({}, this._options.compose(this), options, {
      invoker: this
    });

    if (!onValid) {
      return descriptor;
    }

    return descriptor.valid && onValid(descriptor, options);
  }
}
