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
          if (this.state === STATES.PENDING) {
            this.onFulfilled = onFulfilled;
          }
          if (this.state === STATES.FULFILLED) {
            setTimeout(function () {
              onFulfilled(this.value);
            }, 0);
          }
        }
        if (isFunction(onRejected)) {
          if (this.state === STATES.PENDING) {
            this.onRejected = onRejected;
          }
          if (this.state === STATES.REJECTED) {
            setTimeout(function () {
              onRejected(this.reason);
            }, 0);
          }
        }
      }
    };
    var resolve = function (value) {
      if (promise.state === STATES.PENDING) {
        promise.state = STATES.FULFILLED;
        promise.value = value;
        if (promise.onFulfilled) {
          setTimeout(function () {
            promise.onFulfilled(promise.value);
          }, 0);
        }
      }
    };
    var reject = function (reason) {
      if (promise.state === STATES.PENDING) {
        promise.state = STATES.REJECTED;
        promise.reason = reason;
        if (promise.onRejected) {
          setTimeout(function () {
            promise.onRejected(promise.reason);
          })
        }
      }
    };
    return { promise: promise, reject: reject, resolve: resolve };
  }
};
