"use strict";

exports.__esModule = true;
exports.toCallback = toCallback;

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("regenerator-runtime/runtime.js");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function toCallback(asyncFunction) {
  return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var _len,
        args,
        _key,
        done,
        _args = arguments;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            for (_len = _args.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = _args[_key];
            }

            done = args.pop();
            _context.prev = 2;
            _context.t0 = done;
            _context.next = 6;
            return asyncFunction.apply(void 0, args);

          case 6:
            _context.t1 = _context.sent;
            (0, _context.t0)(null, _context.t1);
            _context.next = 13;
            break;

          case 10:
            _context.prev = 10;
            _context.t2 = _context["catch"](2);
            done(_context.t2);

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[2, 10]]);
  }));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mdW5jdGlvbi90b0NhbGxiYWNrLmpzIl0sIm5hbWVzIjpbInRvQ2FsbGJhY2siLCJhc3luY0Z1bmN0aW9uIiwiYXJncyIsImRvbmUiLCJwb3AiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFPLFNBQVNBLFVBQVQsQ0FBb0JDLGFBQXBCLEVBQW1DO0FBQ3hDLG1EQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNDQUFVQyxJQUFWO0FBQVVBLGNBQUFBLElBQVY7QUFBQTs7QUFFQ0MsWUFBQUEsSUFGRCxHQUVRRCxJQUFJLENBQUNFLEdBQUwsRUFGUjtBQUFBO0FBQUEsMEJBSUhELElBSkc7QUFBQTtBQUFBLG1CQUljRixhQUFhLE1BQWIsU0FBaUJDLElBQWpCLENBSmQ7O0FBQUE7QUFBQTtBQUFBLDZCQUlFLElBSkY7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQU1IQyxZQUFBQSxJQUFJLGFBQUo7O0FBTkc7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBUDtBQVNEIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIHRvQ2FsbGJhY2soYXN5bmNGdW5jdGlvbikge1xuICByZXR1cm4gYXN5bmMgKC4uLmFyZ3MpID0+IHtcbiAgICAvLyBUaGUgbGFzdCBhcmd1bWVudCBpcyB0aGUgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICBjb25zdCBkb25lID0gYXJncy5wb3AoKVxuICAgIHRyeSB7XG4gICAgICBkb25lKG51bGwsIGF3YWl0IGFzeW5jRnVuY3Rpb24oLi4uYXJncykpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBkb25lKGVycilcbiAgICB9XG4gIH1cbn1cbiJdfQ==