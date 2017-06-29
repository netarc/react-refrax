const Promise = require('bluebird');
const enzyme = require('enzyme');
const moxios = require('moxios');
const axios = require('axios');
const Utils = require('mocha/lib/utils.js');
const map = Utils.map;
const indexOf = Utils.indexOf;

var isHooked = false;
function moxios_hook() {
  if (!isHooked) {
    isHooked = true;
    moxios.install(axios);
  }
}

const host = '';

global.mock_reset = () => {
  moxios.requests.reset();
  moxios.stubs.reset();
};

global.mock_request_count = () => {
  return moxios.requests.__items.length;
};

global.mock_status = () => {
  const stubs = map(moxios.stubs.__items, item => item.url);

  return map(moxios.requests.__items, item => ({
    url: item.url.replace(host, ''),
    mocked: indexOf(stubs, item.url) !== -1
  }));
};

global.mock_get = function(uri, response, status = 200) {
  moxios_hook();
  moxios.stubRequest(`${host}${uri}`, { status, response });
};

global.mock_post = function(uri, response, status = 200) {
  moxios_hook();
  moxios.stubRequest(`${host}${uri}`, { status, response });
};

global.wait_for_promise = (fn) => {
  return new Promise((resolve, reject) => {
    const failure = setTimeout(() => {
      reject();
      resolve = null;
    }, 5000);
    const hook = () => {
      setTimeout(() => {
        if (!resolve) {
          return;
        }

        if (fn()) {
          clearTimeout(failure);
          resolve();
        }
        else {
          hook();
        }
      }, 10);
    };

    hook();
  });
};

global.delay_for_request = (fn) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const result = fn();
      if (result instanceof Promise) {
        result.then(resolve);
      }
      else {
        resolve();
      }
    }, 1);
  });
};
