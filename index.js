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
    var _state = STATES.PENDING;
    var _value = undefined;
    var _reason = undefined;
    var _onFulfilledHandlers = [];
    var _onRejectedHandlers = [];
    var promise = {
      then: function (onFulfilled, onRejected) {
        if (isFunction(onFulfilled)) {
          if (_state === STATES.PENDING) {
            _onFulfilledHandlers.push(onFulfilled);
          }
          if (_state === STATES.FULFILLED) {
            setTimeout(function () {
              onFulfilled(_value);
            }, 0);
          }
        }
        if (isFunction(onRejected)) {
          if (_state === STATES.PENDING) {
            _onRejectedHandlers.push(onRejected);
          }
          if (_state === STATES.REJECTED) {
            setTimeout(function () {
              onRejected(_reason);
            }, 0);
          }
        }
        return promise;
      }
    };
    var resolve = function (value) {
      if (_state === STATES.PENDING) {
        _state = STATES.FULFILLED;
        _value = value;
        _onFulfilledHandlers.forEach(function (onFulfilled) {
          setTimeout(function () {
            onFulfilled(_value);
          }, 0);
        });
      }
    };
    var reject = function (reason) {
      if (_state === STATES.PENDING) {
        _state = STATES.REJECTED;
        _reason = reason;
        _onRejectedHandlers.forEach(function (onRejected) {
          setTimeout(function () {
            onRejected(_reason);
          }, 0)
        });
      }
    };
    return { promise: promise, reject: reject, resolve: resolve };
  }
};
