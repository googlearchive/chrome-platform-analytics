goog.provide('analytics.testing.TestHit');

goog.require('analytics.Tracker.Hit');



/**
 * Test implementation of {@code analytics.Tracker.Hit}.
 *
 * @constructor
 * @implements {analytics.Tracker.Hit}
 * @struct
 *
 * @param {!analytics.HitType} type
 * @param {!analytics.ParameterMap} parameters
 */
analytics.testing.TestHit = function(type, parameters) {
  /** @private {!analytics.HitType} */
  this.type_ = type;

  /** @private {!analytics.ParameterMap} */
  this.parameters_ = parameters;

  /** @private {boolean} */
  this.canceled_ = false;
};


/** @override */
analytics.testing.TestHit.prototype.getHitType = function() {
  return this.type_;
};


/** @override */
analytics.testing.TestHit.prototype.getParameters = function() {
  return this.parameters_;
};


/** @override */
analytics.testing.TestHit.prototype.cancel = function() {
  return this.canceled_;
};

/**
 * @return {boolean} true if the hit was canceled.
 */
analytics.testing.TestHit.prototype.canceled = function() {
  return this.canceled_;
};
