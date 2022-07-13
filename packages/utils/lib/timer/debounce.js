"use strict";

exports.__esModule = true;
exports.debounce = debounce;

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("regenerator-runtime/runtime.js");

var _base = require("../base");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function debounce(func, options) {
  var _ref = (0, _base.isNumber)(options) ? {
    delay: options
  } : options,
      delay = _ref.delay,
      immediate = _ref.immediate;

  var timer = null;
  var result;

  var debounced = function debounced() {
    var _this = this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var callNow = immediate && !timer;
    clearTimeout(timer);
    timer = setTimeout(_asyncToGenerator(regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              timer = null;

              if (!immediate) {
                result = func.apply(_this, args);
              }

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })), delay);

    if (callNow) {
      result = func.apply(this, args);
    }

    return result;
  };

  debounced.cancel = function () {
    var pending = timer !== null;

    if (pending) {
      clearTimeout(timer);
      timer = null;
    }

    return pending;
  };

  return debounced;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90aW1lci9kZWJvdW5jZS5qcyJdLCJuYW1lcyI6WyJkZWJvdW5jZSIsImZ1bmMiLCJvcHRpb25zIiwiZGVsYXkiLCJpbW1lZGlhdGUiLCJ0aW1lciIsInJlc3VsdCIsImRlYm91bmNlZCIsImFyZ3MiLCJjYWxsTm93IiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsImFwcGx5IiwiY2FuY2VsIiwicGVuZGluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7O0FBRU8sU0FBU0EsUUFBVCxDQUFrQkMsSUFBbEIsRUFBd0JDLE9BQXhCLEVBQWlDO0FBQ3RDLGFBQTZCLG9CQUFTQSxPQUFULElBQW9CO0FBQUVDLElBQUFBLEtBQUssRUFBRUQ7QUFBVCxHQUFwQixHQUF5Q0EsT0FBdEU7QUFBQSxNQUFRQyxLQUFSLFFBQVFBLEtBQVI7QUFBQSxNQUFlQyxTQUFmLFFBQWVBLFNBQWY7O0FBRUEsTUFBSUMsS0FBSyxHQUFHLElBQVo7QUFDQSxNQUFJQyxNQUFKOztBQUVBLE1BQU1DLFNBQVMsR0FBRyxTQUFaQSxTQUFZLEdBQWtCO0FBQUE7O0FBQUEsc0NBQU5DLElBQU07QUFBTkEsTUFBQUEsSUFBTTtBQUFBOztBQUNsQyxRQUFNQyxPQUFPLEdBQUdMLFNBQVMsSUFBSSxDQUFDQyxLQUE5QjtBQUNBSyxJQUFBQSxZQUFZLENBQUNMLEtBQUQsQ0FBWjtBQUNBQSxJQUFBQSxLQUFLLEdBQUdNLFVBQVUsMkNBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNqQk4sY0FBQUEsS0FBSyxHQUFHLElBQVI7O0FBQ0Esa0JBQUksQ0FBQ0QsU0FBTCxFQUFnQjtBQUNkRSxnQkFBQUEsTUFBTSxHQUFHTCxJQUFJLENBQUNXLEtBQUwsQ0FBVyxLQUFYLEVBQWlCSixJQUFqQixDQUFUO0FBQ0Q7O0FBSmdCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQUQsSUFLZkwsS0FMZSxDQUFsQjs7QUFNQSxRQUFJTSxPQUFKLEVBQWE7QUFDWEgsTUFBQUEsTUFBTSxHQUFHTCxJQUFJLENBQUNXLEtBQUwsQ0FBVyxJQUFYLEVBQWlCSixJQUFqQixDQUFUO0FBQ0Q7O0FBQ0QsV0FBT0YsTUFBUDtBQUNELEdBYkQ7O0FBZUFDLEVBQUFBLFNBQVMsQ0FBQ00sTUFBVixHQUFtQixZQUFXO0FBQzVCLFFBQU1DLE9BQU8sR0FBR1QsS0FBSyxLQUFLLElBQTFCOztBQUNBLFFBQUlTLE9BQUosRUFBYTtBQUNYSixNQUFBQSxZQUFZLENBQUNMLEtBQUQsQ0FBWjtBQUNBQSxNQUFBQSxLQUFLLEdBQUcsSUFBUjtBQUNEOztBQUNELFdBQU9TLE9BQVA7QUFDRCxHQVBEOztBQVNBLFNBQU9QLFNBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzTnVtYmVyIH0gZnJvbSAnQC9iYXNlJ1xuXG5leHBvcnQgZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgb3B0aW9ucykge1xuICBjb25zdCB7IGRlbGF5LCBpbW1lZGlhdGUgfSA9IGlzTnVtYmVyKG9wdGlvbnMpID8geyBkZWxheTogb3B0aW9ucyB9IDogb3B0aW9uc1xuXG4gIGxldCB0aW1lciA9IG51bGxcbiAgbGV0IHJlc3VsdFxuXG4gIGNvbnN0IGRlYm91bmNlZCA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICBjb25zdCBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lclxuICAgIGNsZWFyVGltZW91dCh0aW1lcilcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgdGltZXIgPSBudWxsXG4gICAgICBpZiAoIWltbWVkaWF0ZSkge1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpXG4gICAgICB9XG4gICAgfSwgZGVsYXkpXG4gICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpcywgYXJncylcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgZGVib3VuY2VkLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHBlbmRpbmcgPSB0aW1lciAhPT0gbnVsbFxuICAgIGlmIChwZW5kaW5nKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgICB0aW1lciA9IG51bGxcbiAgICB9XG4gICAgcmV0dXJuIHBlbmRpbmdcbiAgfVxuXG4gIHJldHVybiBkZWJvdW5jZWRcbn1cbiJdfQ==