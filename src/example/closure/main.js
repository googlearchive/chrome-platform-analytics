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

goog.require('analytics.getService');

goog.require('goog.dom');
goog.require('goog.events');


/**
 * The element used to display information to the user.
 * @type {Element}
 */
var out;


/** @type {analytics.GoogleAnalytics} */
var service;


/** @type {analytics.Tracker} */
var tracker;


/**
 * @param {analytics.Config} config
 */
function initAnalyticsConfig(config) {
  document.getElementById('settings-loading').hidden = true;
  document.getElementById('settings-loaded').hidden = false;

  var checkbox = document.getElementById('analytics');
  checkbox.checked = config.isTrackingPermitted();
  goog.events.listen(checkbox, goog.events.EventType.CHANGE, function() {
    config.setTrackingPermitted(checkbox.checked);
  });
}

function startApp() {
  // Initialize the Analytics service object with the name of your app.
  service = analytics.getService('ice_cream_app');
  service.getConfig().addCallback(initAnalyticsConfig);

  // Get a Tracker using your Google Analytics app Tracking ID.
  tracker = service.getTracker('UA-XXXXX-X');

  // Record an "appView" each time the user launches your app or goes to a new
  // screen within the app.
  tracker.sendAppView('MainView');

  var timing = tracker.startTiming('Analytics Performance', 'Send Event');

  // Record an "event".
  tracker.sendEvent('Browsing', 'Browsed the app');

  // Send the timing information.
  timing.send();

  var button1 = goog.dom.getElement('chocolate');
  var button2 = goog.dom.getElement('vanilla');
  out = goog.dom.getElement('out');
  goog.array.forEach([button1, button2], addButtonListener);
}


/**
 * @param {!Element} button
 */
function addButtonListener(button) {
  goog.events.listen(button, goog.events.EventType.CLICK, function() {
    // Record user actions with sendEvent.
    tracker.sendEvent('Flavor', 'Choose', button.id);
    out.textContent = 'You chose: ' + button.textContent;
  });
}

window.onload = startApp;
