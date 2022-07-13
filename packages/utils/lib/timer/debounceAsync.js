"use strict";

require("core-js/modules/es.array.slice.js");

require("core-js/modules/es.function.name.js");

require("core-js/modules/es.array.from.js");

require("core-js/modules/es.string.iterator.js");

require("core-js/modules/es.symbol.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.symbol.iterator.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/web.dom-collections.iterator.js");

exports.__esModule = true;
exports.debounceAsync = debounceAsync;

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("regenerator-runtime/runtime.js");

var _base = require("../base");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function debounceAsync(func, options) {
  var _ref = (0, _base.isNumber)(options) ? {
    delay: options
  } : options,
      delay = _ref.delay,
      immediate = _ref.immediate;

  var timer = null;
  var callbacks = [];
  var cancelled = false;

  var resolve = function resolve(result) {
    for (var _iterator = _createForOfIteratorHelperLoose(callbacks), _step; !(_step = _iterator()).done;) {
      var _resolve = _step.value.resolve;

      _resolve(result);
    }
  };

  var execute = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(that, args) {
      var _callbacks$pop, reject;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.t0 = resolve;
              _context.next = 4;
              return func.apply(that, args);

            case 4:
              _context.t1 = _context.sent;
              (0, _context.t0)(_context.t1);
              _context.next = 13;
              break;

            case 8:
              _context.prev = 8;
              _context.t2 = _context["catch"](0);
              _callbacks$pop = callbacks.pop(), reject = _callbacks$pop.reject;
              resolve(undefined);
              reject(_context.t2);

            case 13:
              callbacks = [];

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 8]]);
    }));

    return function execute(_x, _x2) {
      return _ref2.apply(this, arguments);
    };
  }();

  var debounced = function debounced() {
    var _this = this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new Promise(function (resolve, reject) {
      var callNow = immediate && !timer;
      clearTimeout(timer);
      timer = setTimeout(function () {
        timer = null;

        if (!immediate) {
          execute(_this, args);
        }
      }, delay);
      callbacks.push({
        resolve: resolve,
        reject: reject
      });

      if (cancelled) {
        resolve(undefined);
      } else if (callNow) {
        execute(_this, args);
      }
    });
  };

  debounced.cancel = function () {
    var pending = timer !== null;

    if (pending) {
      resolve(undefined);
      clearTimeout(timer);
      timer = null;
    }

    cancelled = true;
    return pending;
  };

  return debounced;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90aW1lci9kZWJvdW5jZUFzeW5jLmpzIl0sIm5hbWVzIjpbImRlYm91bmNlQXN5bmMiLCJmdW5jIiwib3B0aW9ucyIsImRlbGF5IiwiaW1tZWRpYXRlIiwidGltZXIiLCJjYWxsYmFja3MiLCJjYW5jZWxsZWQiLCJyZXNvbHZlIiwicmVzdWx0IiwiZXhlY3V0ZSIsInRoYXQiLCJhcmdzIiwiYXBwbHkiLCJwb3AiLCJyZWplY3QiLCJ1bmRlZmluZWQiLCJkZWJvdW5jZWQiLCJQcm9taXNlIiwiY2FsbE5vdyIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJwdXNoIiwiY2FuY2VsIiwicGVuZGluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7O0FBRU8sU0FBU0EsYUFBVCxDQUF1QkMsSUFBdkIsRUFBNkJDLE9BQTdCLEVBQXNDO0FBQzNDLGFBQTZCLG9CQUFTQSxPQUFULElBQW9CO0FBQUVDLElBQUFBLEtBQUssRUFBRUQ7QUFBVCxHQUFwQixHQUF5Q0EsT0FBdEU7QUFBQSxNQUFRQyxLQUFSLFFBQVFBLEtBQVI7QUFBQSxNQUFlQyxTQUFmLFFBQWVBLFNBQWY7O0FBRUEsTUFBSUMsS0FBSyxHQUFHLElBQVo7QUFDQSxNQUFJQyxTQUFTLEdBQUcsRUFBaEI7QUFDQSxNQUFJQyxTQUFTLEdBQUcsS0FBaEI7O0FBRUEsTUFBTUMsT0FBTyxHQUFHLFNBQVZBLE9BQVUsQ0FBQUMsTUFBTSxFQUFJO0FBQ3hCLHlEQUEwQkgsU0FBMUIsd0NBQXFDO0FBQUEsVUFBeEJFLFFBQXdCLGVBQXhCQSxPQUF3Qjs7QUFDbkNBLE1BQUFBLFFBQU8sQ0FBQ0MsTUFBRCxDQUFQO0FBQ0Q7QUFDRixHQUpEOztBQU1BLE1BQU1DLE9BQU87QUFBQSwwREFBRyxpQkFBT0MsSUFBUCxFQUFhQyxJQUFiO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDRCQUVaSixPQUZZO0FBQUE7QUFBQSxxQkFFRVAsSUFBSSxDQUFDWSxLQUFMLENBQVdGLElBQVgsRUFBaUJDLElBQWpCLENBRkY7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQSwrQkFNT04sU0FBUyxDQUFDUSxHQUFWLEVBTlAsRUFNSkMsTUFOSSxrQkFNSkEsTUFOSTtBQU9aUCxjQUFBQSxPQUFPLENBQUNRLFNBQUQsQ0FBUDtBQUNBRCxjQUFBQSxNQUFNLGFBQU47O0FBUlk7QUFVZFQsY0FBQUEsU0FBUyxHQUFHLEVBQVo7O0FBVmM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBSDs7QUFBQSxvQkFBUEksT0FBTztBQUFBO0FBQUE7QUFBQSxLQUFiOztBQWFBLE1BQU1PLFNBQVMsR0FBRyxTQUFaQSxTQUFZLEdBQWtCO0FBQUE7O0FBQUEsc0NBQU5MLElBQU07QUFBTkEsTUFBQUEsSUFBTTtBQUFBOztBQUNsQyxXQUFPLElBQUlNLE9BQUosQ0FBWSxVQUFDVixPQUFELEVBQVVPLE1BQVYsRUFBcUI7QUFDdEMsVUFBTUksT0FBTyxHQUFHZixTQUFTLElBQUksQ0FBQ0MsS0FBOUI7QUFDQWUsTUFBQUEsWUFBWSxDQUFDZixLQUFELENBQVo7QUFDQUEsTUFBQUEsS0FBSyxHQUFHZ0IsVUFBVSxDQUFDLFlBQU07QUFDdkJoQixRQUFBQSxLQUFLLEdBQUcsSUFBUjs7QUFDQSxZQUFJLENBQUNELFNBQUwsRUFBZ0I7QUFDZE0sVUFBQUEsT0FBTyxDQUFDLEtBQUQsRUFBT0UsSUFBUCxDQUFQO0FBQ0Q7QUFDRixPQUxpQixFQUtmVCxLQUxlLENBQWxCO0FBTUFHLE1BQUFBLFNBQVMsQ0FBQ2dCLElBQVYsQ0FBZTtBQUFFZCxRQUFBQSxPQUFPLEVBQVBBLE9BQUY7QUFBV08sUUFBQUEsTUFBTSxFQUFOQTtBQUFYLE9BQWY7O0FBQ0EsVUFBSVIsU0FBSixFQUFlO0FBQ2JDLFFBQUFBLE9BQU8sQ0FBQ1EsU0FBRCxDQUFQO0FBQ0QsT0FGRCxNQUVPLElBQUlHLE9BQUosRUFBYTtBQUNsQlQsUUFBQUEsT0FBTyxDQUFDLEtBQUQsRUFBT0UsSUFBUCxDQUFQO0FBQ0Q7QUFDRixLQWZNLENBQVA7QUFnQkQsR0FqQkQ7O0FBbUJBSyxFQUFBQSxTQUFTLENBQUNNLE1BQVYsR0FBbUIsWUFBVztBQUM1QixRQUFNQyxPQUFPLEdBQUduQixLQUFLLEtBQUssSUFBMUI7O0FBQ0EsUUFBSW1CLE9BQUosRUFBYTtBQUNYaEIsTUFBQUEsT0FBTyxDQUFDUSxTQUFELENBQVA7QUFDQUksTUFBQUEsWUFBWSxDQUFDZixLQUFELENBQVo7QUFDQUEsTUFBQUEsS0FBSyxHQUFHLElBQVI7QUFDRDs7QUFDREUsSUFBQUEsU0FBUyxHQUFHLElBQVo7QUFDQSxXQUFPaUIsT0FBUDtBQUNELEdBVEQ7O0FBV0EsU0FBT1AsU0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNOdW1iZXIgfSBmcm9tICdAL2Jhc2UnXG5cbmV4cG9ydCBmdW5jdGlvbiBkZWJvdW5jZUFzeW5jKGZ1bmMsIG9wdGlvbnMpIHtcbiAgY29uc3QgeyBkZWxheSwgaW1tZWRpYXRlIH0gPSBpc051bWJlcihvcHRpb25zKSA/IHsgZGVsYXk6IG9wdGlvbnMgfSA6IG9wdGlvbnNcblxuICBsZXQgdGltZXIgPSBudWxsXG4gIGxldCBjYWxsYmFja3MgPSBbXVxuICBsZXQgY2FuY2VsbGVkID0gZmFsc2VcblxuICBjb25zdCByZXNvbHZlID0gcmVzdWx0ID0+IHtcbiAgICBmb3IgKGNvbnN0IHsgcmVzb2x2ZSB9IG9mIGNhbGxiYWNrcykge1xuICAgICAgcmVzb2x2ZShyZXN1bHQpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgZXhlY3V0ZSA9IGFzeW5jICh0aGF0LCBhcmdzKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJlc29sdmUoYXdhaXQgZnVuYy5hcHBseSh0aGF0LCBhcmdzKSlcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIENvbnZlbnRpb246IHJlamVjdCB0aGUgbGFzdCB3YWl0aW5nIHByb21pc2UsIHdoaWxlIGFsbCB0aGUgb3RoZXJzIGFyZVxuICAgICAgLy8gcmVzb2x2ZWQgd2l0aCB1bmRlZmluZWQuXG4gICAgICBjb25zdCB7IHJlamVjdCB9ID0gY2FsbGJhY2tzLnBvcCgpXG4gICAgICByZXNvbHZlKHVuZGVmaW5lZClcbiAgICAgIHJlamVjdChlcnIpXG4gICAgfVxuICAgIGNhbGxiYWNrcyA9IFtdXG4gIH1cblxuICBjb25zdCBkZWJvdW5jZWQgPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVyXG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aW1lciA9IG51bGxcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcbiAgICAgICAgICBleGVjdXRlKHRoaXMsIGFyZ3MpXG4gICAgICAgIH1cbiAgICAgIH0sIGRlbGF5KVxuICAgICAgY2FsbGJhY2tzLnB1c2goeyByZXNvbHZlLCByZWplY3QgfSlcbiAgICAgIGlmIChjYW5jZWxsZWQpIHtcbiAgICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpXG4gICAgICB9IGVsc2UgaWYgKGNhbGxOb3cpIHtcbiAgICAgICAgZXhlY3V0ZSh0aGlzLCBhcmdzKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBkZWJvdW5jZWQuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgcGVuZGluZyA9IHRpbWVyICE9PSBudWxsXG4gICAgaWYgKHBlbmRpbmcpIHtcbiAgICAgIHJlc29sdmUodW5kZWZpbmVkKVxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKVxuICAgICAgdGltZXIgPSBudWxsXG4gICAgfVxuICAgIGNhbmNlbGxlZCA9IHRydWVcbiAgICByZXR1cm4gcGVuZGluZ1xuICB9XG5cbiAgcmV0dXJuIGRlYm91bmNlZFxufVxuIl19