"use strict";

exports.__esModule = true;
exports.isPlainObject = isPlainObject;
exports.isObject = isObject;
exports.isFunction = isFunction;
exports.isDate = isDate;
exports.isRegExp = isRegExp;
exports.isPromise = isPromise;
exports.isAsync = isAsync;
exports.isArrayLike = isArrayLike;
exports.isEmpty = isEmpty;
exports.asObject = asObject;
exports.asArray = asArray;
exports.asFunction = asFunction;
exports.isInteger = exports.isBoolean = exports.isString = exports.isNumber = exports.is = exports.isArray = void 0;

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.object.is.js");

require("core-js/modules/es.function.name.js");

require("core-js/modules/es.number.is-integer.js");

require("core-js/modules/es.number.constructor.js");

require("core-js/modules/es.symbol.to-string-tag.js");

require("core-js/modules/es.json.to-string-tag.js");

require("core-js/modules/es.math.to-string-tag.js");

require("core-js/modules/es.symbol.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.number.max-safe-integer.js");

require("core-js/modules/es.object.keys.js");

var isArray = Array.isArray;
exports.isArray = isArray;
var toString = Object.prototype.toString;

var is = Object.is || function (x, y) {
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
};

exports.is = is;

function isPlainObject(arg) {
  var ctor = arg == null ? void 0 : arg.constructor;
  return !!arg && (!ctor || ctor === Object || ctor.name === 'Object');
}

function isObject(arg) {
  return !!arg && typeof arg === 'object' && !isArray(arg);
}

function isFunction(arg) {
  return !!arg && typeof arg === 'function';
}

function getPrimitiveCheck(name) {
  var typeName = name.toLowerCase();
  var toStringName = "[object " + name + "]";
  return function (val) {
    var type = typeof val;
    return type === typeName || !!val && type === 'object' && toString.call(val) === toStringName;
  };
}

var isNumber = getPrimitiveCheck('Number');
exports.isNumber = isNumber;
var isString = getPrimitiveCheck('String');
exports.isString = isString;
var isBoolean = getPrimitiveCheck('Boolean');
exports.isBoolean = isBoolean;

function isDate(arg) {
  return !!arg && toString.call(arg) === '[object Date]';
}

function isRegExp(arg) {
  return !!arg && toString.call(arg) === '[object RegExp]';
}

function isPromise(arg) {
  return !!arg && isFunction(arg.then) && isFunction(arg.catch);
}

var isInteger = Number.isInteger || function isInteger(arg) {
  return isNumber(arg) && isFinite(arg) && Math.floor(arg) === arg;
};

exports.isInteger = isInteger;

function isAsync(arg) {
  return (arg == null ? void 0 : arg[Symbol.toStringTag]) === 'AsyncFunction';
}

function isArrayLike(arg) {
  var length = arg == null ? void 0 : arg.length;
  return length != null && !isFunction(arg) && isNumber(length) && length >= 0 && length <= Number.MAX_SAFE_INTEGER;
}

function isEmpty(arg) {
  return arg == null || isArrayLike(arg) && arg.length === 0 || isObject(arg) && Object.keys(arg).length === 0;
}

function asObject(arg) {
  return arg != null ? Object(arg) : arg;
}

function asArray(arg) {
  return isArray(arg) ? arg : arg !== undefined ? [arg] : [];
}

function asFunction(arg) {
  return isFunction(arg) ? arg : function () {
    return arg;
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9iYXNlLmpzIl0sIm5hbWVzIjpbImlzQXJyYXkiLCJBcnJheSIsInRvU3RyaW5nIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaXMiLCJ4IiwieSIsImlzUGxhaW5PYmplY3QiLCJhcmciLCJjdG9yIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiaXNPYmplY3QiLCJpc0Z1bmN0aW9uIiwiZ2V0UHJpbWl0aXZlQ2hlY2siLCJ0eXBlTmFtZSIsInRvTG93ZXJDYXNlIiwidG9TdHJpbmdOYW1lIiwidmFsIiwidHlwZSIsImNhbGwiLCJpc051bWJlciIsImlzU3RyaW5nIiwiaXNCb29sZWFuIiwiaXNEYXRlIiwiaXNSZWdFeHAiLCJpc1Byb21pc2UiLCJ0aGVuIiwiY2F0Y2giLCJpc0ludGVnZXIiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsIk1hdGgiLCJmbG9vciIsImlzQXN5bmMiLCJTeW1ib2wiLCJ0b1N0cmluZ1RhZyIsImlzQXJyYXlMaWtlIiwibGVuZ3RoIiwiTUFYX1NBRkVfSU5URUdFUiIsImlzRW1wdHkiLCJrZXlzIiwiYXNPYmplY3QiLCJhc0FycmF5IiwidW5kZWZpbmVkIiwiYXNGdW5jdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTyxJQUFRQSxPQUFSLEdBQW9CQyxLQUFwQixDQUFRRCxPQUFSOztBQUNQLElBQVFFLFFBQVIsR0FBcUJDLE1BQU0sQ0FBQ0MsU0FBNUIsQ0FBUUYsUUFBUjs7QUFFTyxJQUFNRyxFQUFFLEdBQUdGLE1BQU0sQ0FBQ0UsRUFBUCxJQUloQixVQUFDQyxDQUFELEVBQUlDLENBQUo7QUFBQSxTQUFVRCxDQUFDLEtBQUtDLENBQU4sR0FBVUQsQ0FBQyxLQUFLLENBQU4sSUFBVyxJQUFJQSxDQUFKLEtBQVUsSUFBSUMsQ0FBbkMsR0FBdUNELENBQUMsS0FBS0EsQ0FBTixJQUFXQyxDQUFDLEtBQUtBLENBQWxFO0FBQUEsQ0FKSzs7OztBQU9BLFNBQVNDLGFB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RU0sU0FBU0MsT0FBVCxDQUFpQmhDLEdBQWpCLEVBQXNCO0FBQzNCLFNBQU9BLEdBQUcsSUFBSSxJQUFQLElBQ0w2QixXQUFXLENBQUM3QixHQUFELENBQVgsSUFBb0JBLEdBQUcsQ0FBQzhCLE1BQUosS0FBZSxDQUQ5QixJQUVMMUIsUUFBUSxDQUFDSixHQUFELENBQVIsSUFBaUJOLE1BQU0sQ0FBQ3VDLElBQVAsQ0FBWWpDLEdBQVosRUFBaUI4QixNQUFqQixLQUE0QixDQUYvQztBQUdEOztBQUVNLFNBQVNJLFFBQVQsQ0FBa0JsQyxHQUFsQixFQUF1QjtBQUU1QixTQUFPQSxHQUFHLElBQUksSUFBUCxHQUFjTixNQUFNLENBQUNNLEdBQUQsQ0FBcEIsR0FBNEJBLEdBQW5DO0FBQ0Q7O0FBRU0sU0FBU21DLE9BQVQsQ0FBaUJuQyxHQUFqQixFQUFzQjtBQUMzQixTQUFPVCxPQUFPLENBQUNTLEdBQUQsQ0FBUCxHQUFlQSxHQUFmLEdBQXFCQSxHQUFHLEtBQUtvQyxTQUFSLEdBQW9CLENBQUNwQyxHQUFELENBQXBCLEdBQTRCLEVBQXhEO0FBQ0Q7O0FBRU0sU0FBU3FDLFVBQVQsQ0FBb0JyQyxHQUFwQixFQUF5QjtBQUM5QixTQUFPSyxVQUFVLENBQUNMLEdBQUQsQ0FBVixHQUFrQkEsR0FBbEIsR0FBd0I7QUFBQSxXQUFNQSxHQUFOO0FBQUEsR0FBL0I7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCB7IGlzQXJyYXkgfSA9IEFycmF5XG5jb25zdCB7IHRvU3RyaW5nIH0gPSBPYmplY3QucHJvdG90eXBlXG5cbmV4cG9ydCBjb25zdCBpcyA9IE9iamVjdC5pcyB8fCAoXG4gIC8vIFNhbWVWYWx1ZSBhbGdvcml0aG06XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgKHgsIHkpID0+IHggPT09IHkgPyB4ICE9PSAwIHx8IDEgLyB4ID09PSAxIC8geSA6IHggIT09IHggJiYgeSAhPT0geVxuKVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQbGFpbk9iamVjdChhcmcpIHtcbiAgY29uc3QgY3RvciA9IGFyZz8uY29uc3RydWN0b3JcbiAgLy8gV2UgYWxzbyBuZWVkIHRvIGNoZWNrIGZvciBjdG9yLm5hbWUgPT09ICdPYmplY3QnLCBpbiBjYXNlIHRoaXMgaXMgYW4gb2JqZWN0XG4gIC8vIGZyb20gYW5vdGhlciBnbG9iYWwgc2NvcGUgKGUuZy4gYW5vdGhlciB2bSBjb250ZXh0IGluIE5vZGUuanMpLlxuICAvLyBXaGVuIGFuIHZhbHVlIGhhcyBubyBjb25zdHJ1Y3RvciwgaXQgd2FzIGNyZWF0ZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZShudWxsKWBcbiAgcmV0dXJuICEhYXJnICYmICghY3RvciB8fCAoY3RvciA9PT0gT2JqZWN0IHx8IGN0b3IubmFtZSA9PT0gJ09iamVjdCcpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiAhIWFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiAhaXNBcnJheShhcmcpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gISFhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5mdW5jdGlvbiBnZXRQcmltaXRpdmVDaGVjayhuYW1lKSB7XG4gIC8vIENyZWF0ZSBjaGVja2luZyBmdW5jdGlvbiBmb3IgYWxsIHByaW1pdGl2ZSB0eXBlcyAobnVtYmVyLCBzdHJpbmcsIGJvb2xlYW4pXG4gIC8vIHRoYXQgYWxzbyBtYXRjaGVzIHRoZWlyIE9iamVjdCB3cmFwcGVycy4gV2UgY2FuJ3QgY2hlY2sgYHZhbHVlT2YoKWAgcmV0dXJuc1xuICAvLyBoZXJlIGJlY2F1c2UgYG5ldyBEYXRlKCkudmFsdWVPZigpYCBhbHNvIHJldHVybnMgYSBudW1iZXIuXG4gIGNvbnN0IHR5cGVOYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIGNvbnN0IHRvU3RyaW5nTmFtZSA9IGBbb2JqZWN0ICR7bmFtZX1dYFxuICByZXR1cm4gZnVuY3Rpb24odmFsKSB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVvZiB2YWxcbiAgICByZXR1cm4gKFxuICAgICAgdHlwZSA9PT0gdHlwZU5hbWUgfHxcbiAgICAgICEhdmFsICYmIHR5cGUgPT09ICdvYmplY3QnICYmIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gdG9TdHJpbmdOYW1lXG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBpc051bWJlciA9IGdldFByaW1pdGl2ZUNoZWNrKCdOdW1iZXInKVxuXG5leHBvcnQgY29uc3QgaXNTdHJpbmcgPSBnZXRQcmltaXRpdmVDaGVjaygnU3RyaW5nJylcblxuZXhwb3J0IGNvbnN0IGlzQm9vbGVhbiA9IGdldFByaW1pdGl2ZUNoZWNrKCdCb29sZWFuJylcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0ZShhcmcpIHtcbiAgcmV0dXJuICEhYXJnICYmIHRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgRGF0ZV0nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlZ0V4cChhcmcpIHtcbiAgcmV0dXJuICEhYXJnICYmIHRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvbWlzZShhcmcpIHtcbiAgcmV0dXJuICEhYXJnICYmIGlzRnVuY3Rpb24oYXJnLnRoZW4pICYmIGlzRnVuY3Rpb24oYXJnLmNhdGNoKVxufVxuXG5leHBvcnQgY29uc3QgaXNJbnRlZ2VyID0gTnVtYmVyLmlzSW50ZWdlciB8fCBmdW5jdGlvbiBpc0ludGVnZXIoYXJnKSB7XG4gIHJldHVybiAoXG4gICAgaXNOdW1iZXIoYXJnKSAmJlxuICAgIGlzRmluaXRlKGFyZykgJiZcbiAgICBNYXRoLmZsb29yKGFyZykgPT09IGFyZ1xuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jKGFyZykge1xuICByZXR1cm4gYXJnPy5bU3ltYm9sLnRvU3RyaW5nVGFnXSA9PT0gJ0FzeW5jRnVuY3Rpb24nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FycmF5TGlrZShhcmcpIHtcbiAgY29uc3QgbGVuZ3RoID0gYXJnPy5sZW5ndGhcbiAgcmV0dXJuIChcbiAgICBsZW5ndGggIT0gbnVsbCAmJlxuICAgICFpc0Z1bmN0aW9uKGFyZykgJiZcbiAgICBpc051bWJlcihsZW5ndGgpICYmXG4gICAgbGVuZ3RoID49IDAgJiZcbiAgICBsZW5ndGggPD0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsIHx8XG4gICAgaXNBcnJheUxpa2UoYXJnKSAmJiBhcmcubGVuZ3RoID09PSAwIHx8XG4gICAgaXNPYmplY3QoYXJnKSAmJiBPYmplY3Qua2V5cyhhcmcpLmxlbmd0aCA9PT0gMFxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNPYmplY3QoYXJnKSB7XG4gIC8vIGh0dHA6Ly8yYWxpdHkuY29tLzIwMTEvMDQvamF2YXNjcmlwdC1jb252ZXJ0aW5nLWFueS12YWx1ZS10by5odG1sXG4gIHJldHVybiBhcmcgIT0gbnVsbCA/IE9iamVjdChhcmcpIDogYXJnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc0FycmF5KGFyZykge1xuICByZXR1cm4gaXNBcnJheShhcmcpID8gYXJnIDogYXJnICE9PSB1bmRlZmluZWQgPyBbYXJnXSA6IFtdXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gaXNGdW5jdGlvbihhcmcpID8gYXJnIDogKCkgPT4gYXJnXG59XG4iXX0=