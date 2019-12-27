function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

function isThenable(object) {
  return object && isFunction(object.then);
}

function callAsync(functionToCall) {
  setTimeout(functionToCall, 0);
}

var STATES = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
};

function deferred() {
  var _state = STATES.PENDING;
  var _value = undefined;
  var _reason = undefined;
  var _queue = [];
  var promise = {
    then: function (onFulfilled, onRejected) {
      var _deferred = deferred();
      if (_state === STATES.PENDING) {
        _queue.push({ onFulfilled: onFulfilled, onRejected: onRejected });
      }
      if (_state === STATES.FULFILLED) {
        callAsync(function() {
          if (isFunction(onFulfilled)) {
            try {
              onFulfilled(_value);
            } catch (error) {
            }
          } else {
            _deferred.resolve();
          }
        });
      }
      if (_state === STATES.REJECTED) {
        callAsync(function() {
          if (isFunction(onRejected)) {
            try {
              onRejected(_reason);
            } catch (error) {
            }
          } else {
            _deferred.reject(_reason);
          }
        });
      }
      return _deferred.promise;
    }
  };
  var resolve = function (value) {
    if (_state === STATES.PENDING) {
      _state = STATES.FULFILLED;
      _value = value;
      callAsync(function() {
        while(_queue.length > 0) {
          var onFulfilled = _queue.shift().onFulfilled;
          if (isFunction(onFulfilled)) {
            try {
              onFulfilled(_value);
            } catch (error) {
            }
          }
        }
      });
    }
  };
  var reject = function (reason) {
    if (_state === STATES.PENDING) {
      _state = STATES.REJECTED;
      _reason = reason;
      callAsync(function() {
        while(_queue.length > 0) {
          var onRejected = _queue.shift().onRejected;
          if (isFunction(onRejected)) {
            try {
              onRejected(_reason);
            } catch (error) {
            }
          }
        }
      });
    }
  };
  return { promise: promise, reject: reject, resolve: resolve };
}


module.exports = {
  deferred: deferred
};
