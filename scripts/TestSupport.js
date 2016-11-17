const Promise = require('bluebird');
const JSDOM = require('jsdom').JSDOM;
const axiosMock = require('AxiosMock.js');
const axios = require('axios');
const Utils = require('mocha/lib/utils.js');
const map = Utils.map;

// IMPORTANT: We need to setup our global window/document otherwise `fbjs` will
// fail to init canUseDOM correctly when `react` or `enzyme` is loaded at the start
// of a test spec file.
const { window } = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js'
};

let fn_mount = null
  , mounted = [];

global.mount_init = () => {
  if (!fn_mount) {
    fn_mount = require('enzyme').mount;
  }
};

global.mount = (component) => {
  const wrapper = fn_mount(component);
  mounted.push(wrapper);
  return wrapper;
};

global.mount_cleanup = () => {
  for (var i = 0, l = mounted.length; i < l; i++) {
    mounted[i].unmount();
  }

  mounted = [];
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
