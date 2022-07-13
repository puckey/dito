"use strict";

require("core-js/modules/es.object.set-prototype-of.js");

var _mixin = require("./mixin");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

describe('mixin()', function () {
  var SomeClass = function () {
    function SomeClass() {}

    var _proto = SomeClass.prototype;

    _proto.function = function _function() {};

    return SomeClass;
  }();

  var SomeMixin1 = (0, _mixin.mixin)(function (Class) {
    return function (_Class) {
      _inheritsLoose(_class, _Class);

      function _class() {
        return _Class.apply(this, arguments) || this;
      }

      var _proto2 = _class.prototype;

      _proto2.function1 = function function1() {};

      return _class;
    }(Class);
  });
  var SomeMixin2 = (0, _mixin.mixin)(function (Class) {
    return function (_Class2) {
      _inheritsLoose(_class2, _Class2);

      function _class2() {
        return _Class2.apply(this, arguments) || this;
      }

      var _proto3 = _class2.prototype;

      _proto3.function2 = function function2() {};

      return _class2;
    }(Class);
  });
  it('should apply mixin to class', function () {
    var NewClass = SomeMixin1(SomeClass);
    var instance = new NewClass();
    expect(instance.function).toBeInstanceOf(Function);
    expect(instance.function1).toBeInstanceOf(Function);
  });
  it('should apply multiple mixins to class', function () {
    var NewClass = SomeMixin2(SomeMixin1(SomeClass));
    var instance = new NewClass();
    expect(instance.function).toBeInstanceOf(Function);
    expect(instance.function1).toBeInstanceOf(Function);
    expect(instance.function2).toBeInstanceOf(Function);
  });
  it('should not apply mixin more than once', function () {
    var NewClass1 = SomeMixin1(SomeClass);
    var NewClass2 = SomeMixin1(NewClass1);
    expect(NewClass2).toBe(NewClass1);
  });
  it('should not affect the base class', function () {
    var NewClass1 = SomeMixin1(SomeClass);
    var NewClass2 = SomeMixin2(SomeClass);
    var instance = new SomeClass();
    var instance1 = new NewClass1();
    var instance2 = new NewClass2();
    expect(instance.function).toBeInstanceOf(Function);
    expect(instance.function1).toBeUndefined();
    expect(instance.function2).toBeUndefined();
    expect(instance1.function).toBeInstanceOf(Function);
    expect(instance1.function1).toBeInstanceOf(Function);
    expect(instance1.function2).toBeUndefined();
    expect(instance2.function).toBeInstanceOf(Function);
    expect(instance2.function1).toBeUndefined();
    expect(instance2.function2).toBeInstanceOf(Function);
  });
  it("should not apply mixin more than once, even if it was applied higher up", function () {
    var NewClass1 = SomeMixin1(SomeClass);

    var NewClass2 = function (_NewClass) {
      _inheritsLoose(NewClass2, _NewClass);

      function NewClass2() {
        return _NewClass.apply(this, arguments) || this;
      }

      return NewClass2;
    }(NewClass1);

    var NewClass3 = SomeMixin1(NewClass2);
    expect(NewClass3).toBe(NewClass2);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGFzcy9taXhpbi50ZXN0LmpzIl0sIm5hbWVzIjpbImRlc2NyaWJlIiwiU29tZUNsYXNzIiwiZnVuY3Rpb24iLCJTb21lTWl4aW4xIiwiQ2xhc3MiLCJmdW5jdGlvbjEiLCJTb21lTWl4aW4yIiwiZnVuY3Rpb24yIiwiaXQiLCJOZXdDbGFzcyIsImluc3RhbmNlIiwiZXhwZWN0IiwidG9CZUluc3RhbmNlT2YiLCJGdW5jdGlvbiIsIk5ld0NsYXNzMSIsIk5ld0NsYXNzMiIsInRvQmUiLCJpbnN0YW5jZTEiLCJpbnN0YW5jZTIiLCJ0b0JlVW5kZWZpbmVkIiwiTmV3Q2xhc3MzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7OztBQUVBQSxRQUFRLENBQUMsU0FBRCxFQUFZLFlBQU07QUFBQSxNQUNsQkMsU0FEa0I7QUFBQTs7QUFBQTs7QUFBQSxXQUV0QkMsUUFGc0IsR0FFdEIscUJBQVcsQ0FBRSxDQUZTOztBQUFBO0FBQUE7O0FBS3hCLE1BQU1DLFVBQVUsR0FBRyxrQkFBTSxVQUFBQyxLQUFLO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUEsY0FDNUJDLFNBRDRCLEdBQzVCLHFCQUFZLENBQUUsQ0FEYzs7QUFBQTtBQUFBLE1BQWtCRCxLQUFsQjtBQUFBLEdBQVgsQ0FBbkI7QUFJQSxNQUFNRSxVQUFVLEdBQUcsa0JBQU0sVUFBQUYsS0FBSztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQUFBLGNBQzVCRyxTQUQ0QixHQUM1QixxQkFBWSxDQUFFLENBRGM7O0FBQUE7QUFBQSxNQUFrQkgsS0FBbEI7QUFBQSxHQUFYLENBQW5CO0FBSUFJLEVBQUFBLEVBQUUsQ0FBQyw2QkFBRCxFQUFnQyxZQUFNO0FBQ3RDLFFBQU1DLFFBQVEsR0FBR04sVUFBVSxDQUFDRixTQUFELENBQTNCO0FBQ0EsUUFBTVMsUUFBUSxHQUFHLElBQUlELFFBQUosRUFBakI7QUFDQUUsSUFBQUEsTUFBTSxDQUFDRCxRQUFRLENB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Q0FBUiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG1peGluIH0gZnJvbSAnLi9taXhpbidcblxuZGVzY3JpYmUoJ21peGluKCknLCAoKSA9PiB7XG4gIGNsYXNzIFNvbWVDbGFzcyB7XG4gICAgZnVuY3Rpb24oKSB7fVxuICB9XG5cbiAgY29uc3QgU29tZU1peGluMSA9IG1peGluKENsYXNzID0+IGNsYXNzIGV4dGVuZHMgQ2xhc3Mge1xuICAgIGZ1bmN0aW9uMSgpIHt9XG4gIH0pXG5cbiAgY29uc3QgU29tZU1peGluMiA9IG1peGluKENsYXNzID0+IGNsYXNzIGV4dGVuZHMgQ2xhc3Mge1xuICAgIGZ1bmN0aW9uMigpIHt9XG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBhcHBseSBtaXhpbiB0byBjbGFzcycsICgpID0+IHtcbiAgICBjb25zdCBOZXdDbGFzcyA9IFNvbWVNaXhpbjEoU29tZUNsYXNzKVxuICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IE5ld0NsYXNzKClcbiAgICBleHBlY3QoaW5zdGFuY2UuZnVuY3Rpb24pLnRvQmVJbnN0YW5jZU9mKEZ1bmN0aW9uKVxuICAgIGV4cGVjdChpbnN0YW5jZS5mdW5jdGlvbjEpLnRvQmVJbnN0YW5jZU9mKEZ1bmN0aW9uKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgYXBwbHkgbXVsdGlwbGUgbWl4aW5zIHRvIGNsYXNzJywgKCkgPT4ge1xuICAgIGNvbnN0IE5ld0NsYXNzID0gU29tZU1peGluMihTb21lTWl4aW4xKFNvbWVDbGFzcykpXG4gICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgTmV3Q2xhc3MoKVxuICAgIGV4cGVjdChpbnN0YW5jZS5mdW5jdGlvbikudG9CZUluc3RhbmNlT2YoRnVuY3Rpb24pXG4gICAgZXhwZWN0KGluc3RhbmNlLmZ1bmN0aW9uMSkudG9CZUluc3RhbmNlT2YoRnVuY3Rpb24pXG4gICAgZXhwZWN0KGluc3RhbmNlLmZ1bmN0aW9uMikudG9CZUluc3RhbmNlT2YoRnVuY3Rpb24pXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBub3QgYXBwbHkgbWl4aW4gbW9yZSB0aGFuIG9uY2UnLCAoKSA9PiB7XG4gICAgY29uc3QgTmV3Q2xhc3MxID0gU29tZU1peGluMShTb21lQ2xhc3MpXG4gICAgY29uc3QgTmV3Q2xhc3MyID0gU29tZU1peGluMShOZXdDbGFzczEpXG4gICAgZXhwZWN0KE5ld0NsYXNzMikudG9CZShOZXdDbGFzczEpXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBub3QgYWZmZWN0IHRoZSBiYXNlIGNsYXNzJywgKCkgPT4ge1xuICAgIGNvbnN0IE5ld0NsYXNzMSA9IFNvbWVNaXhpbjEoU29tZUNsYXNzKVxuICAgIGNvbnN0IE5ld0NsYXNzMiA9IFNvbWVNaXhpbjIoU29tZUNsYXNzKVxuXG4gICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgU29tZUNsYXNzKClcbiAgICBjb25zdCBpbnN0YW5jZTEgPSBuZXcgTmV3Q2xhc3MxKClcbiAgICBjb25zdCBpbnN0YW5jZTIgPSBuZXcgTmV3Q2xhc3MyKClcblxuICAgIGV4cGVjdChpbnN0YW5jZS5mdW5jdGlvbikudG9CZUluc3RhbmNlT2YoRnVuY3Rpb24pXG4gICAgZXhwZWN0KGluc3RhbmNlLmZ1bmN0aW9uMSkudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KGluc3RhbmNlLmZ1bmN0aW9uMikudG9CZVVuZGVmaW5lZCgpXG5cbiAgICBleHBlY3QoaW5zdGFuY2UxLmZ1bmN0aW9uKS50b0JlSW5zdGFuY2VPZihGdW5jdGlvbilcbiAgICBleHBlY3QoaW5zdGFuY2UxLmZ1bmN0aW9uMSkudG9CZUluc3RhbmNlT2YoRnVuY3Rpb24pXG4gICAgZXhwZWN0KGluc3RhbmNlMS5mdW5jdGlvbjIpLnRvQmVVbmRlZmluZWQoKVxuXG4gICAgZXhwZWN0KGluc3RhbmNlMi5mdW5jdGlvbikudG9CZUluc3RhbmNlT2YoRnVuY3Rpb24pXG4gICAgZXhwZWN0KGluc3RhbmNlMi5mdW5jdGlvbjEpLnRvQmVVbmRlZmluZWQoKVxuICAgIGV4cGVjdChpbnN0YW5jZTIuZnVuY3Rpb24yKS50b0JlSW5zdGFuY2VPZihGdW5jdGlvbilcbiAgfSlcblxuICBpdChgc2hvdWxkIG5vdCBhcHBseSBtaXhpbiBtb3JlIHRoYW4gb25jZSwgZXZlbiBpZiBpdCB3YXMgYXBwbGllZCBoaWdoZXIgdXBgLCAoKSA9PiB7XG4gICAgY29uc3QgTmV3Q2xhc3MxID0gU29tZU1peGluMShTb21lQ2xhc3MpXG4gICAgY2xhc3MgTmV3Q2xhc3MyIGV4dGVuZHMgTmV3Q2xhc3MxIHtcbiAgICB9XG4gICAgY29uc3QgTmV3Q2xhc3MzID0gU29tZU1peGluMShOZXdDbGFzczIpXG4gICAgZXhwZWN0KE5ld0NsYXNzMykudG9CZShOZXdDbGFzczIpXG4gIH0pXG59KVxuIl19