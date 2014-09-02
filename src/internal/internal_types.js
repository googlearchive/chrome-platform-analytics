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
 * @fileoverview Internal-only types used by GA Closure API, and helper
 * methods.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.Parameters');
goog.provide('analytics.internal.parameters');

goog.require('analytics.Parameters');
goog.require('analytics.ValueTypes');


/**
 * Parameters used by the library.
 * @enum {analytics.Parameter}
 */
analytics.internal.Parameters = {
  /* Protocol Version */
  API_VERSION: {
    id: 'apiVersion',
    name: 'v',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Application Name */
  APP_NAME: {
    id: 'appName',
    name: 'an',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 100,
    defaultValue: undefined
  },
  /* Application Version */
  APP_VERSION: {
    id: 'appVersion',
    name: 'av',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 100,
    defaultValue: undefined
  },
  /* Client ID */
  CLIENT_ID: {
    id: 'clientId',
    name: 'cid',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* User Language */
  LANGUAGE: {
    id: 'language',
    name: 'ul',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 20,
    defaultValue: undefined
  },
  /* Library version. For internal use only. */
  LIBRARY_VERSION: {
    id: 'libVersion',
    name: '_v',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* User sample rate override */
  SAMPLE_RATE_OVERRIDE: {
    id: 'sampleRateOverride',
    name: 'usro',
    valueType: analytics.ValueTypes.INTEGER,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Screen Colors */
  SCREEN_COLORS: {
    id: 'screenColors',
    name: 'sd',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 20,
    defaultValue: undefined
  },
  /* Screen Resolution */
  SCREEN_RESOLUTION: {
    id: 'screenResolution',
    name: 'sr',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 20,
    defaultValue: undefined
  },
  /* Tracking ID / Web Property ID */
  TRACKING_ID: {
    id: 'trackingId',
    name: 'tid',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: undefined,
    defaultValue: undefined
  },
  /* Viewport size */
  VIEWPORT_SIZE: {
    id: 'viewportSize',
    name: 'vp',
    valueType: analytics.ValueTypes.TEXT,
    maxLength: 20,
    defaultValue: undefined
  }
};


/**
 * Converts a string to a Parameter, or if a Parameter is passed in,
 * simply returns that Parameter.
 *
 * @param {!analytics.Parameter|string} param A Parameter
 *     from the analytics.Parameters enum, or a string representing a
 *     non-standard Parameter. Currently the only non-standard strings
 *     that are supported are 'metricX' and 'dimensionX' where X is a number.
 * @return {!analytics.Parameter} The parameter definition matching the
 *     given param or name. If no such definition exists, one will be created,
 *     provided that the name can be matched to a known parameter.
 */
analytics.internal.parameters.asParameter = function(param) {
  if (!goog.isString(param)) {
    return param;
  }

  var definition = analytics.internal.parameters.findParameter_(
      param, analytics.Parameters);

  if (goog.isObject(definition)) {
    return definition;
  }

  definition = analytics.internal.parameters.findParameter_(
      param, analytics.internal.Parameters);

  if (goog.isObject(definition)) {
    return definition;
  }

  // If the parameter isn't one of the built in types, check whether it's a
  // valid custom dimension or custom metric. See
  // https://developers.google.com/analytics/devguides/platform/features/customdimsmets
  var match = /^dimension(\d+)$/.exec(param);
  if (!goog.isNull(match)) {
    return analytics.createDimensionParam(parseInt(match[1], 10));
  }
  match = /^metric(\d+)$/.exec(param);
  if (!goog.isNull(match)) {
    return analytics.createMetricParam(parseInt(match[1], 10));
  }

  throw new Error(param + ' is not a valid parameter name.');
};


/**
 * Returns the matchign parameter in the enum, or null if not found.
 *
 * @param {string} id The id of the parameter to find.
 * @param {!Object} params An enum of
 *     {@code analytics.Parameter} definitions to seach for a matching param.
 * @return {?analytics.Parameter} The matched param, or null if a match
 *     cannot be found.
 * @private
 */
analytics.internal.parameters.findParameter_ = function(id, params) {
  var definition = goog.object.findValue(
      params,
      /** @param {!analytics.Parameter} instance */
      function(instance) {
        // Match if this is a recognized "id" (which happens
        // to be the human readable string). Don't match on
        // 'metric' and 'dimension' as we provide
        // special handling of those parameters below.
        return instance.id == id &&
            id != 'metric' &&
            id != 'dimension';
      });

  return goog.isObject(definition) ? definition : null;
};
