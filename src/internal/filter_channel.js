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
 * @fileoverview Channel that applies client code filters to a hit
 * before it is dispatched for processing by the standard processing
 * pipeline.
 *
 * @author smckay@google.com (Steve McKay)
 */

goog.provide('analytics.internal.FilterChannel');
goog.require('analytics.internal.Channel');

goog.require('goog.async.Deferred');



/**
 * @constructor
 * @implements {analytics.internal.Channel}
 * @struct
 *
 * @param {!analytics.internal.Channel} delegate
 */
analytics.internal.FilterChannel = function(delegate) {

  /** @private {!Array.<!analytics.Tracker.Filter>} */
  this.filters_ = [];

  /** @private {!analytics.internal.Channel} */
  this.delegate_ = delegate;
};


/**
 * Adds a {@code analytics.Tracker.Filter} to the list of
 * filters that will be applied to a hit as it traverses
 * the processing pipeline. Filters are applied in the order
 * they are installed.
 *
 * <p>Filters will not be applied when tracking is disabled by the user.
 *
 * @param {!analytics.Tracker.Filter} filter
 */
analytics.internal.FilterChannel.prototype.addFilter = function(filter) {
  if (!goog.isFunction(filter)) {
    throw new Error('Invalid filter. Must be a function.');
  }
  this.filters_.push(filter);
};


/** @override */
analytics.internal.FilterChannel.prototype.send =
    function(hitType, parameters) {

  var hit = new analytics.Tracker.Hit(hitType, parameters);

  for (var i = 0; i < this.filters_.length; i++) {
    this.filters_[i](hit);
    if (hit.canceled()) {
      break;
    }
  }

  return hit.canceled() ?
      goog.async.Deferred.succeed() :
      this.delegate_.send(hitType, parameters);
};
