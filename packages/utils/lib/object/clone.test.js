"use strict";

var _clone = require("./clone");

describe('clone()', function () {
  it('should clone objects', function () {
    var object = {
      a: 1,
      b: 2
    };
    var copy = (0, _clone.clone)(object);
    expect(copy).toEqual(object);
    expect(copy).not.toBe(object);
  });
  it('should clone arrays', function () {
    var array = [1, 2, 3];
    var copy = (0, _clone.clone)(array);
    expect(copy).toStrictEqual(array);
    expect(copy).not.toBe(array);
  });
  it('should clone dates', function () {
    var date = new Date(2012, 5, 9);
    var copy = (0, _clone.clone)(date);
    expect(copy).toStrictEqual(date);
    expect(copy).not.toBe(date);
  });
  it('should clone regular expressions', function () {
    var regexp = /regexp/gi;
    var copy = (0, _clone.clone)(regexp);
    expect(copy).toStrictEqual(regexp);
    expect(copy).not.toBe(regexp);
  });
  it('should return functions unmodified', function () {
    var func = function func() {};

    expect((0, _clone.clone)(func)).toBe(func);
  });
  it('should clone nested objects and arrays', function () {
    var object = {
      a: [1, 2, 3],
      b: {
        c: 4,
        d: 5
      }
    };
    var copy = (0, _clone.clone)(object);
    expect(copy).toStrictEqual(object);
    expect(copy).not.toBe(object);
    expect(copy.a).not.toBe(object.a);
    expect(copy.b).not.toBe(object.b);
  });
  it('should use clone() methods if available', function () {
    var object = {
      a: 1,
      clone: jest.fn(function () {
        return {
          b: 2
        };
      })
    };
    var copy = (0, _clone.clone)(object);
    expect(object.clone).toBeCalledTimes(1);
    expect(copy).toStrictEqual({
      b: 2
    });
  });
  it('should transform cloned values by `callback`', function () {
    var object = {
      a: {
        b: 1,
        c: 2
      },
      d: {
        e: 3,
        f: 4
      }
    };
    var copy = (0, _clone.clone)(object, function (value) {
      if (typeof value === 'object') {
        value.g = 5;
      }
    });
    var expected = {
      a: {
        b: 1,
        c: 2,
        g: 5
      },
      d: {
        e: 3,
        f: 4,
        g: 5
      },
      g: 5
    };
    expect(copy).toStrictEqual(expected);
  });
  it('should call `callback` after cloning all children', function () {
    var array = [{
      a: 1,
      b: 2
    }, {
      a: 3,
      b: 4
    }];
    var copy = (0, _clone.clone)(array, function (value) {
      if (typeof value === 'object') {
        delete value.b;
      }
    });
    var expected = [{
      a: 1
    }, {
      a: 3
    }];
    expect(copy).toStrictEqual(expected);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vYmplY3QvY2xvbmUudGVzdC5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsIml0Iiwib2JqZWN0IiwiYSIsImIiLCJjb3B5IiwiZXhwZWN0IiwidG9FcXVhbCIsIm5vdCIsInRvQmUiLCJhcnJheSIsInRvU3RyaWN0RXF1YWwiLCJkYXRlIiwiRGF0ZSIsInJlZ2V4cCIsImZ1bmMiLCJjIiwiZCIsImNsb25lIiwiamVzdCIsImZuIiwidG9CZUNhbGxlZFRpbWVzIiwiZSIsImYiLCJ2YWx1ZSIsImciLCJleHBlY3RlZCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFFQUEsUUFBUSxDQUFDLFNBQUQsRUFBWSxZQUFNO0FBQ3hCQyxFQUFBQSxFQUFFLENBQUMsc0JBQUQsRUFBeUIsWUFBTTtBQUMvQixRQUFNQyxNQUFNLEdBQUc7QUFBRUMsTUFBQUEsQ0FBQyxFQUFFLENBQUw7QUFBUUMsTUFBQUEsQ0FBQyxFQUFFO0FBQVgsS0FBZjtBQUNBLFFBQU1DLElBQUksR0FBRyxrQkFBTUgsTUFBTixDQUFiO0FBQ0FJLElBQUFBLE1BQU0sQ0FBQ0QsSUFBRCxDQUFOLENBQWFFLE9BQWIsQ0FBcUJMLE1BQXJCO0FBQ0FJLElBQUFBLE1BQU0sQ0FBQ0QsSUFBRCxDQUFOLENBQWFHLEdBQWIsQ0FBaUJDLElBQWpCLENBQXNCUCxNQUF0QjtBQUNELEdBTEMsQ0FBRjtBQU9BRCxFQUFBQSxFQUFFLENBQUMscUJBQUQsRUFBd0IsWUFBTTtBQUM5QixRQUFNUyxLQUFLLEdBQUcsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FBZDtBQUNBLFFBQU1MLElBQUksR0FBRyxrQkFBTUssS0FBTixDQUFiO0FBQ0FKLElBQUFBLE1BQU0sQ0FBQ0QsSUFBRCxDQUFOLENBQWFNLGFBQWIsQ0FBMkJELEtBQTNCO0FBQ0FKLElBQUFBLE1BQU0sQ0FBQ0QsSUFBRCxDQUFOLENBQWFHLEdBQWIsQ0FBaUJDLElBQWpCLENBQXNCQyxLQUF0QjtBQUNELEdBTEMsQ0FBRjtB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QUM3QixlQUFPQSxLQUFLLENBQUNwQixDQUFiO0FBQ0Q7QUFDRixLQUpZLENBQWI7QUFLQSxRQUFNc0IsUUFBUSxHQUFHLENBQ2Y7QUFBRXZCLE1BQUFBLENBQUMsRUFBRTtBQUFMLEtBRGUsRUFFZjtBQUFFQSxNQUFBQSxDQUFDLEVBQUU7QUFBTCxLQUZlLENBQWpCO0FBSUFHLElBQUFBLE1BQU0sQ0FBQ0QsSUFBRCxDQUFOLENBQWFNLGFBQWIsQ0FBMkJlLFFBQTNCO0FBQ0QsR0FmQyxDQUFGO0FBZ0JELENBdkZPLENBQVIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjbG9uZSB9IGZyb20gJy4vY2xvbmUnXG5cbmRlc2NyaWJlKCdjbG9uZSgpJywgKCkgPT4ge1xuICBpdCgnc2hvdWxkIGNsb25lIG9iamVjdHMnLCAoKSA9PiB7XG4gICAgY29uc3Qgb2JqZWN0ID0geyBhOiAxLCBiOiAyIH1cbiAgICBjb25zdCBjb3B5ID0gY2xvbmUob2JqZWN0KVxuICAgIGV4cGVjdChjb3B5KS50b0VxdWFsKG9iamVjdClcbiAgICBleHBlY3QoY29weSkubm90LnRvQmUob2JqZWN0KVxuICB9KVxuXG4gIGl0KCdzaG91bGQgY2xvbmUgYXJyYXlzJywgKCkgPT4ge1xuICAgIGNvbnN0IGFycmF5ID0gWzEsIDIsIDNdXG4gICAgY29uc3QgY29weSA9IGNsb25lKGFycmF5KVxuICAgIGV4cGVjdChjb3B5KS50b1N0cmljdEVxdWFsKGFycmF5KVxuICAgIGV4cGVjdChjb3B5KS5ub3QudG9CZShhcnJheSlcbiAgfSlcblxuICBpdCgnc2hvdWxkIGNsb25lIGRhdGVzJywgKCkgPT4ge1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgyMDEyLCA1LCA5KVxuICAgIGNvbnN0IGNvcHkgPSBjbG9uZShkYXRlKVxuICAgIGV4cGVjdChjb3B5KS50b1N0cmljdEVxdWFsKGRhdGUpXG4gICAgZXhwZWN0KGNvcHkpLm5vdC50b0JlKGRhdGUpXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBjbG9uZSByZWd1bGFyIGV4cHJlc3Npb25zJywgKCkgPT4ge1xuICAgIGNvbnN0IHJlZ2V4cCA9IC9yZWdleHAvZ2lcbiAgICBjb25zdCBjb3B5ID0gY2xvbmUocmVnZXhwKVxuICAgIGV4cGVjdChjb3B5KS50b1N0cmljdEVxdWFsKHJlZ2V4cClcbiAgICBleHBlY3QoY29weSkubm90LnRvQmUocmVnZXhwKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgcmV0dXJuIGZ1bmN0aW9ucyB1bm1vZGlmaWVkJywgKCkgPT4ge1xuICAgIGNvbnN0IGZ1bmMgPSAoKSA9PiB7fVxuICAgIGV4cGVjdChjbG9uZShmdW5jKSkudG9CZShmdW5jKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgY2xvbmUgbmVzdGVkIG9iamVjdHMgYW5kIGFycmF5cycsICgpID0+IHtcbiAgICBjb25zdCBvYmplY3QgPSB7IGE6IFsxLCAyLCAzXSwgYjogeyBjOiA0LCBkOiA1IH0gfVxuICAgIGNvbnN0IGNvcHkgPSBjbG9uZShvYmplY3QpXG4gICAgZXhwZWN0KGNvcHkpLnRvU3RyaWN0RXF1YWwob2JqZWN0KVxuICAgIGV4cGVjdChjb3B5KS5ub3QudG9CZShvYmplY3QpXG4gICAgZXhwZWN0KGNvcHkuYSkubm90LnRvQmUob2JqZWN0LmEpXG4gICAgZXhwZWN0KGNvcHkuYikubm90LnRvQmUob2JqZWN0LmIpXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCB1c2UgY2xvbmUoKSBtZXRob2RzIGlmIGF2YWlsYWJsZScsICgpID0+IHtcbiAgICBjb25zdCBvYmplY3QgPSB7XG4gICAgICBhOiAxLFxuICAgICAgY2xvbmU6IGplc3QuZm4oKCkgPT4gKHsgYjogMiB9KSlcbiAgICB9XG4gICAgY29uc3QgY29weSA9IGNsb25lKG9iamVjdClcbiAgICBleHBlY3Qob2JqZWN0LmNsb25lKS50b0JlQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QoY29weSkudG9TdHJpY3RFcXVhbCh7IGI6IDIgfSlcbiAgfSlcblxuICBpdCgnc2hvdWxkIHRyYW5zZm9ybSBjbG9uZWQgdmFsdWVzIGJ5IGBjYWxsYmFja2AnLCAoKSA9PiB7XG4gICAgY29uc3Qgb2JqZWN0ID0ge1xuICAgICAgYTogeyBiOiAxLCBjOiAyIH0sXG4gICAgICBkOiB7IGU6IDMsIGY6IDQgfVxuICAgIH1cbiAgICBjb25zdCBjb3B5ID0gY2xvbmUob2JqZWN0LCB2YWx1ZSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICB2YWx1ZS5nID0gNVxuICAgICAgfVxuICAgIH0pXG4gICAgY29uc3QgZXhwZWN0ZWQgPSB7XG4gICAgICBhOiB7IGI6IDEsIGM6IDIsIGc6IDUgfSxcbiAgICAgIGQ6IHsgZTogMywgZjogNCwgZzogNSB9LFxuICAgICAgZzogNVxuICAgIH1cbiAgICBleHBlY3QoY29weSkudG9TdHJpY3RFcXVhbChleHBlY3RlZClcbiAgfSlcblxuICBpdCgnc2hvdWxkIGNhbGwgYGNhbGxiYWNrYCBhZnRlciBjbG9uaW5nIGFsbCBjaGlsZHJlbicsICgpID0+IHtcbiAgICBjb25zdCBhcnJheSA9IFtcbiAgICAgIHsgYTogMSwgYjogMiB9LFxuICAgICAgeyBhOiAzLCBiOiA0IH1cbiAgICBdXG4gICAgY29uc3QgY29weSA9IGNsb25lKGFycmF5LCB2YWx1ZSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBkZWxldGUgdmFsdWUuYlxuICAgICAgfVxuICAgIH0pXG4gICAgY29uc3QgZXhwZWN0ZWQgPSBbXG4gICAgICB7IGE6IDEgfSxcbiAgICAgIHsgYTogMyB9XG4gICAgXVxuICAgIGV4cGVjdChjb3B5KS50b1N0cmljdEVxdWFsKGV4cGVjdGVkKVxuICB9KVxufSlcbiJdfQ==