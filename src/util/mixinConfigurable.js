/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { extend } from 'RefraxTools';
import RefraxOptions from 'RefraxOptions';
import RefraxParameters from 'RefraxParameters';
import RefraxQueryParameters from 'RefraxQueryParameters';


const Mixin = {
  withOptions: function(...args) {
    const clone = this.clone && this.clone() || this;
    clone._options.extend(...args);
    return clone;
  },
  withParams: function(...args) {
    const clone = this.clone && this.clone() || this;
    clone._parameters.extend(...args);
    return clone;
  },
  withQueryParams: function(...args) {
    const clone = this.clone && this.clone() || this;
    clone._queryParams.extend(...args);
    return clone;
  },
  setOptions: function(...args) {
    this._options.extend(...args);
  },
  setParams: function(...args) {
    this._parameters.extend(...args);
  },
  setQueryParams: function(...args) {
    this._queryParams.extend(...args);
  }
};

function mixinConfigurable(target, from) {
  if (!target) {
    throw new TypeError('mixinConfigurable - exepected non-null target');
  }

  Object.defineProperty(target, '_options', {value: new RefraxOptions(from && from._options)});
  Object.defineProperty(target, '_parameters', {value: new RefraxParameters(from && from._parameters)});
  Object.defineProperty(target, '_queryParams', {value: new RefraxQueryParameters(from && from._queryParams)});

  return extend(target, Mixin);
}

export default mixinConfigurable;
