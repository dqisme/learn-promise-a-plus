function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

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
      reason: null,
      then: function (onFulfilled, onRejected) {
        if (isFunction(onFulfilled)) {
          if (this.state === STATES.FULFILLED) {
            setTimeout(function () { onFulfilled(this.value); }, 0);
          }
        }
        if (isFunction(onRejected)) {
          if (this.state === STATES.REJECTED) {
            setTimeout(function () { onRejected(this.reason); }, 0);
          }
        }
      }
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
