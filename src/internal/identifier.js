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
 * @fileoverview Support for generating random UUIDs.
 * According to wikipedia.
 * Version 4 UUIDs have the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where
 * x is any hexadecimal digit and y is one of 8, 9, a, or b
 * (e.g., f47ac10b-58cc-4372-a567-0e02b2c3d479).
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.Identifier');

goog.require('goog.math');


/** @private {string} */
analytics.internal.Identifier.UUID_FMT_ =
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';


/** @private {RegExp} */
analytics.internal.Identifier.UUID_MATCHER_ =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;


/**
 * @return {string} A randomly generated UUID V4.
 */
analytics.internal.Identifier.generateUuid = function() {
  var chars = analytics.internal.Identifier.UUID_FMT_.split('');
  for (var i = 0, len = chars.length; i < len; i++) {
    switch (chars[i]) {
      case 'x':
        chars[i] = goog.math.randomInt(16).toString(16);
        break;
      case 'y':
        chars[i] = (goog.math.randomInt(4) + 8).toString(16);
        break;
    }
  }

  return chars.join('');
};


/**
 * @param {string} id
 * @return {boolean} True if the UUID is a valid V4 id.
 */
analytics.internal.Identifier.isValidUuid = function(id) {
  return analytics.internal.Identifier.UUID_MATCHER_.test(id);
};
