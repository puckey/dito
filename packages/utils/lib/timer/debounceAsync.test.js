"use strict";

require("regenerator-runtime/runtime.js");

require("core-js/modules/es.symbol.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.string.iterator.js");

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.array.fill.js");

var _debounceAsync = require("./debounceAsync");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

jest.useFakeTimers();
describe('debounceAsync()', function () {
  var fixture = Symbol('fixture');
  it('should never execute if intervals are less than wait', function () {
    var func = jest.fn();
    var debounced = (0, _debounceAsync.debounceAsync)(func, 1000);

    for (var i = 0; i < 10; i++) {
      jest.advanceTimersByTime(500);
      debounced();
    }

    expect(func).toBeCalledTimes(0);
  });
  it('should execute just once if an interval is big enough', function () {
    var func = jest.fn();
    var debounced = (0, _debounceAsync.debounceAsync)(func, 1000);

    for (var i = 0; i < 10; i++) {
      jest.advanceTimersByTime(500);
      debounced();
    }

    jest.advanceTimersByTime(1000);
    debounced();
    expect(func).toBeCalledTimes(1);
  });
  it('should pass through argument', _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var func, debounced, promise;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            expect.assertions(2);
            func = jest.fn(function () {
              var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(value) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        return _context.abrupt("return", value);

                      case 1:
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
            debounced = (0, _debounceAsync.debounceAsync)(func, 1000);
            promise = debounced(fixture);
            jest.advanceTimersByTime(1000);
            _context2.t0 = expect;
            _context2.next = 8;
            return promise;

          case 8:
            _context2.t1 = _context2.sent;
            (0, _context2.t0)(_context2.t1).toBe(fixture);
            expect(func).toBeCalledTimes(1);

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  })));
  it('should pass through return value', _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    var func, debounced, promises;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            expect.assertions(2);
            func = jest.fn().mockResolvedValueOnce(fixture);
            debounced = (0, _debounceAsync.debounceAsync)(func, 1000);
            promises = [];
            promises.push(debounced());
            jest.advanceTimersByTime(1000);
            promises.push(debounced());
            _context3.t0 = expect;
            _context3.next = 10;
            return Promise.all(promises);

          case 10:
            _context3.t1 = _context3.sent;
            (0, _context3.t0)(_context3.t1).toStrictEqual([fixture, fixture]);
            expect(func).toBeCalledTimes(1);

          case 13:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  })));
  it('should pass through `this`', _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
    var func, debounced, obj, promises;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            expect.assertions(2);
            func = jest.fn(_asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
              return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      return _context4.abrupt("return", this);

                    case 1:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _callee4, this);
            })));
            debounced = (0, _debounceAsync.debounceAsync)(func, 1000);
            obj = {};
            promises = [];
            promises.push(debounced.call(obj));
            jest.advanceTimersByTime(1000);
            promises.push(debounced.call(obj));
            _context5.t0 = expect;
            _context5.next = 11;
            return Promise.all(promises);

          case 11:
            _context5.t1 = _context5.sent;
            (0, _context5.t0)(_context5.t1).toStrictEqual([obj, obj]);
            expect(func).toBeCalledTimes(1);

          case 14:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  })));
  it('should allow to cancel', _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
    var func, debounced, promise;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            expect.assertions(6);
            func = jest.fn();
            debounced = (0, _debounceAsync.debounceAsync)(func, 1000);
            promise = debounced();
            jest.advanceTimersByTime(500);
            expect(debounced.cancel()).toBe(true);
            expect(debounced.cancel()).toBe(false);
            jest.advanceTimersByTime(500);
            expect(func).toBeCalledTimes(0);
            _context6.t0 = expect;
            _context6.next = 12;
            return promise;

          case 12:
            _context6.t1 = _context6.sent;
            (0, _context6.t0)(_context6.t1).toBeUndefined();
            jest.advanceTimersByTime(1000);
            expect(func).toBeCalledTimes(0);
            _context6.next = 18;
            return debounced();

          case 18:
            jest.advanceTimersByTime(1000);
            expect(func).toBeCalledTimes(1);

          case 20:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  })));
  it('should execute once immediately if intervals are less than wait', _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
    var func, debounced, promises, i;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            expect.assertions(2);
            func = jest.fn();
            debounced = (0, _debounceAsync.debounceAsync)(func, {
              delay: 1000,
              immediate: true
            });
            promises = [];
            promises.push(debounced());
            expect(func).toBeCalledTimes(1);

            for (i = 0; i < 10; i++) {
              jest.advanceTimersByTime(500);
              promises.push(debounced());
            }

            _context7.next = 9;
            return Promise.all(promises);

          case 9:
            expect(func).toBeCalledTimes(1);

          case 10:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  })));
  it('should execute twice immediately with long enough intervals', _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
    var func, debounced, promises, i;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            expect.assertions(3);
            func = jest.fn();
            debounced = (0, _debounceAsync.debounceAsync)(func, {
              delay: 1000,
              immediate: true
            });
            promises = [];
            promises.push(debounced());
            expect(func).toBeCalledTimes(1);

            for (i = 0; i < 10; i++) {
              jest.advanceTimersByTime(500);
              promises.push(debounced());
            }

            expect(func).toBeCalledTimes(1);
            jest.advanceTimersByTime(1000);
            promises.push(debounced());
            _context8.next = 12;
            return Promise.all(promises);

          case 12:
            expect(func).toBeCalledTimes(2);

          case 13:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  })));
  it('should only reject the last waiting promise', _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
    var count, func, debounced, promises, i, results;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            expect.assertions(5);
            count = 0;
            func = jest.fn(function () {
              if (++count > 1) {
                throw new Error('boom');
              }
            });
            debounced = (0, _debounceAsync.debounceAsync)(func, {
              delay: 1000,
              immediate: true
            });
            promises = [];
            promises.push(debounced());
            expect(func).toBeCalledTimes(1);

            for (i = 0; i < 10; i++) {
              jest.advanceTimersByTime(500);
              promises.push(debounced());
            }

            expect(func).toBeCalledTimes(1);
            jest.advanceTimersByTime(1000);
            _context9.next = 12;
            return expect(debounced()).rejects.toThrow('boom');

          case 12:
            _context9.next = 14;
            return Promise.all(promises);

          case 14:
            results = _context9.sent;
            expect(results).toStrictEqual(new Array(11).fill(undefined));
            expect(func).toBeCalledTimes(2);

          case 17:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  })));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90aW1lci9kZWJvdW5jZUFzeW5jLnRlc3QuanMiXSwibmFtZXMiOlsiamVzdCIsInVzZUZha2VUaW1lcnMiLCJkZXNjcmliZSIsImZpeHR1cmUiLCJTeW1ib2wiLCJpdCIsImZ1bmMiLCJmbiIsImRlYm91bmNlZCIsImkiLCJhZHZhbmNlVGltZXJzQnlUaW1lIiwiZXhwZWN0IiwidG9CZUNhbGxlZFRpbWVzIiwiYXNzZXJ0aW9ucyIsInZhbHVlIiwicHJvbWlzZSIsInRvQmUiLCJtb2NrUmVzb2x2ZWRWYWx1ZU9uY2UiLCJwcm9taXNlcyIsInB1c2giLCJQcm9taXNlIiwiYWxsIiwidG9TdHJpY3RFcXVhbCIsIm9iaiIsImNhbGwiLCJjYW5jZWwiLCJ0b0JlVW5kZWZpbmVkIiwiZGVsYXkiLCJpbW1lZGlhdGUiLCJjb3VudCIsIkVycm9yIiwicmVqZWN0cyIsInRvVGhyb3ciLCJyZXN1bHRzIiwiQXJyYXkiLCJmaWxsIiwidW5kZWZpbmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7QUFHQUEsSUFBSSxDQUFDQyxhQUFMO0FBRUFDLFFBQVEsQ0FBQyxpQkFBRCxFQUFvQixZQUFNO0FBQ2hDLE1BQU1DLE9BQU8sR0FBR0MsTUFBTSxDQUFDLFNBQUQsQ0FBdEI7QUFFQUMsRUFBQUEsRUFBRSxDQUFDLHNEQUFELEVBQXlELFlBQU07QUFDL0QsUUFBTUMsSUFBSSxHQUFHTixJQUFJLENBQUNPLEVBQUwsRUFBYjtBQUNBLFFBQU1DLFNBQVMsR0FBRyxrQ0FBY0YsSUFBZCxFQUFvQixJQUFwQixDQUFsQjs7QUFDQSxTQUFLLElBQUlHLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsRUFBcEIsRUFBd0JBLENBQUMsRUFBekIsRUFBNkI7QUFDM0JULE1BQUFBLElBQUksQ0FBQ1UsbUJBQUwsQ0FBeUIsR0FBekI7QUFDQUYsTUFBQUEsU0FBUztBQUNWOztBQUNERyxJQUFBQSxNQUFNLENBQUNMLElBQUQs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LENBQVQsR0FBYSxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsRUFBcEIsRUFBd0JBLENBQUMsRUFBekIsRUFBNkI7QUFDM0JULGNBQUFBLElBQUksQ0FBQ1UsbUJBQUwsQ0FBeUIsR0FBekI7QUFDQVEsY0FBQUEsUUFBUSxDQUFDQyxJQUFULENBQWNYLFNBQVMsRUFBdkI7QUFDRDs7QUFDREcsWUFBQUEsTUFBTSxDQUFDTCxJQUFELENBQU4sQ0FBYU0sZUFBYixDQUE2QixDQUE3QjtBQUNBWixZQUFBQSxJQUFJLENBQUNVLG1CQUFMLENBQXlCLElBQXpCO0FBakJGO0FBQUEsbUJBa0JRQyxNQUFNLENBQUNILFNBQVMsRUFBVixDQUFOLENBQW9CdUIsT0FBcEIsQ0FBNEJDLE9BQTVCLENBQW9DLE1BQXBDLENBbEJSOztBQUFBO0FBQUE7QUFBQSxtQkFtQndCWixPQUFPLENBQUNDLEdBQVIsQ0FBWUgsUUFBWixDQW5CeEI7O0FBQUE7QUFtQlFlLFlBQUFBLE9BbkJSO0FBb0JFdEIsWUFBQUEsTUFBTSxDQUFDc0IsT0FBRCxDQUFOLENBQWdCWCxhQUFoQixDQUE4QixJQUFJWSxLQUFKLENBQVUsRUFBVixFQUFjQyxJQUFkLENBQW1CQyxTQUFuQixDQUE5QjtBQUNBekIsWUFBQUEsTUFBTSxDQUFDTCxJQUFELENBQU4sQ0FBYU0sZUFBYixDQUE2QixDQUE3Qjs7QUFyQkY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FGQSxHQUFGO0FBMEJELENBL0lPLENBQVIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWJvdW5jZUFzeW5jIH0gZnJvbSAnLi9kZWJvdW5jZUFzeW5jJ1xuXG4vLyBUZWxsIGplc3QgdG8gbW9jayBhbGwgdGltZW91dCBmdW5jdGlvbnM6XG5qZXN0LnVzZUZha2VUaW1lcnMoKVxuXG5kZXNjcmliZSgnZGVib3VuY2VBc3luYygpJywgKCkgPT4ge1xuICBjb25zdCBmaXh0dXJlID0gU3ltYm9sKCdmaXh0dXJlJylcblxuICBpdCgnc2hvdWxkIG5ldmVyIGV4ZWN1dGUgaWYgaW50ZXJ2YWxzIGFyZSBsZXNzIHRoYW4gd2FpdCcsICgpID0+IHtcbiAgICBjb25zdCBmdW5jID0gamVzdC5mbigpXG4gICAgY29uc3QgZGVib3VuY2VkID0gZGVib3VuY2VBc3luYyhmdW5jLCAxMDAwKVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgamVzdC5hZHZhbmNlVGltZXJzQnlUaW1lKDUwMClcbiAgICAgIGRlYm91bmNlZCgpXG4gICAgfVxuICAgIGV4cGVjdChmdW5jKS50b0JlQ2FsbGVkVGltZXMoMClcbiAgfSlcblxuICBpdCgnc2hvdWxkIGV4ZWN1dGUganVzdCBvbmNlIGlmIGFuIGludGVydmFsIGlzIGJpZyBlbm91Z2gnLCAoKSA9PiB7XG4gICAgY29uc3QgZnVuYyA9IGplc3QuZm4oKVxuICAgIGNvbnN0IGRlYm91bmNlZCA9IGRlYm91bmNlQXN5bmMoZnVuYywgMTAwMClcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgIGplc3QuYWR2YW5jZVRpbWVyc0J5VGltZSg1MDApXG4gICAgICBkZWJvdW5jZWQoKVxuICAgIH1cbiAgICBqZXN0LmFkdmFuY2VUaW1lcnNCeVRpbWUoMTAwMClcbiAgICBkZWJvdW5jZWQoKVxuICAgIGV4cGVjdChmdW5jKS50b0JlQ2FsbGVkVGltZXMoMSlcbiAgfSlcblxuICBpdCgnc2hvdWxkIHBhc3MgdGhyb3VnaCBhcmd1bWVudCcsIGFzeW5jICgpID0+IHtcbiAgICBleHBlY3QuYXNzZXJ0aW9ucygyKVxuICAgIGNvbnN0IGZ1bmMgPSBqZXN0LmZuKGFzeW5jIHZhbHVlID0+IHZhbHVlKVxuICAgIGNvbnN0IGRlYm91bmNlZCA9IGRlYm91bmNlQXN5bmMoZnVuYywgMTAwMClcbiAgICBjb25zdCBwcm9taXNlID0gZGVib3VuY2VkKGZpeHR1cmUpXG4gICAgamVzdC5hZHZhbmNlVGltZXJzQnlUaW1lKDEwMDApXG4gICAgZXhwZWN0KGF3YWl0IHByb21pc2UpLnRvQmUoZml4dHVyZSlcbiAgICBleHBlY3QoZnVuYykudG9CZUNhbGxlZFRpbWVzKDEpXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBwYXNzIHRocm91Z2ggcmV0dXJuIHZhbHVlJywgYXN5bmMgKCkgPT4ge1xuICAgIGV4cGVjdC5hc3NlcnRpb25zKDIpXG4gICAgY29uc3QgZnVuYyA9IGplc3QuZm4oKS5tb2NrUmVzb2x2ZWRWYWx1ZU9uY2UoZml4dHVyZSlcbiAgICBjb25zdCBkZWJvdW5jZWQgPSBkZWJvdW5jZUFzeW5jKGZ1bmMsIDEwMDApXG4gICAgY29uc3QgcHJvbWlzZXMgPSBbXVxuICAgIHByb21pc2VzLnB1c2goZGVib3VuY2VkKCkpXG4gICAgamVzdC5hZHZhbmNlVGltZXJzQnlUaW1lKDEwMDApXG4gICAgcHJvbWlzZXMucHVzaChkZWJvdW5jZWQoKSlcbiAgICBleHBlY3QoYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpKS50b1N0cmljdEVxdWFsKFtmaXh0dXJlLCBmaXh0dXJlXSlcbiAgICBleHBlY3QoZnVuYykudG9CZUNhbGxlZFRpbWVzKDEpXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBwYXNzIHRocm91Z2ggYHRoaXNgJywgYXN5bmMgKCkgPT4ge1xuICAgIGV4cGVjdC5hc3NlcnRpb25zKDIpXG4gICAgY29uc3QgZnVuYyA9IGplc3QuZm4oYXN5bmMgZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzIH0pXG4gICAgY29uc3QgZGVib3VuY2VkID0gZGVib3VuY2VBc3luYyhmdW5jLCAxMDAwKVxuICAgIGNvbnN0IG9iaiA9IHt9XG4gICAgY29uc3QgcHJvbWlzZXMgPSBbXVxuICAgIHByb21pc2VzLnB1c2goZGVib3VuY2VkLmNhbGwob2JqKSlcbiAgICBqZXN0LmFkdmFuY2VUaW1lcnNCeVRpbWUoMTAwMClcbiAgICBwcm9taXNlcy5wdXNoKGRlYm91bmNlZC5jYWxsKG9iaikpXG4gICAgZXhwZWN0KGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKSkudG9TdHJpY3RFcXVhbChbb2JqLCBvYmpdKVxuICAgIGV4cGVjdChmdW5jKS50b0JlQ2FsbGVkVGltZXMoMSlcbiAgfSlcblxuICBpdCgnc2hvdWxkIGFsbG93IHRvIGNhbmNlbCcsIGFzeW5jICgpID0+IHtcbiAgICBleHBlY3QuYXNzZXJ0aW9ucyg2KVxuICAgIGNvbnN0IGZ1bmMgPSBqZXN0LmZuKClcbiAgICBjb25zdCBkZWJvdW5jZWQgPSBkZWJvdW5jZUFzeW5jKGZ1bmMsIDEwMDApXG4gICAgY29uc3QgcHJvbWlzZSA9IGRlYm91bmNlZCgpXG4gICAgamVzdC5hZHZhbmNlVGltZXJzQnlUaW1lKDUwMClcbiAgICBleHBlY3QoZGVib3VuY2VkLmNhbmNlbCgpKS50b0JlKHRydWUpXG4gICAgZXhwZWN0KGRlYm91bmNlZC5jYW5jZWwoKSkudG9CZShmYWxzZSlcbiAgICBqZXN0LmFkdmFuY2VUaW1lcnNCeVRpbWUoNTAwKVxuICAgIGV4cGVjdChmdW5jKS50b0JlQ2FsbGVkVGltZXMoMClcbiAgICBleHBlY3QoYXdhaXQgcHJvbWlzZSkudG9CZVVuZGVmaW5lZCgpXG4gICAgamVzdC5hZHZhbmNlVGltZXJzQnlUaW1lKDEwMDApXG4gICAgZXhwZWN0KGZ1bmMpLnRvQmVDYWxsZWRUaW1lcygwKVxuICAgIGF3YWl0IGRlYm91bmNlZCgpXG4gICAgamVzdC5hZHZhbmNlVGltZXJzQnlUaW1lKDEwMDApXG4gICAgZXhwZWN0KGZ1bmMpLnRvQmVDYWxsZWRUaW1lcygxKVxuICB9KVxuXG4gIGl0KFxuICAgICdzaG91bGQgZXhlY3V0ZSBvbmNlIGltbWVkaWF0ZWx5IGlmIGludGVydmFscyBhcmUgbGVzcyB0aGFuIHdhaXQnLFxuICAgIGFzeW5jICgpID0+IHtcbiAgICAgIGV4cGVjdC5hc3NlcnRpb25zKDIpXG4gICAgICBjb25zdCBmdW5jID0gamVzdC5mbigpXG4gICAgICBjb25zdCBkZWJvdW5jZWQgPSBkZWJvdW5jZUFzeW5jKGZ1bmMsIHsgZGVsYXk6IDEwMDAsIGltbWVkaWF0ZTogdHJ1ZSB9KVxuICAgICAgY29uc3QgcHJvbWlzZXMgPSBbXVxuICAgICAgcHJvbWlzZXMucHVzaChkZWJvdW5jZWQoKSlcbiAgICAgIGV4cGVjdChmdW5jKS50b0JlQ2FsbGVkVGltZXMoMSlcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICBqZXN0LmFkdmFuY2VUaW1lcnNCeVRpbWUoNTAwKVxuICAgICAgICBwcm9taXNlcy5wdXNoKGRlYm91bmNlZCgpKVxuICAgICAgfVxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgICBleHBlY3QoZnVuYykudG9CZUNhbGxlZFRpbWVzKDEpXG4gICAgfVxuICApXG5cbiAgaXQoXG4gICAgJ3Nob3VsZCBleGVjdXRlIHR3aWNlIGltbWVkaWF0ZWx5IHdpdGggbG9uZyBlbm91Z2ggaW50ZXJ2YWxzJyxcbiAgICBhc3luYyAoKSA9PiB7XG4gICAgICBleHBlY3QuYXNzZXJ0aW9ucygzKVxuICAgICAgY29uc3QgZnVuYyA9IGplc3QuZm4oKVxuICAgICAgY29uc3QgZGVib3VuY2VkID0gZGVib3VuY2VBc3luYyhmdW5jLCB7IGRlbGF5OiAxMDAwLCBpbW1lZGlhdGU6IHRydWUgfSlcbiAgICAgIGNvbnN0IHByb21pc2VzID0gW11cbiAgICAgIHByb21pc2VzLnB1c2goZGVib3VuY2VkKCkpXG4gICAgICBleHBlY3QoZnVuYykudG9CZUNhbGxlZFRpbWVzKDEpXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgamVzdC5hZHZhbmNlVGltZXJzQnlUaW1lKDUwMClcbiAgICAgICAgcHJvbWlzZXMucHVzaChkZWJvdW5jZWQoKSlcbiAgICAgIH1cbiAgICAgIGV4cGVjdChmdW5jKS50b0JlQ2FsbGVkVGltZXMoMSlcbiAgICAgIGplc3QuYWR2YW5jZVRpbWVyc0J5VGltZSgxMDAwKVxuICAgICAgcHJvbWlzZXMucHVzaChkZWJvdW5jZWQoKSlcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgZXhwZWN0KGZ1bmMpLnRvQmVDYWxsZWRUaW1lcygyKVxuICAgIH1cbiAgKVxuXG4gIGl0KFxuICAgICdzaG91bGQgb25seSByZWplY3QgdGhlIGxhc3Qgd2FpdGluZyBwcm9taXNlJyxcbiAgICBhc3luYyAoKSA9PiB7XG4gICAgICBleHBlY3QuYXNzZXJ0aW9ucyg1KVxuICAgICAgbGV0IGNvdW50ID0gMFxuICAgICAgY29uc3QgZnVuYyA9IGplc3QuZm4oKCkgPT4ge1xuICAgICAgICBpZiAoKytjb3VudCA+IDEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jvb20nKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgY29uc3QgZGVib3VuY2VkID0gZGVib3VuY2VBc3luYyhmdW5jLCB7IGRlbGF5OiAxMDAwLCBpbW1lZGlhdGU6IHRydWUgfSlcbiAgICAgIGNvbnN0IHByb21pc2VzID0gW11cbiAgICAgIHByb21pc2VzLnB1c2goZGVib3VuY2VkKCkpXG4gICAgICBleHBlY3QoZnVuYykudG9CZUNhbGxlZFRpbWVzKDEpXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgamVzdC5hZHZhbmNlVGltZXJzQnlUaW1lKDUwMClcbiAgICAgICAgcHJvbWlzZXMucHVzaChkZWJvdW5jZWQoKSlcbiAgICAgIH1cbiAgICAgIGV4cGVjdChmdW5jKS50b0JlQ2FsbGVkVGltZXMoMSlcbiAgICAgIGplc3QuYWR2YW5jZVRpbWVyc0J5VGltZSgxMDAwKVxuICAgICAgYXdhaXQgZXhwZWN0KGRlYm91bmNlZCgpKS5yZWplY3RzLnRvVGhyb3coJ2Jvb20nKVxuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgZXhwZWN0KHJlc3VsdHMpLnRvU3RyaWN0RXF1YWwobmV3IEFycmF5KDExKS5maWxsKHVuZGVmaW5lZCkpXG4gICAgICBleHBlY3QoZnVuYykudG9CZUNhbGxlZFRpbWVzKDIpXG4gICAgfVxuICApXG59KVxuIl19