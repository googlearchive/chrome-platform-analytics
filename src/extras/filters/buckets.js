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
 * Event hits.
 * @author orenb@google.com (Oren Blasberg)
 */
goog.provide('analytics.filters.Buckets');


/**
 * <p>E.g.,
 * <pre>
 *    15 -> "9-16"
 *    31 -> "17-32"
 *    32 -> "33-64"
 *    50 -> "33-64"
 *    51 -> "33-64"
 *    120 -> "65-128"
 *    ...
 * </pre>
 *
 * @param {number} val The number value to bucket.
 *     Should be whole and non-negative, but we'll do our best.
 * @return {string} The generated label.
 */
analytics.filters.Buckets.powersOfTwo = function(val) {
  if (val < 1) {
    return '0';
  }
  if (val < 3) {
    return '1-2';
  }

  var exp = Math.floor(Math.log(val - 1) / Math.log(2));
  var labelBottom = Math.pow(2, exp) + 1;
  var labelTop = Math.pow(2, exp + 1);

  return labelBottom + '-' + labelTop;
};


/**
 * <p>E.g., if {@code rightBounds} were [10, 20, 30], then a val of 17 would
 * result in a label of '11-20'.
 *
 * @param {!Array.<number>} rightBounds The right bounds of each range.
 * @param {number} val The value to bucket.
 * @return {string} The generated label.
 */
analytics.filters.Buckets.rangeBounds = function(rightBounds, val) {
  var low = 0;
  var high = rightBounds.length - 1;
  var current = 0;

  while (low <= high) {
    var index = Math.floor((low + high) / 2);
    current = rightBounds[index];

    if (val <= current) {
      var previous = index == 0 ? 0 : rightBounds[index - 1];
      if (val > previous) {
        return (previous + 1).toString() + '-' + current.toString();
      }
      high = index - 1;
    } else if (val > current) {
      if (index >= (rightBounds.length - 1)) {
        return (goog.array.peek(rightBounds) + 1).toString() + '+';
      }
      low = index + 1;
    }
  }
  return '<= 0';
};
