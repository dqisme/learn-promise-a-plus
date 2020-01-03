function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

function getThen(thenableLike) {
  return thenableLike ? thenableLike.then : null;
}

function callAsync(functionToCall) {
  setTimeout(functionToCall, 0);
}

function resolutionProcedure(fulfillOrReject, valueOrReason, deferredObject) {
    try {
        var result = fulfillOrReject(valueOrReason);
        if (result === deferredObject.promise) {
            throw new TypeError();
        }
        var resultThen = getThen(result);
        if (isFunction(resultThen)) {
            resultThen.call(result, deferredObject.resolve, deferredObject.reject);
        }
        else {
            deferredObject.resolve(result);
        }
    }
    catch (error) {
        deferredObject.reject(error);
    }
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
        _queue.push({
          deferred: _deferred,
          onFulfilled: onFulfilled,
          onRejected: onRejected,
        });
      }
      if (_state === STATES.FULFILLED) {
        callAsync(function() {
          if (isFunction(onFulfilled)) {
            resolutionProcedure(onFulfilled, _value, _deferred);
          } else if (_state === STATES.FULFILLED) {
            _deferred.resolve(_value);
          }
        });
      }
      if (_state === STATES.REJECTED) {
        callAsync(function() {
          if (isFunction(onRejected)) {
            resolutionProcedure(onRejected, _reason, _deferred);
          } else if (_state === STATES.REJECTED) {
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
          var current = _queue.shift();
          var onFulfilled = current.onFulfilled;
          var _deferred = current.deferred;
          if (isFunction(onFulfilled)) {
            resolutionProcedure(onFulfilled, _value, _deferred);
          } else if (_state === STATES.FULFILLED) {
            _deferred.resolve(_value);
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
          var current = _queue.shift();
          var onRejected = current.onRejected;
          var _deferred = current.deferred;
          if (isFunction(onRejected)) {
            resolutionProcedure(onRejected, _reason, _deferred);
          } else if (_state === STATES.REJECTED) {
            _deferred.reject(_reason);
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
