function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

function isPromise(promiseLike) {
  return false;
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
    if (isPromise(result)) {
      result.then(deferredObject.resolve, deferredObject.reject);
    } else {
      var resultThen = getThen(result);
      if (isFunction(resultThen)) {
        resultThen.call(result,
          function (value) {
            resolutionProcedure(fulfillOrReject, value, deferredObject);
          },
          function (reason) {
            deferredObject.reject(reason);
          });
      }
      else {
        deferredObject.resolve(result);
      }
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
  var props = {
      state: STATES.PENDING,
      value: undefined,
      reason: undefined,
  };
  var queue = [];
  var promise = {
    then: function (onFulfilled, onRejected) {
      var _deferred = deferred();
      if (props.state === STATES.PENDING) {
        queue.push({
          deferred: _deferred,
          onFulfilled: onFulfilled,
          onRejected: onRejected,
        });
      }
      if (props.state === STATES.FULFILLED) {
        callAsync(function() {
          if (isFunction(onFulfilled)) {
            resolutionProcedure(onFulfilled, props.value, _deferred);
          } else if (props.state === STATES.FULFILLED) {
            _deferred.resolve(props.value);
          }
        });
      }
      if (props.state === STATES.REJECTED) {
        callAsync(function() {
          if (isFunction(onRejected)) {
            resolutionProcedure(onRejected, props.reason, _deferred);
          } else if (props.state === STATES.REJECTED) {
            _deferred.reject(props.reason);
          }
        });
      }
      return _deferred.promise;
    }
  };
  var resolve = function (value) {
    if (props.state === STATES.PENDING) {
      props.state = STATES.FULFILLED;
      props.value = value;
      callAsync(function() {
        while(queue.length > 0) {
          var current = queue.shift();
          var onFulfilled = current.onFulfilled;
          var _deferred = current.deferred;
          if (isFunction(onFulfilled)) {
            resolutionProcedure(onFulfilled, props.value, _deferred);
          } else if (props.state === STATES.FULFILLED) {
            _deferred.resolve(props.value);
          }
        }
      });
    }
  };
  var reject = function (reason) {
    if (props.state === STATES.PENDING) {
      props.state = STATES.REJECTED;
      props.reason = reason;
      callAsync(function() {
        while(queue.length > 0) {
          var current = queue.shift();
          var onRejected = current.onRejected;
          var _deferred = current.deferred;
          if (isFunction(onRejected)) {
            resolutionProcedure(onRejected, props.reason, _deferred);
          } else if (props.state === STATES.REJECTED) {
            _deferred.reject(props.reason);
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
