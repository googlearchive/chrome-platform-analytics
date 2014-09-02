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
 * @fileoverview A collection of useful strategies for labeling numeric data in
 * Event hits. It's often useful in the field to group data based on values
 * and be able to examine these groups in the Analytics dashboard. For instance,
 * the ExponentialLabelerBuilder allows you to build a filter that would map
 * the following events to the following labels:
 *
 * <pre>
 *    50 -> "32-64"
 *    51 -> "32-64"
 *    120 -> "64-128"
 *    15 -> "8-16"
 *    ...
 * </pre>
 *
 * Then, in the Analytics frontend, you can see these events grouped by label
 * to know there was 1 hit in the 8-16 range, 2 hits in the 32-64 range, 1 hit
 * in the 64-128 range.
 *
 * <p>NOTE: "Timing" hits already have this functionality built in to the Google
 * Analytics dashboard (it's the "Distribution" tab). So you don't need to
 * bucket your timings. That's why we don't provide prepackaged labeler filters
 * for timing hits.
 *
 * @author orenb@google.com (Oren Blasberg)
 */
goog.provide('analytics.filters.EventLabelers');

goog.require('analytics.HitTypes');
goog.require('analytics.Parameters');
goog.require('goog.array');


/**
 * Builder class for an exponential labeler filter. Filters built using this
 * class will auto-generate a label based on the the value supplied with the
 * hit. The filter will not overwrite an existing event label. So the hit must
 * have {@code undefined} for the label in order for the generated label to
 * apply.
 *
 * <p>Example: If 205 were passed in, this function would
 * generate a label of '128-256'.
 *
 * <p>NOTE: Negative or zero values just get mapped to "<= 0".
 *
 * @constructor
 * @struct
 */
analytics.filters.EventLabelers.ExponentialLabelerBuilder = function() {
  /**
   * If true, the event value for the hit will be stripped out (in addition to
   * the label being applied).
   * @private {boolean}
   */
  this.stripValue_ = false;
};


/**
 * @return {!analytics.filters.EventLabelers.ExponentialLabelerBuilder} This
 *     builder, configured such that the event value for hits gets stripped out.
 */
analytics.filters.EventLabelers.ExponentialLabelerBuilder.prototype.stripValue =
    function() {
  this.stripValue_ = true;
  return this;
};


/**
 * @return {!analytics.Tracker.Filter} The labeler filter itself.
 */
analytics.filters.EventLabelers.ExponentialLabelerBuilder.prototype.build =
    function() {
  /**
   * @param {!analytics.Tracker.Hit} hit
   * @this {analytics.filters.EventLabelers.ExponentialLabelerBuilder}
   */
  var filterFn = function(hit) {
    if (hit.getHitType() != analytics.HitTypes.EVENT ||
        goog.isDefAndNotNull(hit.getParameters().get(
            analytics.Parameters.EVENT_LABEL))) {
      return;
    }

    var newLabel;
    var val = hit.getParameters().get(analytics.Parameters.EVENT_VALUE);

    if (val <= 0) {
      newLabel = '<= 0';
    } else {
      var exp = Math.floor(Math.log(val) / Math.log(2));
      var labelBottom = Math.pow(2, exp);
      var labelTop = Math.pow(2, exp + 1);

      newLabel = labelBottom + '-' + labelTop;
    }

    hit.getParameters().set(analytics.Parameters.EVENT_LABEL, newLabel);
    if (this.stripValue_) {
      hit.getParameters().remove(analytics.Parameters.EVENT_VALUE);
    }
  };
  return goog.bind(filterFn, this);
};


/**
 * Builder class for a labeling filter which applies to event hits and which
 * puts the given positive integer value into the appropriate range (bucket)
 * for the given range bounds. The filter will not overwrite an existing event
 * label. So the hit must have {@code undefined} for the label in order for the
 * generated label to apply.
 *
 * <p>E.g., if rightBounds were [10, 20, 30], then a val of 17 would result in
 * a label of '11-20'.
 *
 * @constructor
 * @struct
 *
 * @param {!Array.<number>} rightBounds The maximum value for each range.
 *     The numbers must be positive and sorted in increasing order.
 */
analytics.filters.EventLabelers.RangeBoundsLabelerBuilder =
    function(rightBounds) {
  /**
   * @private {!Array.<number>} The right bounds of each range.
   */
  this.rightBounds_ = goog.array.clone(rightBounds);

  /**
   * If true, the event value for the hit will be stripped out (in addition to
   * the label being applied).
   * @private {boolean}
   */
  this.stripValue_ = false;
};


/**
 * @return {!analytics.filters.EventLabelers.RangeBoundsLabelerBuilder} This
 *     builder, configured such that the event value for hits gets stripped out.
 */
analytics.filters.EventLabelers.RangeBoundsLabelerBuilder.prototype.stripValue =
    function() {
  this.stripValue_ = true;
  return this;
};


/**
 * @return {!analytics.Tracker.Filter} The labeler filter itself.
 */
analytics.filters.EventLabelers.RangeBoundsLabelerBuilder.prototype.build =
    function() {
  /**
   * @param {!analytics.Tracker.Hit} hit
   * @this {analytics.filters.EventLabelers.RangeBoundsLabelerBuilder}
   */
  var filterFn = function(hit) {
    if (hit.getHitType() != analytics.HitTypes.EVENT ||
        goog.isDefAndNotNull(hit.getParameters().get(
            analytics.Parameters.EVENT_LABEL))) {
      return;
    }

    var generateLabel = goog.bind(function() {
      var val = hit.getParameters().get(analytics.Parameters.EVENT_VALUE);
      var low = 0;
      var high = this.rightBounds_.length - 1;
      var current = 0;

      var newLabel;

      while (low <= high) {
        var index = Math.floor((low + high) / 2);
        current = this.rightBounds_[index];

        if (val <= current) {
          var previous = index == 0 ? 0 : this.rightBounds_[index - 1];
          if (val > previous) {
            return (previous + 1).toString() + '-' + current.toString();
          }
          high = index - 1;
        } else if (val > current) {
          if (index >= (this.rightBounds_.length - 1)) {
            return (goog.array.peek(this.rightBounds_) + 1).toString() + '+';
          }
          low = index + 1;
        }
      }
      return '<= 0';
    }, this);

    hit.getParameters().set(analytics.Parameters.EVENT_LABEL, generateLabel());
    if (this.stripValue_) {
      hit.getParameters().remove(analytics.Parameters.EVENT_VALUE);
    }
  };

  return goog.bind(filterFn, this);
};
