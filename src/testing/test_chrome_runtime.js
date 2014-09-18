// Copyright 2014 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Test version of chrome.runtime.getManifest.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.testing.TestChromeRuntime');

goog.require('goog.asserts');
goog.require('goog.object');
goog.require('goog.testing.PropertyReplacer');



/**
 * @constructor
 * @final
 *
 * @param {string} name
 * @param {string} version
 */
analytics.testing.TestChromeRuntime = function(name, version) {

  /** @private {!analytics.testing.TestChromeRuntime.Manifest} */
  this.manifest_ = {
    name: name,
    version: version
  };

  /** @private {!goog.testing.PropertyReplacer} */
  this.replacer_ = new goog.testing.PropertyReplacer();
};


/**
 * @typedef {{
 *   name: string,
 *   version: string
 * }}
 */
analytics.testing.TestChromeRuntime.Manifest;


/** @return {{name: string, version: string}} */
analytics.testing.TestChromeRuntime.prototype.getManifest = function() {
  return this.manifest_;
};


/**
 * Installs the test chrome storage area in the chrome.storage.local area.
 *
 * @suppress {const|checkTypes}
 */
analytics.testing.TestChromeRuntime.prototype.install = function() {

  // NOTE: This must be defined for a fairly esoteric reason.
  // If operations that write to local storage happen after
  // a test is finished, teardown will happen. In that case,
  // write will fail causing lazy failures.
  goog.asserts.assert(chrome.runtime, '`chrome.runtime` must be defined.');

  this.replacer_.set(
      chrome.runtime,
      'getManifest',
      goog.bind(this.getManifest, this));
};


/** Uninstalls test instrumentation. */
analytics.testing.TestChromeRuntime.prototype.uninstall = function() {
  this.replacer_.reset();
};
