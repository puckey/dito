"use strict";

require("regenerator-runtime/runtime.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

var _toCallback = require("./toCallback");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

describe('toCallback()', function () {
  it('should convert async functions to callbacks', _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var callback, expected;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            expect.assertions(2);
            callback = (0, _toCallback.toCallback)(function () {
              var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(result) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return Promise.resolve();

                      case 2:
                        return _context.abrupt("return", result);

                      case 3:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x) {
                return _ref2.apply(this, arguments);
              };
            }());
            expected = 10;
            callback(expected, function (err, actual) {
              expect(err).toBeNull();
              expect(actual).toBe(expected);
            });

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  })));
  it('should convert async exceptions to callback errors', _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
    var error, callback;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            expect.assertions(2);
            error = new Error('This error is intentional');
            callback = (0, _toCallback.toCallback)(function () {
              var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(error) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.next = 2;
                        return Promise.resolve();

                      case 2:
                        throw error;

                      case 3:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function (_x2) {
                return _ref4.apply(this, arguments);
              };
            }());
            callback(error, function (err, actual) {
              expect(err).toBe(error);
              expect(actual).toBe(undefined);
            });

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  })));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mdW5jdGlvbi90b0NhbGxiYWNrLnRlc3QuanMiXSwibmFtZXMiOlsiZGVzY3JpYmUiLCJpdCIsImV4cGVjdCIsImFzc2VydGlvbnMiLCJjYWxsYmFjayIsInJlc3VsdCIsIlByb21pc2UiLCJyZXNvbHZlIiwiZXhwZWN0ZWQiLCJlcnIiLCJhY3R1YWwiLCJ0b0JlTnVsbCIsInRvQmUiLCJlcnJvciIsIkVycm9yIiwidW5kZWZpbmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7Ozs7QUFFQUEsUUFBUSxDQUFDLGNBQUQsRUFBaUIsWUFBTTtBQUM3QkMsRUFBQUEsRUFBRSxDQUFDLDZDQUFELDRDQUFnRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDaERDLFlBQUFBLE1BQU0sQ0FBQ0MsVUFBUCxDQUFrQixDQUFsQjtBQUNNQyxZQUFBQSxRQUYwQyxHQUUvQjtBQUFBLG9FQUFXLGlCQUFNQyxNQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLCtCQUNwQkMsT0FBTyxDQUFDQyxPQUFSLEVBRG9COztBQUFBO0FBQUEseURBRW5CRixNQUZtQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUFYOztBQUFBO0FBQUE7QUFBQTtBQUFBLGdCQUYrQjtBQU0xQ0csWUFBQUEsUUFOMEMsR0FNL0IsRUFOK0I7QUFPaERKLFlBQUFBLFFBQVEsQ0FBQ0ksUUFBRCxFQUFXLFVBQUNDLEdBQUQsRUFBTUMsTUFBTixFQUFpQjtBQUNsQ1IsY0FBQUEsTUFBTSxDQUFDTyxHQUFELENBQU4sQ0FBWUUsUUFBWjtBQUNBVCxjQUFBQSxNQUFNLENBQUNRLE1BQUQsQ0FBTixDQUFlRSxJQUFmLENBQW9CSixRQUFwQjtBQUNELGFBSE8sQ0FBUjs7QUFQZ0Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBaEQsR0FBRjtBQWFBUCxFQUFBQSxFQUFFLENBQUMsb0RBQUQsNENBQXVEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN2REMsWUFBQUEsTUFBTSxDQUFDQyxVQUFQLENBQWtCLENBQWxCO0FBQ01VLFlBQUFBLEtBRmlELEdBRXpDLElBQUlDLEtBQUosQ0FBVSwyQkFBVixDQUZ5QztBQUdqRFYsWUFBQUEsUUFIaUQsR0FHdEM7QUFBQSxvRUFBVyxrQkFBTVMsS0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwrQkFDcEJQLE9BQU8sQ0FBQ0MsT0FBUixFQURvQjs7QUFBQTtBQUFBLDhCQUVwQk0sS0FGb0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBWDs7QUFBQTtBQUFBO0FBQUE7QUFBQSxnQkFIc0M7QUFPdkRULFlBQUFBLFFBQVEsQ0FBQ1MsS0FBRCxFQUFRLFVBQUNKLEdBQUQsRUFBTUMsTUFBTixFQUFpQjtBQUMvQlIsY0FBQUEsTUFBTSxDQUFDTyxHQUFELENBQU4sQ0FBWUcsSUFBWixDQUFpQkMsS0FBakI7QUFDQVgsY0FBQUEsTUFBTSxDQUFDUSxNQUFELENBQU4sQ0FBZUUsSUFBZixDQUFvQkcsU0FBcEI7QUFDRCxhQUhPLENBQVI7O0FBUHVEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQXZELEdBQUY7QUFZRCxDQTFCTyxDQUFSIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdG9DYWxsYmFjayB9IGZyb20gJy4vdG9DYWxsYmFjaydcblxuZGVzY3JpYmUoJ3RvQ2FsbGJhY2soKScsICgpID0+IHtcbiAgaXQoJ3Nob3VsZCBjb252ZXJ0IGFzeW5jIGZ1bmN0aW9ucyB0byBjYWxsYmFja3MnLCBhc3luYyAoKSA9PiB7XG4gICAgZXhwZWN0LmFzc2VydGlvbnMoMilcbiAgICBjb25zdCBjYWxsYmFjayA9IHRvQ2FsbGJhY2soYXN5bmMgcmVzdWx0ID0+IHtcbiAgICAgIGF3YWl0IFByb21pc2UucmVzb2x2ZSgpXG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSlcbiAgICBjb25zdCBleHBlY3RlZCA9IDEwXG4gICAgY2FsbGJhY2soZXhwZWN0ZWQsIChlcnIsIGFjdHVhbCkgPT4ge1xuICAgICAgZXhwZWN0KGVycikudG9CZU51bGwoKVxuICAgICAgZXhwZWN0KGFjdHVhbCkudG9CZShleHBlY3RlZClcbiAgICB9KVxuICB9KVxuXG4gIGl0KCdzaG91bGQgY29udmVydCBhc3luYyBleGNlcHRpb25zIHRvIGNhbGxiYWNrIGVycm9ycycsIGFzeW5jICgpID0+IHtcbiAgICBleHBlY3QuYXNzZXJ0aW9ucygyKVxuICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdUaGlzIGVycm9yIGlzIGludGVudGlvbmFsJylcbiAgICBjb25zdCBjYWxsYmFjayA9IHRvQ2FsbGJhY2soYXN5bmMgZXJyb3IgPT4ge1xuICAgICAgYXdhaXQgUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgIHRocm93IGVycm9yXG4gICAgfSlcbiAgICBjYWxsYmFjayhlcnJvciwgKGVyciwgYWN0dWFsKSA9PiB7XG4gICAgICBleHBlY3QoZXJyKS50b0JlKGVycm9yKVxuICAgICAgZXhwZWN0KGFjdHVhbCkudG9CZSh1bmRlZmluZWQpXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=