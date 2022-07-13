"use strict";

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("regenerator-runtime/runtime.js");

var _toAsync = require("./toAsync");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

describe('toAsync()', function () {
  it('should convert callback functions to async', _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var asyncFunc, expected, actual;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            expect.assertions(1);
            asyncFunc = (0, _toAsync.toAsync)(function (toResolve, callback) {
              process.nextTick(function () {
                callback(null, toResolve);
              });
            });
            expected = 10;
            _context.next = 5;
            return asyncFunc(expected);

          case 5:
            actual = _context.sent;
            expect(actual).toBe(expected);

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
  it('should convert callback errors to exceptions', _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var error, throwError;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            expect.assertions(1);
            error = new Error('This error is intentional');
            throwError = (0, _toAsync.toAsync)(function (toReject, callback) {
              process.nextTick(function () {
                callback(toReject);
              });
            });
            _context2.prev = 3;
            _context2.next = 6;
            return throwError(error);

          case 6:
            _context2.next = 11;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](3);
            expect(_context2.t0).toBe(error);

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 8]]);
  })));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mdW5jdGlvbi90b0FzeW5jLnRlc3QuanMiXSwibmFtZXMiOlsiZGVzY3JpYmUiLCJpdCIsImV4cGVjdCIsImFzc2VydGlvbnMiLCJhc3luY0Z1bmMiLCJ0b1Jlc29sdmUiLCJjYWxsYmFjayIsInByb2Nlc3MiLCJuZXh0VGljayIsImV4cGVjdGVkIiwiYWN0dWFsIiwidG9CZSIsImVycm9yIiwiRXJyb3IiLCJ0aHJvd0Vycm9yIiwidG9SZWplY3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7OztBQUVBQSxRQUFRLENBQUMsV0FBRCxFQUFjLFlBQU07QUFDMUJDLEVBQUFBLEVBQUUsQ0FBQyw0Q0FBRCw0Q0FBK0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQy9DQyxZQUFBQSxNQUFNLENBQUNDLFVBQVAsQ0FBa0IsQ0FBbEI7QUFDTUMsWUFBQUEsU0FGeUMsR0FFN0Isc0JBQVEsVUFBU0MsU0FBVCxFQUFvQkMsUUFBcEIsRUFBOEI7QUFDdERDLGNBQUFBLE9BQU8sQ0FBQ0MsUUFBUixDQUFpQixZQUFNO0FBQ3JCRixnQkFBQUEsUUFBUSxDQUFDLElBQUQsRUFBT0QsU0FBUCxDQUFSO0FBQ0QsZUFGRDtBQUdELGFBSmlCLENBRjZCO0FBT3pDSSxZQUFBQSxRQVB5QyxHQU85QixFQVA4QjtBQUFBO0FBQUEsbUJBUTFCTCxTQUFTLENBQUNLLFFBQUQsQ0FSaUI7O0FBQUE7QUFRekNDLFlBQUFBLE1BUnlDO0FBUy9DUixZQUFBQSxNQUFNLENBQUNRLE1BQUQsQ0FBTixDQUFlQyxJQUFmLENBQW9CRixRQUFwQjs7QUFUK0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBL0MsR0FBRjtBQVlBUixFQUFBQSxFQUFFLENBQUMsOENBQUQsNENBQWlEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNqREMsWUFBQUEsTUFBTSxDQUFDQyxVQUFQLENBQWtCLENBQWxCO0FBQ01TLFlBQUFBLEtBRjJDLEdBRW5DLElBQUlDLEtBQUosQ0FBVSwyQkFBVixDQUZtQztBQUczQ0MsWUFBQUEsVUFIMkMsR0FHOUIsc0JBQVEsVUFBU0MsUUFBVCxFQUFtQlQsUUFBbkIsRUFBNkI7QUFDdERDLGNBQUFBLE9BQU8sQ0FBQ0MsUUFBUixDQUFpQixZQUFNO0FBQ3JCRixnQkFBQUEsUUFBUSxDQUFDUyxRQUFELENBQVI7QUFDRCxlQUZEO0FBR0QsYUFKa0IsQ0FIOEI7QUFBQTtBQUFBO0FBQUEsbUJBVXpDRCxVQUFVLENBQUNGLEtBQUQsQ0FWK0I7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQVkvQ1YsWUFBQUEsTUFBTSxjQUFOLENBQVlTLElBQVosQ0FBaUJDLEtBQWpCOztBQVorQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFqRCxHQUFGO0FBZUQsQ0E1Qk8sQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHRvQXN5bmMgfSBmcm9tICcuL3RvQXN5bmMnXG5cbmRlc2NyaWJlKCd0b0FzeW5jKCknLCAoKSA9PiB7XG4gIGl0KCdzaG91bGQgY29udmVydCBjYWxsYmFjayBmdW5jdGlvbnMgdG8gYXN5bmMnLCBhc3luYyAoKSA9PiB7XG4gICAgZXhwZWN0LmFzc2VydGlvbnMoMSlcbiAgICBjb25zdCBhc3luY0Z1bmMgPSB0b0FzeW5jKGZ1bmN0aW9uKHRvUmVzb2x2ZSwgY2FsbGJhY2spIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4ge1xuICAgICAgICBjYWxsYmFjayhudWxsLCB0b1Jlc29sdmUpXG4gICAgICB9KVxuICAgIH0pXG4gICAgY29uc3QgZXhwZWN0ZWQgPSAxMFxuICAgIGNvbnN0IGFjdHVhbCA9IGF3YWl0IGFzeW5jRnVuYyhleHBlY3RlZClcbiAgICBleHBlY3QoYWN0dWFsKS50b0JlKGV4cGVjdGVkKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgY29udmVydCBjYWxsYmFjayBlcnJvcnMgdG8gZXhjZXB0aW9ucycsIGFzeW5jICgpID0+IHtcbiAgICBleHBlY3QuYXNzZXJ0aW9ucygxKVxuICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdUaGlzIGVycm9yIGlzIGludGVudGlvbmFsJylcbiAgICBjb25zdCB0aHJvd0Vycm9yID0gdG9Bc3luYyhmdW5jdGlvbih0b1JlamVjdCwgY2FsbGJhY2spIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4ge1xuICAgICAgICBjYWxsYmFjayh0b1JlamVjdClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aHJvd0Vycm9yKGVycm9yKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZXhwZWN0KGVycikudG9CZShlcnJvcilcbiAgICB9XG4gIH0pXG59KVxuIl19