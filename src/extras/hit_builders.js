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

goog.require('analytics');
goog.require('analytics.ParameterMap');
goog.require('analytics.Parameters');



/**
 * A class that aids in the building of event hits. Create instances
 * of this class using {@code analytics.EventBuilder#builder}.
 *
 * @constructor
 * @struct
 *
 * @param {function(!analytics.ParameterMap)} delegate This is the
 *    connection to our parent builder (or an terminal function).
 *    When we're asked to "collect", we put our params in the map,
 *    then call this function to give our parent builder a chance
 *    to contribute (or a terminal function that ends collection).
 */
analytics.EventBuilder = function(delegate) {

  /** @private {function(!analytics.ParameterMap)} */
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
      goog.bind(this.collect, this));
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
      goog.bind(this.collect, this));
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
      goog.bind(this.collect, this));
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
      goog.bind(this.collect, this));
  builder.parameter_ = analytics.Parameters.EVENT_VALUE;
  builder.value_ = value;
  return builder;
};


/**
 * @param {!analytics.EventBuilder.Dimension} dimension
 *
 * @return {!analytics.EventBuilder}
 */
analytics.EventBuilder.prototype.dimension = function(dimension) {
  var builder = new analytics.EventBuilder(
      goog.bind(this.collect, this));
  builder.parameter_ = analytics.createDimensionParam(dimension.index);
  builder.value_ = dimension.value;
  return builder;
};


/**
 * @param {!analytics.EventBuilder.Metric} metric
 *
 * @return {!analytics.EventBuilder}
 */
analytics.EventBuilder.prototype.metric = function(metric) {
  var builder = new analytics.EventBuilder(
      goog.bind(this.collect, this));
  builder.parameter_ = analytics.createMetricParam(metric.index);
  builder.value_ = metric.value;
  return builder;
};


/**
 * @param {!analytics.Tracker} tracker
 *
 * @return {!goog.async.Deferred}
 */
analytics.EventBuilder.prototype.send = function(tracker) {
  var parameters = new analytics.ParameterMap();
  this.collect(parameters);
  return tracker.send(analytics.HitTypes.EVENT, parameters);
};


/**
 * Collects all parameters in this builder. Only the most
 * "recently" (closest to the leaves) set value will be added
 * when duplicate parameters have been set in the builder.
 *
 * @param {!analytics.ParameterMap} parameters
 */
analytics.EventBuilder.prototype.collect = function(parameters) {
  this.put_(parameters);
  if (goog.isObject(this.delegate_)) {
    this.delegate_(parameters);
  }
};


/**
 * Puts the parameters known to this instance into {@code parameters}.
 * Parameters will only be added if there is no existing entry.
 *
 * <p>This allows builder instances at the leaves to override values
 * supplied by earlier builders.
 *
 * @param {!analytics.ParameterMap} parameters
 * @private
 */
analytics.EventBuilder.prototype.put_ = function(parameters) {
  if (goog.isDefAndNotNull(this.parameter_) &&
      goog.isDefAndNotNull(this.value_) &&
      !parameters.hasParameter(this.parameter_)) {
    parameters.set(this.parameter_, this.value_);
  }
};


/** @private {!analytics.EventBuilder} */
analytics.EventBuilder.EMPTY_ = new analytics.EventBuilder(goog.nullFunction);


/**
 * Returns an empty HitBuilder instance. Each call
 * to a mutator method on this class (all methods except
 * {@code send}), return a new instance of the builder that
 * itself is immutable. That means plenty of object allocations.
 * You might even say more than expected. So you may not want to
 * use this class in performance sensitive code.
 *
 * @return {!analytics.EventBuilder}
 */
analytics.EventBuilder.builder = function() {
  return analytics.EventBuilder.EMPTY_;
};


/**
 * @typedef {{
 *   index: number,
 *   value: string
 * }}
 */
analytics.EventBuilder.Dimension;


/**
 * @typedef {{
 *   index: number,
 *   value: number
 * }}
 */
analytics.EventBuilder.Metric;
