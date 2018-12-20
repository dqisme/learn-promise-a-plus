var STATES = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
};

module.exports = {
  deferred: function () {
    var promise = {
      state: STATES.PENDING,
      value: null,
      reason: null
    };
    var resolve = function (value) {
      if (promise.state === STATES.PENDING) {
        promise.state = STATES.FULFILLED;
        promise.value = value;
      }
    };
    var reject = function (reason) {
      if (promise.state === STATES.PENDING) {
        promise.state = STATES.REJECTED;
        promise.reason = reason;
      }
    };
    return { promise: promise, reject: reject, resolve: resolve };
  }
};
