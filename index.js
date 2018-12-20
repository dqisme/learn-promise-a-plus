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
      onFulfilledHandlers: [],
      onRejectedHandlers: [],
      then: function (onFulfilled, onRejected) {
        if (isFunction(onFulfilled)) {
          if (this.state === STATES.PENDING) {
            this.onFulfilledHandlers.push(onFulfilled);
          }
          if (this.state === STATES.FULFILLED) {
            var value = this.value;
            setTimeout(function () {
              onFulfilled(value);
            }, 0);
          }
        }
        if (isFunction(onRejected)) {
          if (this.state === STATES.PENDING) {
            this.onRejectedHandlers.push(onRejected);
          }
          if (this.state === STATES.REJECTED) {
            var reason = this.reason;
            setTimeout(function () {
              onRejected(reason);
            }, 0);
          }
        }
        return this;
      }
    };
    var resolve = function (value) {
      if (promise.state === STATES.PENDING) {
        promise.state = STATES.FULFILLED;
        promise.value = value;
        promise.onFulfilledHandlers.forEach(function (onFulfilled) {
          setTimeout(function () {
            onFulfilled(promise.value);
          }, 0);
        });
      }
    };
    var reject = function (reason) {
      if (promise.state === STATES.PENDING) {
        promise.state = STATES.REJECTED;
        promise.reason = reason;
        promise.onRejectedHandlers.forEach(function (onRejected) {
          setTimeout(function () {
            onRejected(promise.reason);
          })
        });
      }
    };
    return { promise: promise, reject: reject, resolve: resolve };
  }
};
