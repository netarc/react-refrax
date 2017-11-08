// Copyright 2017 Matt Zabriskie
// https://github.com/mzabriskie/moxios
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

// tslint:disable: no-require-imports no-var-requires no-console no-unnecessary-class no-magic-numbers prefer-template

import axios from 'axios';
import * as Promise from 'bluebird';
const buildURL = require('axios/lib/helpers/buildURL');
const isURLSameOrigin = require('axios/lib/helpers/isURLSameOrigin');
const btoa = require('axios/lib/helpers/btoa');
const cookies = require('axios/lib/helpers/cookies');
const settle = require('axios/lib/core/settle');

Promise.config({
  longStackTraces: true
});

export interface IKeyValue {
  [key: string]: any;
}

// The default adapter
let defaultAdapter: any;

/**
 * The mock adapter that gets installed.
 *
 * @param resolve The function to call when Promise is resolved
 * @param reject The function to call when Promise is rejected
 * @param config The config object to be used for the request
 */
const mockAdapter = (config: IKeyValue) =>
  new Promise((resolve, reject) => {
    const request = new Request(resolve, reject, config);
    axiosMock.requests.track(request);

    // Check for matching stub to auto respond with
    const l = axiosMock.stubs.count();
    for (let i = 0; i < l; i++) {
      const stub = axiosMock.stubs.at(i);
      const correctURL = stub.url instanceof RegExp ? stub.url.test(request.url) : stub.url === request.url;
      let correctMethod = true;

      if (stub.method !== undefined) {
        correctMethod = stub.method.toLowerCase() === request.config.method.toLowerCase();
      }

      if (!stub.resolved && correctURL && correctMethod) {
        // console.info("responding to request(%o) with (%o)", request, stub);
        return request.respondWith(stub);
      }
    }

    const err = new Error(`unstubbed request: ${config.method} ${config.url}`);
    reject(err);
  });

export class Tracker<T> {
  __items: T[];

  constructor() {
    this.__items = [];
  }

  /**
   * Reset all the items being tracked
   */
  reset(): void {
    this.__items.splice(0);
  }

  /**
   * Add an item to be tracked
   */
  track(item: T): void {
    this.__items.push(item);
  }

  /**
   * The count of items being tracked
   */
  count(): number {
    return this.__items.length;
  }

  /**
   * Get an item being tracked at a given index
   *
   * @param index The index for the item to retrieve
   */
  at(index: number): T {
    return this.__items[index];
  }

  /**
   * Get the first item being tracked
   */
  first(): T {
    return this.at(0);
  }

  /**
   * Get the most recent (last) item being tracked
   */
  mostRecent(): T {
    return this.at(this.count() - 1);
  }

  /**
   * Dump the items being tracked to the console.
   */
  debug(): void {
    console.log();
    this.__items.forEach((element) => {
      let output;

      if (element instanceof Request) {
        output = element.config.method.toLowerCase() + ', ';
        output += element.config.url;
      }
      else if (element instanceof Stub) {
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
  get(method: string, url: string): T {
    const getElem = (element: T, _index: number, _array: T[]): boolean => {
      if (element instanceof Request) {
        return element.url === url && method.toLowerCase() === element.config.method.toLowerCase();
      }
      else if (element instanceof Stub) {
        const matchedUrl = (element.url instanceof RegExp) ? element.url.test(url) : element.url === url;

        return matchedUrl && method.toLowerCase() === element.method.toLowerCase();
      }

      return false;
    };

    return this.__items.find(getElem)!;
  }

  /**
   * Stop an element from being tracked by removing it. Finds and returns the element,
   * given the HTTP method and the URL.
   */
  remove(method: string, url: string): T {
    const elem = this.get(method, url);
    const index = this.__items.indexOf(elem);

    return this.__items.splice(index, 1)[0];
  }
}

export class Request {
  resolve: any;
  reject: any;
  config: any;

  headers: IKeyValue;
  url: string;
  timeout: number;
  withCredentials: boolean;
  responseType: any;
  resolved: any;

  /**
   * Create a new Request object
   *
   * @param resolve The function to call when Promise is resolved
   * @param reject The function to call when Promise is rejected
   * @param config The config object to be used for the request
   */
  constructor(resolve: (result: any) => void, reject: (result: any) => void, config: IKeyValue) {
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
   * @param res The data representing the result of the request
   */
  respondWith(stub: Stub): void {
    this.resolved = true;
    stub.resolve();
    // Every successful request has a delay
    setTimeout(() => {
      const response = new Response(this, stub.response);
      settle(this.resolve, this.reject, response);
    }, 5);
  }
}

export class Response {
  config: IKeyValue;
  data: any;
  status: number;
  statusText: string;

  headers: IKeyValue;
  request: Request;
  code: any;

  /**
   * Create a new Response object
   *
   * @param req The Request that this Response is associated with
   * @param res The data representing the result of the request
   */
  constructor(req: Request, res: IKeyValue) {
    this.config = req.config;
    this.data = res.responseText || res.response;
    this.status = res.status;
    this.statusText = res.statusText;

    /* lowecase all headers keys to be consistent with Axios */
    if ('headers' in res) {
      const newHeaders: IKeyValue = {};
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

export class Stub {
  method: string;
  url: string | RegExp;
  response: IKeyValue;
  resolved: boolean;

  constructor(method: string, url: string | RegExp, response: IKeyValue) {
    this.method = method;
    this.url = url;
    this.response = response;
    this.resolved = false;
  }

  resolve(): void {
    this.resolved = true;
  }
}

export interface IAxiosMock {
  stubs: Tracker<Stub>;
  requests: Tracker<Request>;
  install(instance: IKeyValue): void;
  uninstall(instance: IKeyValue): void;
  stubRequest(method: string, urlOrRegExp: string | RegExp, response: IKeyValue): void;
}

export const axiosMock: IAxiosMock = {
  stubs: new Tracker<Stub>(),
  requests: new Tracker<Request>(),

  /**
   * Install the mock adapter for axios
   */
  install(this: any, instance: IKeyValue = axios): void {
    defaultAdapter = instance.defaults.adapter;
    instance.defaults.adapter = mockAdapter;
  },

  /**
   * Uninstall the mock adapter and reset state
   */
  uninstall(this: any, instance: IKeyValue = axios): void {
    instance.defaults.adapter = defaultAdapter;
    this.stubs.reset();
    this.requests.reset();
  },

  /**
   * Stub a response to be used to respond to a request matching a method and a URL or RegExp
   *
   * @param method An axios command
   * @param urlOrRegExp A URL or RegExp to test against
   * @param response The response to use when a match is made
   */
  stubRequest(this: any, method: string, urlOrRegExp: string | RegExp, response: IKeyValue): void {
    this.stubs.track(new Stub(method, urlOrRegExp, response));
  }
};
