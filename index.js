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
    var onFulfilledHandlers = [];
    var onRejectedHandlers = [];
    var promise = {
      state: STATES.PENDING,
      value: undefined,
      then: function (onFulfilled, onRejected) {
        if (isFunction(onFulfilled)) {
          if (promise.state === STATES.PENDING) {
            onFulfilledHandlers.push(onFulfilled);
          }
          if (promise.state === STATES.FULFILLED) {
            setTimeout(function () {
              promise.value = onFulfilled(promise.value);
            }, 0);
          }
        }
        if (isFunction(onRejected)) {
          if (promise.state === STATES.PENDING) {
            onRejectedHandlers.push(onRejected);
          }
          if (promise.state === STATES.REJECTED) {
            setTimeout(function () {
              promise.value = onRejected(promise.value);
            }, 0);
          }
        }
        return promise;
      }
    };
    var resolve = function (value) {
      if (promise.state === STATES.PENDING) {
        promise.state = STATES.FULFILLED;
        promise.value = value;
        onFulfilledHandlers.forEach(function (onFulfilled) {
          setTimeout(function () {
            onFulfilled(promise.value);
          }, 0);
        });
      }
    };
    var reject = function (reason) {
      if (promise.state === STATES.PENDING) {
        promise.state = STATES.REJECTED;
        promise.value = reason;
        onRejectedHandlers.forEach(function (onRejected) {
          setTimeout(function () {
            onRejected(promise.value);
          })
        });
      }
    };
    return { promise, reject, resolve };
  }
};
