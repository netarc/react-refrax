import Promise from 'bluebird';
import axiosMock from 'AxiosMock.js';
import axios from 'axios';
import { map } from 'mocha/lib/utils.js';


global.window = {};
// "polyfill" for storage
window.localStorage = window.sessionStorage = {
  __storage: {},
  getItem: function(key) {
    return this.__storage[key] || null;
  },
  setItem: function(key, value) {
    this.__storage[key] = '' + value;
  },
  removeItem: function(key, value) {
    delete this.__storage[key];
  }
};


var isHooked = false;
function axios_hook() {
  if (!isHooked) {
    isHooked = true;
    axiosMock.install(axios);
  }
}

const host = '';

global.mock_reset = () => {
  axiosMock.requests.reset();
  axiosMock.stubs.reset();
  window.localStorage.__storage = {};
};

global.mock_request_count = () => {
  return axiosMock.requests.__items.length;
};

global.mock_status = () => {
  return map(axiosMock.requests.__items, item => ({
    url: item.url.replace(host, ''),
    mocked: item.resolved
  }));
};

global.mock_get = function(uri, response, status = 200) {
  axios_hook();
  axiosMock.stubRequest('get', `${host}${uri}`, { status, response });
};

global.mock_post = function(uri, response, status = 200) {
  axios_hook();
  axiosMock.stubRequest('post', `${host}${uri}`, { status, response });
};

global.mock_put = function(uri, response, status = 200) {
  axios_hook();
  axiosMock.stubRequest('put', `${host}${uri}`, { status, response });
};

global.mock_delete = function(uri, response, status = 200) {
  axios_hook();
  axiosMock.stubRequest('delete', `${host}${uri}`, { status, response });
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

global.delay_for = (delay = 5) => {
  return () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, delay);
    });
  };
};

global.delay_for_resource_request = (resource) => {
  return () => {
    // pre-create our error so we can use its stack-trace when we reject
    const err = new Error('delay timeout!');

    return new Promise((resolve, reject) => {
      let timeout = null;
      const disposer = resource.once('change', () => {
        clearTimeout(timeout);
        resolve();
      });

      timeout = setTimeout(() => {
        disposer();
        reject(err);
      }, 50);
    });
  };
};


global.delay_for_action = (resource) => {
  return () => {
    // pre-create our error so we can use its stack-trace when we reject
    const err = new Error('delay timeout!');

    return new Promise((resolve, reject) => {
      let timeout = null;
      const disposer = resource.once('finish', () => {
        clearTimeout(timeout);
        resolve();
      });

      timeout = setTimeout(() => {
        disposer();
        reject(err);
      }, 50);
    });
  };
};
