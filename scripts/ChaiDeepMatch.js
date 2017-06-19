const chai = require('chai');

function pluginDeepMatch(chai, utils) {
  function deepMatchObject(expect, actual, path) {
    path = path || '';

    // null value
    if (expect === null) {
      if (actual !== null) {
        throw 'Expected to have null but got "' + actual + '" at path "' + path + '".';
      }

      return true;
    }

    // undefined expected value
    if (typeof expect == 'undefined') {
      if (typeof actual !== 'undefined') {
        throw 'Expected to have undefined but got "' + actual + '" at path "' + path + '".';
      }

      return true;
    }

    if (expect === Number) {
      if (typeof actual !== 'number') {
        throw 'Expected to have "' + expect.name + '" but got "' + actual + '" at path "' + path + '".';
      }
      return true;
    }

    if (expect === String) {
      if (typeof actual !== 'string') {
        throw 'Expected to have "' + expect.name + '" but got "' + actual + '" at path "' + path + '".';
      }
      return true;
    }

    // scalar description
    if (/boolean|number|string/.test(typeof expect)) {
      if (expect != actual) {
        throw 'Expected to have "' + expect + '" but got "' + actual + '" at path "' + path + '".';
      }

      return true;
    }

    // dates
    if (expect instanceof Date) {
      if (actual instanceof Date) {
        if (expect.getTime() != actual.getTime()) {
          throw(
            'Expected to have date "' + expect.toISOString() + '" but got ' +
            '"' + actual.toISOString() + '" at path "' + path + '".'
          );
        }
      } else {
        throw(
          'Expected to have date "' + expect.toISOString() + '" but got ' +
          '"' + actual + '" at path "' + path + '".'
        );
      }
    }

    if (actual === null) {
      throw 'Expected to have an array/object but got null at path "' + path + '".';
    }

    if (Object.prototype.toString.call(expect) !== Object.prototype.toString.call(actual)) {
      throw 'Expected to have "' + expect + '" but got "' + actual + '" at path "' + path + '".';
    }

    // array/object description
    for (var prop in expect) {
      if (typeof actual[prop] == 'undefined' && typeof expect[prop] != 'undefined') {
        throw 'Expected "' + prop + '" field to be defined at path "' + path +  '".';
      }

      deepMatchObject(expect[prop], actual[prop], (path == '') ? prop : path + '.' + prop);
    }

    return true;
  }

  utils.overwriteMethod(chai.Assertion.prototype, 'match', function(_super) {
    return function(expect) {
      if (utils.flag(this, 'deep')) {
        try {
          deepMatchObject(expect, this._obj);
        }
        catch (msg) {
          // throw new chai.AssertionError(msg);
          this.assert(false, msg, undefined, expect, this._obj, true);
        }
      }
      else {
        _super.apply(this, arguments);
      }
    }
  });
};

chai.use(pluginDeepMatch);
