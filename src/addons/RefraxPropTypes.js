/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxResource = require('RefraxResource');
const RefraxActionEntity = require('RefraxActionEntity');

const RefraxPropTypes = {
  resource(props, propName, componentName) {
    const resource = props[propName];
    if (resource == null) {
      return new Error(
        'Required prop `' + propName + '` was not specified in `' + componentName + '`.'
      );
    }
    else if (!(resource instanceof RefraxResource)) {
      return new Error(
        'Invalid prop `' + propName + '` supplied to `' + componentName + '`, expected a RefraxResource.',
      );
    }
    return null;
  },

  action(props, propName, componentName) {
    const resource = props[propName];
    if (resource == null) {
      return new Error(
        'Required prop `' + propName + '` was not specified in `' + componentName + '`.'
      );
    }
    else if (!(resource instanceof RefraxActionEntity)) {
      return new Error(
        'Invalid prop `' + propName + '` supplied to `' + componentName + '`, expected a RefraxAction.',
      );
    }
    return null;
  }
};

export default RefraxPropTypes;
