// Copyright 2017 Matt Zabriskie
// https://github.com/mzabriskie/moxios
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
const Promise = require('bluebird');
import axios from 'axios';
import buildURL from 'axios/lib/helpers/buildURL';
import isURLSameOrigin from 'axios/lib/helpers/isURLSameOrigin';
import btoa from 'axios/lib/helpers/btoa';
import cookies from 'axios/lib/helpers/cookies';
import settle from 'axios/lib/core/settle';

// The default adapter
let defaultAdapter;

/**
 * The mock adapter that gets installed.
 *
 * @param {Function} resolve The function to call when Promise is resolved
 * @param {Function} reject The function to call when Promise is rejected
 * @param {Object} config The config object to be used for the request
 */
const mockAdapter = (config) => {
  Promise.config({
    longStackTraces: true
  });

  return new Promise(function(resolve, reject) {
    const request = new Request(resolve, reject, config);
    axiosMock.requests.track(request);

    // Check for matching stub to auto respond with
    for (let i=0, l=axiosMock.stubs.count(); i<l; i++) {
      const stub = axiosMock.stubs.at(i);
      const correctURL = stub.url instanceof RegExp ? stub.url.test(request.url) : stub.url === request.url;
      let correctMethod = true;

      if (stub.method !== undefined) {
        correctMethod = stub.method.toLowerCase() === request.config.method.toLowerCase();
      }

      if (!stub.resolved && correctURL && correctMethod) {
        request.respondWith(stub.response);
        stub.resolve();
        return;
      }
    }

    const err = new Error(`unstubbed request: ${config.method} ${config.url}`);
    reject(err);
  });
};

class Tracker {
  constructor() {
    this.__items = [];
  }

  /**
   * Reset all the items being tracked
   */
  reset() {
    this.__items.splice(0);
  }

  /**
   * Add an item to be tracked
   *
   * @param {Object} item An item to be tracked
   */
  track(item) {
    this.__items.push(item);
  }

  /**
   * The count of items being tracked
   *
   * @return {Number}
   */
  count() {
    return this.__items.length;
  }

  /**
   * Get an item being tracked at a given index
   *
   * @param {Number} index The index for the item to retrieve
   * @return {Object}
   */
  at(index) {
    return this.__items[index];
  }

  /**
   * Get the first item being tracked
   *
   * @return {Object}
   */
  first() {
    return this.at(0);
  }

  /**
   * Get the most recent (last) item being tracked
   *
   * @return {Object}
   */
  mostRecent() {
    return this.at(this.count() - 1);
  }

  /**
   * Dump the items being tracked to the console.
   */
  debug() {
    console.log();
    this.__items.forEach((element) => {
      let output;

      if (element.config) {
        // request
        output = element.config.method.toLowerCase() + ', ';
        output += element.config.url;
      }
      else {
        // stub
        output = element.method.toLowerCase() + ', ';
        output += element.url + ', ';
        output += element.response.status + ', ';

        if (element.response.response) {
          output += JSON.stringify(element.response.response);
        }
        else {
          output += '{}';
        }
      }
      console.log(output);
    });
  }

  /**
   * Find and return element given the HTTP method and the URL.
   */
  get(method, url) {
    function getElem(element, index, array) {
      const matchedUrl = element.url instanceof RegExp ? element.url.test(element.url) : element.url === url;
      let matchedMethod;

      if (element.config) {
        // request tracking
        matchedMethod = method.toLowerCase() === element.config.method.toLowerCase();
      }
      else {
        // stub tracking
        matchedMethod = method.toLowerCase() === element.method.toLowerCase();
      }

      if (matchedUrl && matchedMethod) {
        return element;
      }

      return null;
    }

    return this.__items.find(getElem);
  }

  /**
   * Stop an element from being tracked by removing it. Finds and returns the element,
   * given the HTTP method and the URL.
   */
  remove(method, url) {
    const elem = this.get(method, url);
    const index = this.__items.indexOf(elem);

    return this.__items.splice(index, 1)[0];
  }
}

class Request {
  /**
   * Create a new Request object
   *
   * @param {Function} resolve The function to call when Promise is resolved
   * @param {Function} reject The function to call when Promise is rejected
   * @param {Object} config The config object to be used for the request
   */
  constructor(resolve, reject, config) {
    this.resolve = resolve;
    this.reject = reject;
    this.config = config;

    this.headers = config.headers;
    this.url = buildURL(config.url, config.params, config.paramsSerializer);
    this.timeout = config.timeout;
    this.withCredentials = config.withCredentials || false;
    this.responseType = config.responseType;
    this.resolved = false;

    // Set auth header
    if (config.auth) {
      const username = config.auth.username || '';
      const password = config.auth.password || '';
      this.headers.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    // Set xsrf header
    if (typeof document !== 'undefined' && typeof document.cookie !== 'undefined') {
      const xsrfValue = config.withCredentials || isURLSameOrigin(config.url) ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        this.headers[config.xsrfHeaderName] = xsrfValue;
      }
    }
  }

  /**
   * Respond to this request with a specified result
   *
   * @param {Object} res The data representing the result of the request
   */
  respondWith(res) {
    this.resolved = true;
    // Every successful request has a delay
    setTimeout(() => {
      const response = new Response(this, res);
      settle(this.resolve, this.reject, response);
    }, 5);
  }
}

class Response {
  /**
   * Create a new Response object
   *
   * @param {Request} req The Request that this Response is associated with
   * @param {Object} res The data representing the result of the request
   */
  constructor(req, res) {
    this.config = req.config;
    this.data = res.responseText || res.response;
    this.status = res.status;
    this.statusText = res.statusText;

    /* lowecase all headers keys to be consistent with Axios */
    if ('headers' in res) {
      const newHeaders = {};
      for (const header in res.headers) {
        newHeaders[header.toLowerCase()] = res.headers[header];
      }
      res.headers = newHeaders;
    }
    this.headers = res.headers;
    this.request = req;
    this.code = res.code;
  }
}

class Stub {
  constructor(method, url, response) {
    this.method = method;
    this.url = url;
    this.response = response;
    this.resolved = false;
  }

  resolve() {
    this.resolved = true;
  }
}

const axiosMock = {
  stubs: new Tracker(),
  requests: new Tracker(),

  /**
   * Install the mock adapter for axios
   */
  install: function(instance = axios) {
    defaultAdapter = instance.defaults.adapter;
    instance.defaults.adapter = mockAdapter;
  },

  /**
   * Uninstall the mock adapter and reset state
   */
  uninstall: function(instance = axios) {
    instance.defaults.adapter = defaultAdapter;
    this.stubs.reset();
    this.requests.reset();
  },

  /**
   * Stub a response to be used to respond to a request matching a method and a URL or RegExp
   *
   * @param {String} method An axios command
   * @param {String|RegExp} urlOrRegExp A URL or RegExp to test against
   * @param {Object} response The response to use when a match is made
   */
  stubRequest: function(method, urlOrRegExp, response) {
    this.stubs.track(new Stub(method, urlOrRegExp, response));
  }
};

export default axiosMock;
