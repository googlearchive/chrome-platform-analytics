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
 * @fileoverview Interface providing clients with the ability to read and
 * manipulate service configuration values.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.Config');



/**
 * The interface providing clients with the ability to read and manipulate
 * service configuration values.
 * @interface
 */
analytics.Config = function() {};


/**
 * @param {boolean} permitted True if tracking is permitted.
 */
analytics.Config.prototype.setTrackingPermitted;


/**
 * Throws an error if the value has not yet been read from storage.
 * @return {boolean} True if tracking is permitted.
 */
analytics.Config.prototype.isTrackingPermitted;


/**
 * @param {number} sampleRate User sample rate. An integer from 1 to 100.
 *     If not set defaults to 100.
 */
analytics.Config.prototype.setSampleRate;
