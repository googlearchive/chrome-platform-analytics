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
 * the EventLabelerBuilder allows you to build a filter that would map
 * the following event values to the following labels:
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
goog.provide('analytics.filters.EventLabelerBuilder');

goog.require('analytics.HitTypes');
goog.require('analytics.Parameters');
goog.require('analytics.filters.Buckets');
goog.require('analytics.filters.FilterBuilder');
goog.require('goog.array');



/**
 * Builder class for a labeler filter. Filters built using this class will
 * auto-generate a label based on the the value supplied with the hit.
 *
 * <p>If an existing label was specified, it will be replaced by the new one
 * unless the {@code appendToExistingLabel()} feature is specified, in which
 * case the new label will be appended to the end of the existing label like so:
 * "Existing Label - 256-512".
 *
 * <p>Example: If 205 were the value for a hit, this function would
 * generate a label of '128-256'.
 *
 * <p>NOTE: Negative or zero values just get mapped to "<= 0". Non-numeric
 * values get left as-is.
 *
 * @constructor
 * @struct
 */
analytics.filters.EventLabelerBuilder = function() {
  /**
   * If true, if an existing label was already specified on the hit, the
   * labeler will append the new label to the end of the existing one,
   * with a separator.
   * @private {boolean}
   */
  this.appendToExistingLabel_ = false;

  /**
   * Separator between existing label and new label, if appendToExistingLabel_
   * is true.
   * @private {string}
   */
  this.labelSeparator_ = '';

  /**
   * If true, the event value for the hit will be stripped out (in addition to
   * the label being applied).
   * @private {boolean}
   */
  this.stripValue_ = false;

  /**
   * The internal labeling strategy which actually applies labels.
   * @private {?analytics.Tracker.Filter}
   */
  this.labeler_ = null;
};


/**
 * @param {string=} opt_separator A separator between existing and new label.
 *     If unspecified, a default ' - ' is used.
 * @return {!analytics.filters.EventLabelerBuilder} This
 *     builder, configured such that the new label gets appended to the end of
 *     the existing one.
 */
analytics.filters.EventLabelerBuilder.prototype.appendToExistingLabel =
    function(opt_separator) {
  this.appendToExistingLabel_ = true;
  this.labelSeparator_ = opt_separator || ' - ';
  return this;
};


/**
 * @return {!analytics.filters.EventLabelerBuilder} This
 *     builder, configured such that the event value for hits gets stripped out.
 */
analytics.filters.EventLabelerBuilder.prototype.stripValue =
    function() {
  this.stripValue_ = true;
  return this;
};


/**
 * Configures the labeler to apply to event hits and put the given positive
 * integer value into the appropriate range power-of-two bucket.
 *
 * <p>E.g.,
 * <pre>
 *    50 -> "32-64"
 *    51 -> "32-64"
 *    120 -> "64-128"
 *    15 -> "8-16"
 *    ...
 * </pre>
 *
 * @return {!analytics.filters.EventLabelerBuilder} This
 *     builder, configured such that the powers-of-two labeler is used.
 */
analytics.filters.EventLabelerBuilder.prototype.powersOfTwo =
    function() {
  return this.labeler(analytics.filters.Buckets.powersOfTwo);
};


/**
 * Configures the labeler to put the given positive integer value into the
 * appropriate range (bucket) for the given range bounds.
 *
 * <p>E.g., if {@code rightBounds} were [10, 20, 30], then a val of 17 would
 * result in a label of '11-20'.
 *
 * @param {!Array.<number>} rightBounds The right bounds of each range.
 *
 * @return {!analytics.filters.EventLabelerBuilder} This
 *     builder, configured such that the range bounds labeler is used.
 */
analytics.filters.EventLabelerBuilder.prototype.rangeBounds =
    function(rightBounds) {
  return this.labeler(
      goog.partial(analytics.filters.Buckets.rangeBounds, rightBounds));
};


/**
 * Configures the labeler to use the supplied labeler function.
 *
 * @param {function(number): string} labeler
 *
 * @return {!analytics.filters.EventLabelerBuilder} This
 *     builder, configured such that the supplied labeler is used.
 */
analytics.filters.EventLabelerBuilder.prototype.labeler =
    function(labeler) {
  if (goog.isDefAndNotNull(this.labeler_)) {
    throw new Error('LabelerBuilder: Only one labeling strategy may be used.');
  }

  this.labeler_ = goog.bind(
      /**
       * @param {!analytics.Tracker.Hit} hit
       * @this {analytics.filters.EventLabelerBuilder}
       */
      function(hit) {
        var val = hit.getParameters().get(analytics.Parameters.EVENT_VALUE);
        var oldLabel = hit.getParameters().get(
            analytics.Parameters.EVENT_LABEL);
        if (!goog.isNumber(val)) {
          return;
        }

        var newLabel = labeler(val);
        if (goog.isDefAndNotNull(oldLabel) && this.appendToExistingLabel_) {
          newLabel = oldLabel + this.labelSeparator_ + newLabel;
        }

        hit.getParameters().set(analytics.Parameters.EVENT_LABEL, newLabel);
      },
      this);

  return this;
};


/**
 * @return {!analytics.Tracker.Filter} The labeler filter itself.
 */
analytics.filters.EventLabelerBuilder.prototype.build = function() {
  /**
   * @param {!analytics.Tracker.Hit} hit
   * @this {analytics.filters.EventLabelerBuilder}
   */
  var stripValueFn = function(hit) {
    if (this.stripValue_) {
      hit.getParameters().remove(analytics.Parameters.EVENT_VALUE);
    }
  };

  /**
   * @param {!analytics.Tracker.Hit} hit
   * @this {analytics.filters.EventLabelerBuilder}
   */
  var resultFn = function(hit) {
    this.labeler_(hit);
    stripValueFn.call(this, hit);
  };

  if (!goog.isDefAndNotNull(this.labeler_)) {
    throw new Error('LabelerBuilder: a labeling strategy must be specified ' +
        'prior to calling build().');
  }

  return analytics.filters.FilterBuilder.builder().
      whenHitType(analytics.HitTypes.EVENT).
      applyFilter(goog.bind(resultFn, this)).
      build();
};
