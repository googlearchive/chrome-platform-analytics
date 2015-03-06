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

goog.require('analytics.Tracker.Hit');
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

  if (this.filters_.length == 0) {
    return this.delegate_.send(hitType, parameters);
  } else {
    var hit = new analytics.internal.FilterChannel.Hit(hitType, parameters);
    return this.applyFilter_(0, hit)
        .addCallback(
            /**
             * @this {analytics.internal.FilterChannel}
             */
            function() {
              if (!hit.canceled_) {
                return this.delegate_.send(hitType, parameters);
              }
            },
            this);
  }
};


/**
 * Applies the specified filter, and the next until there are no more,
 * or once cancels the hit.
 *
 * @param {number} index Index of filter to apply.
 * @param {!analytics.internal.FilterChannel.Hit} hit
 *
 * @return {!goog.async.Deferred} Resolves when all filters have been
 *     applied, or hit has been cancelled.
 * @private
 */
analytics.internal.FilterChannel.prototype.applyFilter_ =
      function(index, hit) {
    return goog.async.Deferred.succeed()
        .addCallback(
            /** @this {analytics.internal.FilterChannel} */
            function() {
              // TODO(smckay): Once all filter user have been updated
              // just call this directly.
              return this.filters_[index](hit);
            },
            this)
        .addCallback(
            /**
             * Recurses into applyFilter_ if there are more filters to be
             *     applied and the hit has not be cancelled.
             * @this {analytics.internal.FilterChannel}
             */
            function() {
              if (++index < this.filters_.length && !hit.canceled_) {
                return this.applyFilter_(index, hit);
              }
            },
            this);
};



/**
 * The implementation of the {@code Hit} used by FilterChannel.
 *
 * @constructor
 * @implements {analytics.Tracker.Hit}
 * @struct
 *
 * @param {!analytics.HitType} type
 * @param {!analytics.ParameterMap} parameters

 */
analytics.internal.FilterChannel.Hit = function(type, parameters) {
  /** @private {!analytics.HitType} */
  this.type_ = type;

  /** @private {!analytics.ParameterMap} */
  this.parameters_ = parameters;

  /** @private {boolean} */
  this.canceled_ = false;
};


/** @override */
analytics.internal.FilterChannel.Hit.prototype.getHitType = function() {
  return this.type_;
};


/** @override */
analytics.internal.FilterChannel.Hit.prototype.getParameters = function() {
  return this.parameters_;
};


/** @override */
analytics.internal.FilterChannel.Hit.prototype.cancel = function() {
  this.canceled_ = true;
};
