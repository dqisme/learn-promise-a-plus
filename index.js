function PromiseObject(props, queue) {
  this.then = function (onFulfilled, onRejected) {
    var _deferred = deferred();
    if (props.state === STATES.PENDING) {
      queue.push({
        deferred: _deferred,
        onFulfilled: onFulfilled,
        onRejected: onRejected,
      });
    }
    if (props.state === STATES.FULFILLED) {
      callAsync(function () {
        if (isFunction(onFulfilled)) {
          try {
            var result = onFulfilled(props.value);
            resolutionProcedure(result, _deferred);
          } catch (error) {
            _deferred.reject(error);
          }
        } else if (props.state === STATES.FULFILLED) {
          _deferred.resolve(props.value);
        }
      });
    }
    if (props.state === STATES.REJECTED) {
      callAsync(function () {
        if (isFunction(onRejected)) {
          try {
            var result = onRejected(props.reason);
            resolutionProcedure(result, _deferred);
          } catch (error) {
            _deferred.reject(error);
          }
        } else if (props.state === STATES.REJECTED) {
          _deferred.reject(props.reason);
        }
      });
    }
    return _deferred.promise;
  }
}

function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

function isPromise(promiseLike) {
  return promiseLike instanceof PromiseObject;
}

function getThen(thenableLike) {
  return thenableLike ? thenableLike.then : null;
}

function callAsync(functionToCall) {
  setTimeout(functionToCall, 0);
}

function resolutionProcedure(result, deferredObject) {
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
            resolutionProcedure(value, deferredObject);
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
  var promise = new PromiseObject(props, queue);
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
            try {
              var result = onFulfilled(props.value);
              resolutionProcedure(result, _deferred);
            } catch (error) {
              _deferred.reject(error);
            }
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
            try {
              var result = onRejected(props.reason);
              resolutionProcedure(result, _deferred);
            } catch (error) {
              _deferred.reject(error);
            }
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
