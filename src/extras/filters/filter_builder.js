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
 * @fileoverview Support for building filters that are called
 * only when a {@code analytics.Tracker.Hit} matches certain
 * conditions.
 *
 * <p>Example:
 *
 * <pre>
 * var filter = new analytics.filters.FilterBuilder().
 *     whenHitType(analytics.HitTypes.EVENT,
 *     whenValues(
 *         analytics.Parameters.EVENT_CATEGORY,
 *         'Entertainment').
 *     whenValues(     // multiple calls to whenValues are basically "AND"s
 *         analytics.Parameters.EVENT_ACTION,
 *         'Singing',  // multiple values are basically "OR"s
 *         'Dancing').
 *     applyFilter(
 *         function(hit) {
 *           // Only called when this has specified parameters.
 *         })
 *     .build();
 *
 * tracker.addFilter(filter);
 * </pre>
 *
 * This simplifies the user of filters by means of moving matching code
 * into an easy to build opaque wrapper.
 *
 * @author smckay@google.com (Steve McKay)
 */

goog.provide('analytics.filters.FilterBuilder');

goog.require('goog.array');



/**
 * Class that facilitates building filters that are called
 * only when a {@code analytics.Tracker.Hit} matches certain
 * conditions.
 *
 * @constructor
 * @struct
 */
analytics.filters.FilterBuilder = function() {

  /** @private {!Array.<!analytics.filters.FilterBuilder.Predicate>} */
  this.predicates_ = [];

  /** @private {!analytics.Tracker.Filter} */
  this.delegate_;
};


/**
 * Returns true to indicate that a filter should be applied to a hit.
 * This is the means by which you match your filters to hits with
 * particular qualities.
 *
 * <p>NOTE: A predicate should not mutate a hit. If you want to mutate
 * a hit, do it in a filter.
 *
 * @typedef {function(!analytics.Tracker.Hit): boolean}
 */
analytics.filters.FilterBuilder.Predicate;


/**
 * Factory method...because for some reason newing up a builder seems wierd.
 *
 * @return {!analytics.filters.FilterBuilder}
 */
analytics.filters.FilterBuilder.builder = function() {
  return new analytics.filters.FilterBuilder();
};


/**
 * Matches filter to hits where {@code predicate} returns {@code true}.
 *
 * <p>NOTE: In most cases use of {@code #whenHitType} and
 * {@code #whenValue} is preferred to writing your own predicate.
 *
 * @param {!analytics.filters.FilterBuilder.Predicate} predicate
 * @return {!analytics.filters.FilterBuilder}
 */
analytics.filters.FilterBuilder.prototype.when = function(predicate) {
  this.predicates_.push(predicate);
  return this;
};


/**
 * Restricts filter to hits with a matching hitType. Note that hitTypes
 * from this call are effectively ANDed with all other calls. If you
 * want to support multiple hit types, pass them in a single call.
 *
 * @param {...!analytics.HitType} var_args
 * @return {!analytics.filters.FilterBuilder}
 */
analytics.filters.FilterBuilder.prototype.whenHitType =
    function(var_args) {
  var hitTypes = arguments;
  this.when(
      /**
       * @param {!analytics.Tracker.Hit} hit
       * @return {boolean}
       */
      function(hit) {
        return goog.array.contains(hitTypes, hit.getHitType());
      });
  return this;
};


/**
 * Matches hits where {@code parameter} has one of the specified values.
 *
 * <p>NOTE: Multiple calls to this method will result in the conditions
 * described in call 1 being ANDed with the conditions described in call 2.
 *
 * @param {!analytics.Parameter} parameter The parameter identifying
 *     the value to check in the hit.
 * @param {...!analytics.Value} var_args List of values to match.
 * @return {!analytics.filters.FilterBuilder}
 */
analytics.filters.FilterBuilder.prototype.whenValue =
    function(parameter, var_args) {
  var values = goog.array.slice(arguments, 1);
  this.when(
      /**
       * @param {!analytics.Tracker.Hit} hit
       * @return {boolean}
       */
      function(hit) {
        return goog.array.contains(
            values,
            hit.getParameters().get(parameter));
      });
  return this;
};


/**
 * Specifies the filter to be called if all conditions are met.
 * Only one filter can be specified.
 *
 * @param {!analytics.Tracker.Filter} filter
 * @param {!Object=} opt_scope Optional scope in which to call the filter.
 *
 * @return {!analytics.filters.FilterBuilder}
 */
analytics.filters.FilterBuilder.prototype.applyFilter =
    function(filter, opt_scope) {
  if (goog.isObject(this.delegate_)) {
    throw new Error('Filter has already been set.');
  }
  this.delegate_ = goog.isObject(opt_scope) ?
      goog.bind(filter, opt_scope) : filter;
  return this;
};


/**
 * Builds the filter.
 *
 * @return {!analytics.Tracker.Filter}
 */
analytics.filters.FilterBuilder.prototype.build = function() {
  if (goog.array.isEmpty(this.predicates_)) {
    throw new Error(
        'Must specify at least one predicate using #when or a helper method.');
  }
  if (!goog.isObject(this.delegate_)) {
    throw new Error('Must specify a delegate filter using #applyFilter.');
  }
  return goog.bind(
      /**
       * @param {!analytics.Tracker.Hit} hit
       * @this {analytics.filters.FilterBuilder}
       */
      function(hit) {
        var shouldApply = goog.array.every(
            this.predicates_,
            /**
             * @param {!analytics.filters.FilterBuilder.Predicate}
             *     predicate
             */
            function(predicate) {
              return predicate(hit);
            });
        if (shouldApply) {
          this.delegate_(hit);
        }
      },
      this);
};
