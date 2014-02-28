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
  currentChoice = goog.dom.getElement('currentChoice');
  previousChoice = goog.dom.getElement('previousChoice');
  goog.array.forEach([button1, button2], addButtonListener);

  setupAnalyticsListener();
}


// Set up an event listener to capture events that are generated when analytics
// receives a hit.  Useful for keeping track of what's happening in your app.
function setupAnalyticsListener() {
  // Listen for event hits of the 'Flavor' category, and record them.
  previous = [];
  var onTrackerEvent = function(event) {
    if (event.getHitType() == analytics.HitTypes.EVENT) {
      var hit = JSON.parse(event.getHit());
      if (hit[analytics.Parameters.EVENT_CATEGORY.id] == 'Flavor') {
        previous.push(hit[analytics.Parameters.EVENT_LABEL.id]);
      }
    }
  };

  // Install the event listener.
  var eventTarget = tracker.getEventTarget();
  eventTarget.listen(analytics.Tracker.HitEvent.EVENT_TYPE, onTrackerEvent);
}


/**
 * @param {!Element} button
 */
function addButtonListener(button) {
  goog.events.listen(button, goog.events.EventType.CLICK, function() {
    // Record user actions with sendEvent.
    tracker.sendEvent('Flavor', 'Choose', button.id);
    currentChoice.textContent = 'You chose: ' + button.textContent;
    previousChoice.textContent = 'Your previous choices were: ' + previous;
  });
}

window.onload = startApp;
