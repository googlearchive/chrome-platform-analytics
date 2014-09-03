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
 * @fileoverview Main script for demo app.
 *
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.require('analytics');
goog.require('analytics.EventBuilder');
goog.require('analytics.filters.FilterBuilder');

goog.require('goog.dom');
goog.require('goog.events');


/**
 * Use an EventBuilder to share event payloads. EventBuilders are both
 * extensible AND immutable, so they're easy to tweak and safe to reuse.
 * They can be especially useful in larger code bases where centralized
 * control over events is desired.
 *
 * @const {!analytics.EventBuilder}
 */
var FLAVOR_EVENT = analytics.EventBuilder.builder().
    category('Flavor').
    action('Choose');


/**
 * The element used to display the user's current choice.
 * @type {Element}
 */
var currentChoice;


/**
 * The element used to display the user's previous choices.
 * @type {Element}
 */
var previousChoice;


/**
 * The user's previous choices.
 * @type {!Array.<string>}
 */
var previous;


/** @type {analytics.GoogleAnalytics} */
var service;


/** @type {analytics.Tracker} */
var tracker;


function startApp() {
  // Initialize the Analytics service object with the name of your app.
  service = analytics.getService('ice_cream_app');
  service.getConfig().addCallback(initAnalyticsConfig);

  // Get a Tracker using your Google Analytics app Tracking ID.
  tracker = service.getTracker('UA-XXXXX-X');

  // Start timing...
  var timing = tracker.startTiming('Analytics Performance', 'Send Event');

  // Record an "appView" each time the user launches your app or goes to a new
  // screen within the app.
  tracker.sendAppView('TastyView');


  // Record user actions with "sendEvent".
  tracker.sendEvent('Interesting Stuff', 'User Did Something');

  // ...send elapsed time since we started timing.
  timing.send();

  var button1 = goog.dom.getElement('chocolate');
  var button2 = goog.dom.getElement('vanilla');
  currentChoice = goog.dom.getElement('currentChoice');
  previousChoice = goog.dom.getElement('previousChoice');
  goog.array.forEach([button1, button2], addButtonListener);

  setupAnalyticsListener();
}


/**
 * @param {analytics.Config} config
 */
function initAnalyticsConfig(config) {
  document.getElementById('settings-loading').hidden = true;
  document.getElementById('settings-loaded').hidden = false;

  var checkbox = document.getElementById('tracking-permitted');
  checkbox.checked = config.isTrackingPermitted();
  goog.events.listen(checkbox, goog.events.EventType.CHANGE, function() {
    config.setTrackingPermitted(checkbox.checked);
  });
}


/**
 * Adds a filter that captures hits being sent to Google Analytics.
 * Filters are useful for keeping track of what's happening in your app...
 * you can show this info in a debug panel, or log them to the console.
 */
function setupAnalyticsListener() {
  // Listen for event hits of the 'Flavor' category, and record them.
  previous = [];
  tracker.addFilter(
      analytics.filters.FilterBuilder.builder().
          whenHitType(analytics.HitTypes.EVENT).
          whenValue(analytics.Parameters.EVENT_CATEGORY, 'Flavor').
          whenValue(analytics.Parameters.EVENT_ACTION, 'Choose').
          applyFilter(
              /** @param {!analytics.Tracker.Hit} hit */
              function(hit) {
                previous.push(
                    hit.getParameters().get(analytics.Parameters.EVENT_LABEL));
              }).
          build());
}


/**
 * @param {!Element} button
 */
function addButtonListener(button) {
  goog.events.listen(button, goog.events.EventType.CLICK, function() {
    // Record user actions with sendEvent.
    tracker.send(
        FLAVOR_EVENT.label(button.id));
    currentChoice.textContent = button.textContent;
    previousChoice.textContent = previous.join(', ');
  });
}

window.onload = startApp;
