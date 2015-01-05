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
 * @fileoverview Support for mapping parameters to values.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */


goog.provide('analytics.ParameterMap');

goog.require('analytics.Parameter');
goog.require('analytics.Value');

goog.require('goog.array.ArrayLike');
goog.require('goog.string.format');
goog.require('goog.structs');
goog.require('goog.structs.Map');



/**
 * A map of {@code analytics.Parameter} to {@code analytics.Value}.
 * Individual parameters are identified by name (the query parameter name).
 * Two different instances of {@code Parameter} with the same {@code .name}
 * are treated as identical independent of all other attributes in the
 * {@code analytics.Parameter} typedef.
 *
 * <p>As of this writing multiple values per parameter are not supported,
 * though this aspect of GA tracking behavior needs to be verified. So this
 * aspect of the API as well as the associated types are subject to change.
 *
 * @constructor
 * @param {...analytics.Parameter|analytics.Value} var_args
 *     An optional list of alternating key, value pairs.
 * @struct
 */
analytics.ParameterMap = function(var_args) {
  /** @private {!goog.structs.Map.<
      string, analytics.ParameterMap.Entry>} */
  this.entries_ = new goog.structs.Map();

  if (arguments.length % 2 > 0) {
    throw new Error('Uneven number of arguments to ParameterMap constructor.');
  }
  this.addPairs_(arguments);
};


/**
 * @typedef {{
 *   key: !analytics.Parameter,
 *   value: !analytics.Value
 * }}
 */
analytics.ParameterMap.Entry;


/**
 * Sets the value associated with the parameter replacing any existing
 * value.
 *
 * @param {!analytics.Parameter} param
 * @param {!analytics.Value} value
 */
analytics.ParameterMap.prototype.set = function(param, value) {
  if (!goog.isDefAndNotNull(value)) {
    throw new Error('undefined-or-null value for key: ' + param.name);
  }

  this.entries_.set(param.name, {'key': param, 'value': value});
};


/**
 * Removes the entry associated w/ key, if any.
 *
 * @param {!analytics.Parameter} param
 */
analytics.ParameterMap.prototype.remove = function(param) {
  this.entries_.remove(param.name);
};


/**
 * Returns the current value associated with the key, or null if it hasn't
 * been set. Does not return the default value if the *same* value has not
 * been previously set, explicitly, by the caller.
 * @param {!analytics.Parameter} param
 * @return {?analytics.Value} The value or null if not previously set.
 */
analytics.ParameterMap.prototype.get = function(param) {
  /** @type {!analytics.ParameterMap.Entry} */
  var entry = /** @type {analytics.ParameterMap.Entry} */ (
      this.entries_.get(param.name, null));
  return goog.isNull(entry) ? null : entry.value;
};


/**
 * Adds all elements from {@code map}.
 *
 * @param {!analytics.ParameterMap} map
 */
analytics.ParameterMap.prototype.addAll = function(map) {
  this.entries_.addAll(map.entries_);
};


/**
 * Adds elements from list of alternating {@code analytics.Parameter}
 * and {@code analytics.Value} values.
 *
 * @param {!goog.array.ArrayLike.<
 *     analytics.Parameter|analytics.Value>} elements
 * @private
 */
analytics.ParameterMap.prototype.addPairs_ = function(elements) {
  for (var i = 0; i < elements.length; i += 2) {
    this.set(
        /** @type {analytics.Parameter} */ (elements[i]),
        /** @type {analytics.Value} */ (elements[i + 1]));
  }
};


/**
 * Apply {@code receiver} to each {@code analytics.ParameterMap.Entry}
 * having been previously set in the map.
 * @param {!function(!analytics.Parameter, !analytics.Value)} receiver
 */
analytics.ParameterMap.prototype.forEachEntry = function(receiver) {
  goog.array.forEach(
      this.entries_.getValues(),
      /** @param {!analytics.ParameterMap.Entry} entry */
      function(entry) {
        receiver(entry.key, entry.value);
      });
};


/**
 * Returns an object representation of the parameter map. Callers are free
 * to manipulate the returned object.
 *
 * @return {!Object.<string, analytics.Value>}
 */
analytics.ParameterMap.prototype.toObject = function() {
  /** @type {!Object.<string, analytics.Value>} */
  var params = {};
  this.forEachEntry(
      /**
       * @param {!analytics.Parameter} key
       * @param {!analytics.Value} value
       */
      function(key, value) {
        // Oddly enough the "id" is the readable name,
        // and the "name" is the short form.
        // e.g. id=description, name=cd.
        params[key.id] = value;
      });
  return params;
};


/**
 * Create a copy of *this*.
 * @return {!analytics.ParameterMap}
 */
analytics.ParameterMap.prototype.clone = function() {
  var copy = new analytics.ParameterMap();
  copy.entries_ = this.entries_.clone();
  return copy;
};


/**
 * Returns true if this instance contains exactly the same entries
 * as {@code that}.
 *
 * @param {!analytics.ParameterMap} that
 * @return {boolean} True if this instance contains exactly the same entries
 * as {@code that}.
 */
analytics.ParameterMap.prototype.equals = function(that) {
  if (this.entries_.length !== that.entries_.length) {
    return false;
  }

  /** @type {boolean} */
  var result = goog.array.every(
      this.entries_.getValues(),
      /**
       * @param {!analytics.ParameterMap.Entry} entry
       * @return {boolean} True if this and that have the same key/value pair.
       */
      function(entry) {
        return entry.value == that.get(entry.key);
      });
  return result;
};


/**
 * Returns true if this instance contains all entries
 * in {@code parameters}.
 *
 * @param {!analytics.ParameterMap} parameters
 * @return {boolean} True if this instance contains all entries
 *     in {@code parameters}.
 */
analytics.ParameterMap.prototype.contains = function(parameters) {
  /** @type {boolean} */
  var result = goog.array.every(
      parameters.entries_.getValues(),
      goog.bind(
          /**
           * @param {!analytics.ParameterMap.Entry} entry
           * @return {boolean}
           *     True if this and parameters have the same key/value pair.
           * @this {analytics.ParameterMap}
           */
          function(entry) {
            return entry.value == this.get(entry.key);
          },
          this));
  return result;
};


/**
 * Returns true if this instance contains {@code key}.
 *
 * @param {!analytics.Parameter} parameter
 * @return {boolean} True if this instance has an entry for
 *     the specified parameter.
 */
analytics.ParameterMap.prototype.hasParameter = function(parameter) {
  return this.entries_.containsKey(parameter.name);
};


/** @override */
analytics.ParameterMap.prototype.toString = function() {
  /** @type {!Object.<string, !analytics.Value>} */
  var fields = new Object();
  this.forEachEntry(
      /**
       * @param {!analytics.Parameter} key
       * @param {!analytics.Value} value
       */
      function(key, value) {
        fields[key.id] = value;
      });
  return JSON.stringify(fields);
};
