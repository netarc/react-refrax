/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { singular } from 'pluralize';

import { Store } from 'store/store';
import { cleanPath, invariant } from 'util/tools';

export const validatePath = (scope: string, path: string) => {
  invariant(typeof(path) === 'string' && path.length >= 0,
    `${scope} - A valid path must be passed, but found type \`${typeof(path)}\` with value \`${path}\`.`
  );

  return cleanPath(path);
};

export const defaultStore = (scope: string, identifier: string, store?: Store | string) => {
  if (!store) {
    store = new Store({ type: singular(identifier) });
  }
  else if (typeof(store) === 'string') {
    store = new Store({ type: store });
  }
  else {
    invariant(store instanceof Store,
      `${scope} - A valid store reference of either a \`String\` or \`Store\` type must be passed, ` +
      `but found type \`${typeof(store)}\`.`
    );
  }

  return store;
};

export const storeReference = (scope: string, identifier: string, store?: Store | string) => {
  if (!store) {
    return singular(identifier);
  }
  else if (typeof(store) === 'string') {
    return store;
  }
  else {
    invariant(store instanceof Store,
      `${scope} - A valid store reference of either a \`String\` or \`Store\` type must be passed, ` +
      `but found type \`${typeof(store)}\`.`
    );
  }

  return store;
};
