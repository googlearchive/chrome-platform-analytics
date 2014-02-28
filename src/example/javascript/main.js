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

var service, tracker, previous, currentChoice, previousChoice;

function initAnalyticsConfig(config) {
  document.getElementById('settings-loading').hidden = true;
  document.getElementById('settings-loaded').hidden = false;

  var checkbox = document.getElementById('analytics');
  checkbox.checked = config.isTrackingPermitted();
  checkbox.onchange = function() {
    config.setTrackingPermitted(checkbox.checked);
  };
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

  var button1 = document.getElementById('chocolate');
  var button2 = document.getElementById('vanilla');
  currentChoice = document.getElementById('currentChoice');
  previousChoice = document.getElementById('previousChoice');
  [button1, button2].forEach(addButtonListener);

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

function addButtonListener(button) {
  button.addEventListener('click', function() {
    tracker.sendEvent('Flavor', 'Choose', button.id);
    currentChoice.textContent = 'You chose: ' + button.textContent;
    previousChoice.textContent = 'Your previous choices were: ' + previous;
  });
}

window.onload = startApp;
