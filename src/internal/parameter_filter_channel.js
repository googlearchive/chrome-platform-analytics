// Copyright 2013 Google Inc. All Rights Reserved.
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
 * @fileoverview A Channel that filters parameters in a hit per business rules.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.ParameterFilterChannel');

goog.require('analytics.Parameter');
goog.require('analytics.ValueType');
goog.require('analytics.internal.Channel');

goog.require('goog.async.Deferred');



/**
 * @constructor
 * @param {!analytics.internal.Channel} delegate
 * @implements {analytics.internal.Channel}
 * @struct
 */
analytics.internal.ParameterFilterChannel = function(delegate) {
  /** @private {!analytics.internal.Channel} */
  this.delegate_ = delegate;
};


/** @override */
analytics.internal.ParameterFilterChannel.prototype.send =
    function(hitType, parameters) {
  analytics.internal.ParameterFilterChannel.truncateStrings_(parameters);
  analytics.internal.ParameterFilterChannel.removeDefaults_(parameters);
  return this.delegate_.send(hitType, parameters);
};


/**
 * @param {!analytics.ParameterMap} parameters
 * @private
 */
analytics.internal.ParameterFilterChannel.truncateStrings_ =
    function(parameters) {
  parameters.forEachEntry(
      /**
       * @param {!analytics.Parameter} parameter
       * @param {!analytics.Value} value
       */
      function(parameter, value) {
        if (goog.isDef(parameter.maxLength) &&
            parameter.valueType == analytics.ValueTypes.TEXT &&
            parameter.maxLength > 0 &&
            value.length > parameter.maxLength) {
          parameters.set(parameter, value.substring(0, parameter.maxLength));
        }
      });
};


/**
 * @param {!analytics.ParameterMap} parameters
 * @private
 */
analytics.internal.ParameterFilterChannel.removeDefaults_ =
    function(parameters) {
  parameters.forEachEntry(
      /**
       * @param {!analytics.Parameter} parameter
       * @param {!analytics.Value} value
       */
      function(parameter, value) {
        if (goog.isDef(parameter.defaultValue) &&
            value == parameter.defaultValue) {
          parameters.remove(parameter);
        }
      });
};
