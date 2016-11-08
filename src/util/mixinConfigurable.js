/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');
const RefraxOptions = require('RefraxOptions');
const RefraxParameters = require('RefraxParameters');
const RefraxQueryParameters = require('RefraxQueryParameters');


const Mixin = {
  withOptions: function(...args) {
    const clone = this.clone && this.clone() || this;
    clone.setOptions(...args);
    return clone;
  },
  withParams: function(...args) {
    const clone = this.clone && this.clone() || this;
    clone.setParams(...args);
    return clone;
  },
  withQueryParams: function(...args) {
    const clone = this.clone && this.clone() || this;
    clone.setQueryParams(...args);
    return clone;
  },
  setOptions: function(...args) {
    RefraxTools.each(args, (options) => {
      RefraxOptions.validate(options);
      RefraxTools.extend(this._options, options);
    });
  },
  setParams: function(...args) {
    RefraxTools.each(args, (params) => {
      RefraxParameters.validate(params);
      RefraxTools.extend(this._parameters, params);
    });
  },
  setQueryParams: function(...args) {
    RefraxTools.each(args, (params) => {
      RefraxQueryParameters.validate(params);
      RefraxTools.extend(this._queryParams, params);
    });
  }
};

function mixinConfigurable(target, from) {
  if (!target) {
    throw new TypeError('mixinConfigurable - exepected non-null target');
  }

  Object.defineProperty(target, '_options', {value: new RefraxOptions(from && from._options)});
  Object.defineProperty(target, '_parameters', {value: new RefraxParameters(from && from._parameters)});
  Object.defineProperty(target, '_queryParams', {value: new RefraxQueryParameters(from && from._queryParams)});

  return RefraxTools.extend(target, Mixin);
}

export default mixinConfigurable;
