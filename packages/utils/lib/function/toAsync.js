"use strict";

exports.__esModule = true;
exports.toAsync = toAsync;

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.array.concat.js");

var _toPromiseCallback = require("./toPromiseCallback");

function toAsync(callbackFunction) {
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new Promise(function (resolve, reject) {
      callbackFunction.apply(void 0, args.concat([(0, _toPromiseCallback.toPromiseCallback)(resolve, reject)]));
    });
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mdW5jdGlvbi90b0FzeW5jLmpzIl0sIm5hbWVzIjpbInRvQXN5bmMiLCJjYWxsYmFja0Z1bmN0aW9uIiwiYXJncyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBOztBQUVPLFNBQVNBLE9BQVQsQ0FBaUJDLGdCQUFqQixFQUFtQztBQUN4QyxTQUFPLFlBQWE7QUFBQSxzQ0FBVEMsSUFBUztBQUFUQSxNQUFBQSxJQUFTO0FBQUE7O0FBQ2xCLFdBQU8sSUFBSUMsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUN0Q0osTUFBQUEsZ0JBQWdCLE1BQWhCLFNBQW9CQyxJQUFwQixTQUEwQiwwQ0FBa0JFLE9BQWxCLEVBQTJCQyxNQUEzQixDQUExQjtBQUNELEtBRk0sQ0FBUDtBQUdELEdBSkQ7QUFLRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHRvUHJvbWlzZUNhbGxiYWNrIH0gZnJvbSAnLi90b1Byb21pc2VDYWxsYmFjaydcblxuZXhwb3J0IGZ1bmN0aW9uIHRvQXN5bmMoY2FsbGJhY2tGdW5jdGlvbikge1xuICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2FsbGJhY2tGdW5jdGlvbiguLi5hcmdzLCB0b1Byb21pc2VDYWxsYmFjayhyZXNvbHZlLCByZWplY3QpKVxuICAgIH0pXG4gIH1cbn1cbiJdfQ==