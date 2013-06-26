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
 * @fileoverview Utility methods for working w/ parameters.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.Parameters');


/**
 * Converts a string to a Parameter, or if a Parameter is passed in,
 * simply returns that Parameter.
 *
 * @param {!analytics.Parameter|string} param A Parameter
 *     from the analytics.Parameters enum, or a string representing a
 *     non-standard Parameter. Currently the only non-standard strings
 *     that are supported are 'metricX' and 'dimensionX' where X is a number.
 * @return {!analytics.Parameter} The parameter definition for the
 *     given name. If no such definition exists, one will be created, provided
 *     that the name can be matched to a known parameter.
 */
analytics.internal.Parameters.asParameter = function(param) {
  if (!goog.isString(param)) {
    return param;
  }

  var definition = goog.object.findValue(
      analytics.Parameters,
      /** @param {!analytics.Parameter} instance */
      function(instance) {
        // Match if this is a recognized "id" (which happens
        // to be the human readable string). Don't match on
        // 'metric' and 'dimension' as we provide
        // special handling of those parameters below.
        return instance.id == param &&
            param != 'metric' &&
            param != 'dimension';
      });
  if (goog.isDef(definition)) {
    return definition;
  }

  // If the parameter isn't one of the built in types, check whether it's a
  // valid custom dimension or custom metric. See
  // https://developers.google.com/analytics/devguides/platform/features/customdimsmets
  var match = /^dimension(\d+)$/.exec(param);
  if (!goog.isNull(match)) {
    return {
      id: param,
      name: 'cd' + match[1],
      valueType: analytics.ValueTypes.TEXT,
      maxLength: 150,
      defaultValue: undefined
    };
  }
  match = /^metric(\d+)$/.exec(param);
  if (!goog.isNull(match)) {
    return {
      id: param,
      name: 'cm' + match[1],
      valueType: analytics.ValueTypes.INTEGER,
      maxLength: undefined,
      defaultValue: undefined
    };
  }

  throw new Error(param + ' is not a valid parameter name.');
};
