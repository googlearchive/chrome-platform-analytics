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
 * Convenience classes for building hits.
 *
 * @see analytics.EventBuilder
 *
 * @author smckay@google.com (Steve McKay)
 */
goog.provide('analytics.EventBuilder');



/**
 * A class that aids in the building of event hits. Create instances
 * of this class using {@code analytics.EventBuilder#create}.
 *
 * @constructor
 * @struct
 *
 * @param {function(!analytics.Tracker, !analytics.ParameterMap):
 *     !goog.async.Deferred} delegate
 */
analytics.EventBuilder = function(delegate) {

  /**
   * @private {function(!analytics.Tracker, !analytics.ParameterMap):
   *     !goog.async.Deferred}
   */
  this.delegate_ = delegate;

  /** @private {!analytics.Parameter} */
  this.parameter_;

  /** @private {!analytics.Value} */
  this.value_;
};


/**
 * @param {string} category
 *
 * @return {!analytics.EventBuilder}
 */
analytics.EventBuilder.prototype.category = function(category) {
  var builder = new analytics.EventBuilder(
      goog.bind(this.send_, this));
  builder.parameter_ = analytics.Parameters.EVENT_CATEGORY;
  builder.value_ = category;
  return builder;
};


/**
 * @param {string} action
 *
 * @return {!analytics.EventBuilder}
 */
analytics.EventBuilder.prototype.action = function(action) {
  var builder = new analytics.EventBuilder(
      goog.bind(this.send_, this));
  builder.parameter_ = analytics.Parameters.EVENT_ACTION;
  builder.value_ = action;
  return builder;
};


/**
 * @param {string} label
 *
 * @return {!analytics.EventBuilder}
 */
analytics.EventBuilder.prototype.label = function(label) {
  var builder = new analytics.EventBuilder(
      goog.bind(this.send_, this));
  builder.parameter_ = analytics.Parameters.EVENT_LABEL;
  builder.value_ = label;
  return builder;
};


/**
 * @param {number} value
 *
 * @return {!analytics.EventBuilder}
 */
analytics.EventBuilder.prototype.value = function(value) {
  var builder = new analytics.EventBuilder(
      goog.bind(this.send_, this));
  builder.parameter_ = analytics.Parameters.EVENT_VALUE;
  builder.value_ = value;
  return builder;
};


/**
 * @param {number} index
 * @param {string} value
 *
 * @return {!analytics.EventBuilder}
 */
analytics.EventBuilder.prototype.dimension = function(index, value) {
  var builder = new analytics.EventBuilder(
      goog.bind(this.send_, this));
  builder.parameter_ = analytics.createDimensionParam(index);
  builder.value_ = value;
  return builder;
};


/**
 * @param {number} index
 * @param {number} value
 *
 * @return {!analytics.EventBuilder}
 */
analytics.EventBuilder.prototype.metric = function(index, value) {
  var builder = new analytics.EventBuilder(
      goog.bind(this.send_, this));
  builder.parameter_ = analytics.createMetricParam(index);
  builder.value_ = value;
  return builder;
};


/**
 * @param {!analytics.Tracker} tracker
 *
 * @return {!goog.async.Deferred}
 */
analytics.EventBuilder.prototype.send = function(tracker) {
  return this.send_(tracker, new analytics.ParameterMap());
};


/**
 * @param {!analytics.Tracker} tracker
 * @param {!analytics.ParameterMap} parameters
 *
 * @return {!goog.async.Deferred}
 * @private
 */
analytics.EventBuilder.prototype.send_ =
    function(tracker, parameters) {
  return this.delegate_(tracker, this.extend_(parameters));
};


/**
 * Extends the supplied parameters with the parameters from this
 * instance.
 *
 * @param {!analytics.ParameterMap} parameters
 *
 * @return {!analytics.ParameterMap} It's the same instance that
 *     was passed in, but for the sake of convenience, we'll return it too :).
 * @private
 */
analytics.EventBuilder.prototype.extend_ = function(parameters) {
  if (goog.isDefAndNotNull(this.parameter_) &&
      goog.isDefAndNotNull(this.value_)) {
    parameters.set(this.parameter_, this.value_);
  }
  return parameters;
};


/**
 * Creates a HitBuilder...and returns it to you. Each call
 * to a mutator method on this class (all methods except
 * {@code send}), return a new instance of the builder that
 * itself is immutable. That means plenty of object allocations.
 * You might even say more than expected. So you may not want to
 * use this class in performance sensitive code.
 *
 * @return {!analytics.EventBuilder}
 */
analytics.EventBuilder.create = function() {
  return new analytics.EventBuilder(
      /**
       * @param {!analytics.Tracker} tracker
       * @param {!analytics.ParameterMap} parameters
       */
      function(tracker, parameters) {
        return tracker.send(
            analytics.HitTypes.EVENT,
            parameters);
      });
};

