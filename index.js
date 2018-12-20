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
        var self = this;
        if (isFunction(onFulfilled)) {
          if (self.state === STATES.PENDING) {
            self.onFulfilledHandlers.push(onFulfilled);
          }
          if (self.state === STATES.FULFILLED) {
            setTimeout(function () {
              onFulfilled(self.value);
            }, 0);
          }
        }
        if (isFunction(onRejected)) {
          if (self.state === STATES.PENDING) {
            self.onRejectedHandlers.push(onRejected);
          }
          if (self.state === STATES.REJECTED) {
            setTimeout(function () {
              onRejected(self.reason);
            }, 0);
          }
        }
        return self;
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
