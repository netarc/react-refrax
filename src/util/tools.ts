/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type Iterator = (value: any, index: number | string, collection: any) => any | void;
export type Predicate = (value: any, index: number | string, collection: any) => boolean;

const identity: Iterator = (value: any) => value;

export const objToString = Object.prototype.toString;

export const setPrototypeOf = Object.setPrototypeOf || ((value: any, proto: any) => {
  value.__proto__ = proto;

  return value;
});

export const getPrototypeOf = Object.getPrototypeOf || ((value: any) => {
  const proto = value.__proto__;

  if (proto || proto === null) {
    return proto;
  }
  else if (objToString.call(value.constructor) === '[object Function]') {
    return value.constructor.prototype;
  }
  else if (value instanceof Object) {
    return Object.prototype;
  }
  else {
    return null;
  }
});

export const keysFor = Object.keys || ((value: any): string[] => {
  const keys: string[] = [];

  if (typeof(value) !== 'object') {
    return [];
  }

  for (const key in value) {
    if (value.hasOwnProperty(key)) {
      keys.push(key);
    }
  }

  return keys;
});

export const isObject = (value: any): boolean => {
  const type = typeof value;

  return type === 'function' || type === 'object' && Boolean(value);
};

export const isFunction = (value: any): boolean =>
  typeof value === 'function';

export const isArray = Array.isArray || ((value: any): boolean =>
  isObject(value) && objToString.call(value) === '[object Array]'
);

export const isPlainObject = (value: any): boolean =>
  Boolean(value) && typeof(value) === 'object' && getPrototypeOf(value) === Object.prototype;

export const extend = (target: any, ...args: any[]): any => {
  const length = args.length;
  let source;

  if (length < 1 || target === null) {
    return target;
  }

  for (let index = 0; index < length; index++) {
    if (!(source = args[index])) {
      continue;
    }

    const keys = keysFor(source);
    const keysLength = keys.length;

    for (let i = 0; i < keysLength; i++) {
      const key = keys[i];
      target[key] = source[key];
    }
  }

  return target;
};

export const each = (collection: any, iterator: Iterator): any => {
  if (isArray(collection)) {
    const length = collection.length;

    for (let i = 0; i < length; i++) {
      iterator(collection[i], i, collection);
    }
  }
  else {
    const keys = keysFor(collection);
    const length = keys.length;

    for (let i = 0; i < length; i++) {
      iterator(collection[keys[i]], keys[i], collection);
    }
  }

  return collection;
};

export const select = (collection: any, predicate: Predicate): any[] => {
  const results: any[] = [];

  each(collection, (value: any, index: any) => {
    if (predicate(value, index, collection)) {
      results.push(value);
    }
  });

  return results;
};

// tslint:disable-next-line:variable-name
export const any = (collection: any, predicate: Predicate): boolean => {
  if (isArray(collection)) {
    const length = collection.length;

    for (let i = 0; i < length; i++) {
      if (predicate(collection[i], i, collection)) {
        return true;
      }
    }
  }
  else {
    const keys = keysFor(collection);
    const length = keys.length;

    for (let i = 0; i < length; i++) {
      if (predicate(collection[keys[i]], keys[i], collection)) {
        return true;
      }
    }
  }

  return false;
};

export const map = (collection: any, iterator: Iterator = identity): any[] => {
  const results: any[] = [];

  if (isArray(collection)) {
    const length = collection.length;

    for (let i = 0; i < length; i++) {
      results[i] = iterator(collection[i], i, collection);
    }
  }
  else {
    const keys = keysFor(collection);
    const length = keys.length;

    for (let i = 0; i < length; i++) {
      const key: string = keys[i];
      results[key as any] = iterator(collection[key], key, collection);
    }
  }

  return results;
};

export const concatUnique = (...args: any[]): any[] => {
  const length = args.length;
  const hash: any = {};
  const result: any[] = [];

  for (let i = 0; i < length; i++) {
    let arr = args[i] || [];

    if (!isArray(arr)) {
      arr = [arr];
    }

    const arrLength = arr.length;
    for (let j = 0; j < arrLength; j++) {
      const val = arr[j];

      if (hash[val] !== true) {
        result[result.length] = val;
        hash[val] = true;
      }
    }
  }

  return result;
};

export const deepCopy = (value: any): any[] | object => {
  if (isArray(value)) {
    const length = value.length;
    const out = [];
    for (let i = 0; i < length; i++) {
      out[i] = deepCopy(value[i]);
    }

    return out;
  }
  else if (typeof value === 'object') {
    const keys = keysFor(value);
    const length = keys.length;
    const out: any = {};
    for (let i = 0; i < length; i++) {
      out[i] = deepCopy(value[i]);
    }

    return out;
  }

  return value;
};

export const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const nextTick = (callback: (...args: any[]) => void): void => {
  setTimeout(callback, 0);
};

export const randomString = (length: number): string => {
  let str = '';
  const min = 0;
  const max = 62;

  for (let i = 0; i < length; i++) {
    // tslint:disable-next-line:no-bitwise
    let r = Math.random() * (max - min) + min << 0;
    // tslint:disable-next-line:no-magic-numbers
    r += r > 9 ? (r < 36 ? 55 : 61) : 48;
    str += String.fromCharCode(r);
  }

  return str;
};

export const isPromise = (value: any): boolean =>
  isObject(value) && isFunction(value.then) && isFunction(value.catch);

export const cleanIdentifier = (value: string): string =>
  (value.split('/').pop() || '')
        .replace('-', '_')
        .replace(/[^\w]+/g, '');

export const cleanPath = (path: string): string =>
  path.replace(/^[\/\s]+|[\/\s]+$/g, '');

export const format = (message: string, ...args: any[]): string => {
  let arg = 0;

  if (!message) {
    throw new Error(
      '`format(message, ...args)` requires a message argument'
    );
  }

  return message.replace(/%s/g, () => args[arg++]);
};

export const invariant = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

export const warning = (condition: boolean, message: string): void => {
  if (!condition) {
    if (typeof console !== 'undefined') {
      // tslint:disable-next-line:no-console
      console.error(message);
    }
    else {
      throw new Error(message);
    }
  }
};
