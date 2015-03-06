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
 * @fileoverview The "official" GA instance of service settings. This class
 * is responsible for service state. This includes generating/persisting user
 * ids, finding ALL sources of "opt-out", allowing a user to opt-out of tracking
 * and persisting this information.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.ServiceSettings');

goog.require('analytics.internal.Identifier');
goog.require('analytics.internal.Settings');
goog.require('analytics.internal.Settings.Properties');

goog.require('goog.async.Deferred');
goog.require('goog.async.DeferredList');
goog.require('goog.events');



/**
 * @constructor
 * @param {!analytics.internal.AsyncStorage} storage
 * @implements {analytics.internal.Settings}
 * @struct
 */
analytics.internal.ServiceSettings = function(storage) {
  /** @private {!analytics.internal.AsyncStorage} */
  this.storage_ = storage;

  /** @private {number} */
  this.sampleRate_ = 100;

  /**
   * Callbacks to trigger when settings change.
   * @private {!Array.<!function(!analytics.internal.Settings.Property)>}
   */
  this.changeListeners_ = [];

  /** @private {?string} */
  this.userId_ = null;

  /** @private {?boolean} */
  this.permitted_ = null;

  /** @private {!goog.async.Deferred} */
  this.ready_ = this.init_();


  /**
   * In certain testing circumstances we want to tightly control
   * the lifecycle of this object (well its listeners).
   * @private {goog.events.Key}
   */
  this.storageListenerKey_;

  // Finally, once we're initialized, add a change listener
  // on the underlying storage in case a settings instance
  // in another script context changes the settings.
  this.ready_.addCallback(
      function() {
        this.storageListenerKey_ = goog.events.listen(
            this.storage_,
            analytics.internal.AsyncStorage.Event.STORAGE_CHANGED,
            goog.bind(this.handleStorageChanged_, this));
      },
      this);
};


/**
 * User prefs added by the Google Analytics opt-out plugin.
 * @private {string}
 */
analytics.internal.ServiceSettings.USER_PREFS_ = '_gaUserPrefs';


/**
 * Name of the opt-out function added by the Google Analytics opt-out plugin.
 * @private {string}
 */
analytics.internal.ServiceSettings.OPTOUT_FUNCTION_ = 'ioo';


/**
 * Initializes this.userId_ and this.permitted_ from storage, firing the
 * this.ready_ deferred when both are done loading.
 *
 * @return {!goog.async.Deferred.<!analytics.Config>}
 *     Fires when settings is fully initialized.
 * @private
 */
analytics.internal.ServiceSettings.prototype.init_ = function() {
  return this.loadSettings_().addCallback(
      /**
       * @return {!analytics.Config}
       * @this {analytics.internal.ServiceSettings}
       */
      function() {
        return this;
      },
      this);
};


/**
 * Initializes this.userId_ and this.permitted_ from storage, then
 * fires a deferred.
 *
 * @return {!goog.async.Deferred} Fires when settings is fully initialized.
 * @private
 */
analytics.internal.ServiceSettings.prototype.loadSettings_ = function() {
  return goog.async.DeferredList.gatherResults([
    this.loadTrackingPermitted_(),
    this.loadUserId_()
  ]);
};


/** @override */
analytics.internal.ServiceSettings.prototype.whenReady = function() {
  return this.ready_.branch();
};


/**
 * Called when the chrome.storage area changes underneath us. This
 * could happen if there are multiple script contexts (multiple
 * pages) with separate settings instances. We want to honor
 * changes in settings from other scripts that are part of the
 * same app.
 *
 * @private
 */
analytics.internal.ServiceSettings.prototype.handleStorageChanged_ =
    function() {
  this.assertReady_();
  var userId = this.getUserId();
  var trackingPermitted = this.isTrackingPermitted();
  this.loadSettings_().addCallback(
      function() {
        if (userId != this.getUserId()) {
          this.firePropertyChangedEvent_(
              analytics.internal.Settings.Properties.USER_ID);
        }
        if (trackingPermitted != this.isTrackingPermitted()) {
          this.firePropertyChangedEvent_(
              analytics.internal.Settings.Properties.TRACKING_PERMITTED);
        }
      },
      this);
};


/** @override */
analytics.internal.ServiceSettings.prototype.addChangeListener =
    function(listener) {
  this.assertReady_();
  this.changeListeners_.push(listener);
};


/** @override */
analytics.internal.ServiceSettings.prototype.setTrackingPermitted =
    function(permitted) {
  this.assertReady_();

  var changed = this.permitted_ != permitted;

  this.permitted_ = permitted;
  this.storage_.set(
      analytics.internal.Settings.Properties.TRACKING_PERMITTED,
      permitted.toString());

  if (changed) {
    this.firePropertyChangedEvent_(
        analytics.internal.Settings.Properties.TRACKING_PERMITTED);
  }
};


/** @override */
analytics.internal.ServiceSettings.prototype.isTrackingPermitted =
    function() {
  this.assertReady_();

  return /** @type {boolean} */ (this.permitted_) && !this.isOptOutViaPlugin_();
};


/**
 * Loads the tracking permitted setting.
 * @return {!goog.async.Deferred} A deferred firing when the setting is loaded.
 * @private
 */
analytics.internal.ServiceSettings.prototype.loadTrackingPermitted_ =
    function() {
  return this.storage_.get(
      analytics.internal.Settings.Properties.TRACKING_PERMITTED).addCallback(
      function(value) {
        // Tracking is permitted by default.
        this.permitted_ = true;
        if (goog.isDef(value)) {
          switch (value) {
            case 'true':
              this.permitted_ = true;
              break;
            case 'false':
              this.permitted_ = false;
              break;
          }
        }
      },
      this);
};


/**
 * Check whether the user is opted out via the plugin which adds a function to
 * the global scope. This only works on web pages (i.e. not in a Chrome app).
 *
 * @return {boolean} True if the user should be considered to have opted out
 *     because they installed the GA opt-out plugin.
 * @private
 */
analytics.internal.ServiceSettings.prototype.isOptOutViaPlugin_ = function() {
  var optoutFunction = analytics.internal.ServiceSettings.OPTOUT_FUNCTION_;
  var prefs = goog.global[analytics.internal.ServiceSettings.USER_PREFS_];
  return prefs && prefs[optoutFunction] && prefs[optoutFunction]();
};


/** @override */
analytics.internal.ServiceSettings.prototype.getUserId = function() {
  this.assertReady_();
  if (!goog.isString(this.userId_)) {
    throw new Error('Invalid state. UserID is not a string.');
  }
  return this.userId_;
};


/**
 * Loads the user id from local storage. If it isn't present, creates it and
 * writes it to local storage.
 * @return {!goog.async.Deferred} A deferred firing when the user id is loaded.
 * @private
 */
analytics.internal.ServiceSettings.prototype.loadUserId_ = function() {
  return this.storage_.get(analytics.internal.Settings.Properties.USER_ID).
      addCallback(
          function(id) {
            if (goog.isDef(id)) {
              this.userId_ = id;
            } else {
              this.initializeUserId_();
            }
          },
          this);
};


/**
 * Loads the user id from local storage. If it isn't present, creates it and
 * writes it to local storage.
 * @return {!goog.async.Deferred} A deferred firing when the user id is loaded.
 * @private
 */
analytics.internal.ServiceSettings.prototype.initializeUserId_ = function() {
  this.userId_ = analytics.internal.Identifier.generateUuid();
  return this.storage_.set(
      analytics.internal.Settings.Properties.USER_ID,
      this.userId_)
      .addCallback(
          function() {
            this.firePropertyChangedEvent_(
                analytics.internal.Settings.Properties.USER_ID);
          }, this);
};


/** @override */
analytics.internal.ServiceSettings.prototype.setSampleRate =
    function(sampleRate) {
  this.assertReady_();
  this.sampleRate_ = sampleRate;
};


/** @override */
analytics.internal.ServiceSettings.prototype.getSampleRate = function() {
  this.assertReady_();
  return this.sampleRate_;
};


/** @override */
analytics.internal.ServiceSettings.prototype.resetUserId = function() {
  return this.initializeUserId_();
};


/**
 * Fires the property changed event for the supplied property.
 *
 * @param {!analytics.internal.Settings.Property} property
 * @private
 */
analytics.internal.ServiceSettings.prototype.firePropertyChangedEvent_ =
    function(property) {
  goog.array.forEach(
      this.changeListeners_,
      /** @param {function(!analytics.internal.Settings.Property)} listener */
      function(listener) {
        listener(property);
      });
};


/** @override */
analytics.internal.ServiceSettings.prototype.dispose = function() {
  if (goog.isDefAndNotNull(this.storageListenerKey_)) {
    goog.events.unlistenByKey(this.storageListenerKey_);
  }
};


/** @private */
analytics.internal.ServiceSettings.prototype.assertReady_ = function() {
  if (!this.whenReady().hasFired()) {
    throw new Error('Settings object accessed prior to entering ready state.');
  }
};
