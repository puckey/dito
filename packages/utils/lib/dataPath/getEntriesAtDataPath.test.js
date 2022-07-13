"use strict";

var _getEntriesAtDataPath = require("./getEntriesAtDataPath");

describe('getEntriesAtDataPath()', function () {
  var data = {
    object: {
      array: [null, {
        prop: 'expected'
      }]
    }
  };
  it('should return data at a given path in property access notation', function () {
    expect((0, _getEntriesAtDataPath.getEntriesAtDataPath)(data, 'object.array[1].prop')).toStrictEqual({
      'object/array/1/prop': 'expected'
    });
  });
  it('should return data at a given JSON pointer path', function () {
    expect((0, _getEntriesAtDataPath.getEntriesAtDataPath)(data, '/object/array/1/prop')).toStrictEqual({
      'object/array/1/prop': 'expected'
    });
  });
  it("should return data at a given 'relative' JSON pointer path", function () {
    expect((0, _getEntriesAtDataPath.getEntriesAtDataPath)(data, 'object/array/1/prop')).toStrictEqual({
      'object/array/1/prop': 'expected'
    });
  });
  it('should throw an error with faulty paths', function () {
    expect(function () {
      return (0, _getEntriesAtDataPath.getEntriesAtDataPath)(data, 'object/unknown/prop');
    }).toThrow('Invalid path: object/unknown/prop');
  });
  it('should throw an error with nullish objects', function () {
    expect(function () {
      return (0, _getEntriesAtDataPath.getEntriesAtDataPath)(null, 'object');
    }).toThrow('Invalid path: object');
  });
  it('should support custom error handler', function () {
    var handleError = function handleError(object, part, index) {
      return "Error: " + part + ", " + index;
    };

    expect((0, _getEntriesAtDataPath.getEntriesAtDataPath)(data, 'object/unknown/prop', handleError)).toStrictEqual({
      'object/unknown/prop': 'Error: unknown, 1'
    });
  });
  it('should handle non-existing paths with custom `handleError()`', function () {
    var handleError = function handleError() {
      return undefined;
    };

    expect((0, _getEntriesAtDataPath.getEntriesAtDataPath)(data, 'object/unknown/prop', handleError)).toStrictEqual({});
  });
  it('should return wildcard matches', function () {
    var data = {
      object1: {
        array: [{
          name: 'one',
          array: [{
            name: 'one.one'
          }, {
            name: 'one.two'
          }]
        }, {
          name: 'two',
          array: [{
            name: 'two.one'
          }, {
            name: 'two.two'
          }]
        }]
      },
      object2: {
        object: {
          one: {
            name: 'one',
            object: {
              one: {
                name: 'one.one'
              },
              two: {
                name: 'one.two'
              }
            }
          },
          two: {
            name: 'two',
            object: {
              one: {
                name: 'two.one'
              },
              two: {
                name: 'two.two'
              }
            }
          }
        }
      },
      object3: {
        array: [{
          one: {
            name: 'one.one'
          },
          two: {
            name: 'one.two'
          }
        }, {
          one: {
            name: 'two.one'
          },
          two: {
            name: 'two.two'
          }
        }]
      }
    };
    expect((0, _getEntriesAtDataPath.getEntriesAtDataPath)(data, 'object1/array/*/name')).toStrictEqual({
      'object1/array/0/name': 'one',
      'object1/array/1/name': 'two'
    });
    expect((0, _getEntriesAtDataPath.getEntriesAtDataPath)(data, 'object1.array[*].name')).toStrictEqual({
      'object1/array/0/name': 'one',
      'object1/array/1/name': 'two'
    });
    expect((0, _getEntriesAtDataPath.getEntriesAtDataPath)(data, 'object1/array/*/array/*/name')).toStrictEqual({
      'object1/array/0/array/0/name': 'one.one',
      'object1/array/0/array/1/name': 'one.two',
      'object1/array/1/array/0/name': 'two.one',
      'object1/array/1/array/1/name': 'two.two'
    });
    expect((0, _getEntriesAtDataPath.getEntriesAtDataPath)(data, 'object2/object/*/name')).toStrictEqual({
      'object2/object/one/name': 'one',
      'object2/object/two/name': 'two'
    });
    expect((0, _getEntriesAtDataPath.getEntriesAtDataPath)(data, 'object2/object/*/object/*/name')).toStrictEqual({
      'object2/object/one/object/one/name': 'one.one',
      'object2/object/one/object/two/name': 'one.two',
      'object2/object/two/object/one/name': 'two.one',
      'object2/object/two/object/two/name': 'two.two'
    });
    expect((0, _getEntriesAtDataPath.getEntriesAtDataPath)(data, 'object3/array/*/*/name')).toStrictEqual({
      'object3/array/0/one/name': 'one.one',
      'object3/array/0/two/name': 'one.two',
      'object3/array/1/one/name': 'two.one',
      'object3/array/1/two/name': 'two.two'
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRhUGF0aC9nZXRFbnRyaWVzQXREYXRhUGF0aC50ZXN0LmpzIl0sIm5hbWVzIjpbImRlc2NyaWJlIiwiZGF0YSIsIm9iamVjdCIsImFycmF5IiwicHJvcCIsIml0IiwiZXhwZWN0IiwidG9TdHJpY3RFcXVhbCIsInRvVGhyb3ciLCJoYW5kbGVFcnJvciIsInBhcnQiLCJpbmRleCIsInVuZGVmaW5lZCIsIm9iamVjdDEiLCJuYW1lIiwib2JqZWN0MiIsIm9uZSIsInR3byIsIm9iamVjdDMiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBRUFBLFFBQVEsQ0FBQyx3QkFBRCxFQUEyQixZQUFNO0FBQ3ZDLE1BQU1DLElBQUksR0FBRztBQUNYQyxJQUFBQSxNQUFNLEVBQUU7QUFDTkMsTUFBQUEsS0FBSyxFQUFFLENBQ0wsSUFESyxFQUVMO0FBQ0VDLFFBQUFBLElBQUksRUFBRTtBQURSLE9BRks7QUFERDtBQURHLEdBQWI7QUFXQUMsRUFBQUEsRUFBRSxDQUFDLGdFQUFELEVBQW1FLFlBQU07QUFDekVDLElBQUFBLE1BQU0sQ0FBQyxnREFBcUJMLElBQXJCLEVBQTJCLHNCQUEzQixDQUFELENBQU4sQ0FBMkRNLGFBQTNELENBQXlFO0FBQ3ZFLDZCQUF1QjtBQURnRCxLQUF6RTtBQUdELEdBSkMsQ0FBRjtBQU1BRixFQUFBQSxFQUFFLENBQUMsaURBQUQsRUFBb0QsWUFBTTtBQUMxREMsSUFBQUEsTUFBTSxDQUFDLGdEQUFxQkwsSUFBckIsRUFBMkIsc0JBQTNCLENBQUQsQ0FBTixDQUEyRE0sYUFBM0QsQ0FBeUU7QUFDdkUsNkJBQXVCO0FBRGdELEtBQXpFO0FBR0QsR0FKQyxDQUFGO0FBTUFGLEVBQUFBLEVBQUUsK0RBQStELFlBQU07QUFDckVDLElBQUFBLE1BQU0sQ0FBQyxnREFBcUJMLElBQXJCLEVBQTJCLHFCQUEzQixDQUFELENBQU4sQ0FBMERNLGFBQTFELENBQXdFO0FBQ3RFLDZCQUF1QjtBQUQrQyxLQUF4RTtBQUdELEdBSkMsQ0FB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QTRCLFNBSGY7QUFJYixrQ0FBNEI7QUFKZixLQURqQjtBQU9ELEdBeEZDLENBQUY7QUF5RkQsQ0E3SU8sQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldEVudHJpZXNBdERhdGFQYXRoIH0gZnJvbSAnLi9nZXRFbnRyaWVzQXREYXRhUGF0aCdcblxuZGVzY3JpYmUoJ2dldEVudHJpZXNBdERhdGFQYXRoKCknLCAoKSA9PiB7XG4gIGNvbnN0IGRhdGEgPSB7XG4gICAgb2JqZWN0OiB7XG4gICAgICBhcnJheTogW1xuICAgICAgICBudWxsLFxuICAgICAgICB7XG4gICAgICAgICAgcHJvcDogJ2V4cGVjdGVkJ1xuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICB9XG5cbiAgaXQoJ3Nob3VsZCByZXR1cm4gZGF0YSBhdCBhIGdpdmVuIHBhdGggaW4gcHJvcGVydHkgYWNjZXNzIG5vdGF0aW9uJywgKCkgPT4ge1xuICAgIGV4cGVjdChnZXRFbnRyaWVzQXREYXRhUGF0aChkYXRhLCAnb2JqZWN0LmFycmF5WzFdLnByb3AnKSkudG9TdHJpY3RFcXVhbCh7XG4gICAgICAnb2JqZWN0L2FycmF5LzEvcHJvcCc6ICdleHBlY3RlZCdcbiAgICB9KVxuICB9KVxuXG4gIGl0KCdzaG91bGQgcmV0dXJuIGRhdGEgYXQgYSBnaXZlbiBKU09OIHBvaW50ZXIgcGF0aCcsICgpID0+IHtcbiAgICBleHBlY3QoZ2V0RW50cmllc0F0RGF0YVBhdGgoZGF0YSwgJy9vYmplY3QvYXJyYXkvMS9wcm9wJykpLnRvU3RyaWN0RXF1YWwoe1xuICAgICAgJ29iamVjdC9hcnJheS8xL3Byb3AnOiAnZXhwZWN0ZWQnXG4gICAgfSlcbiAgfSlcblxuICBpdChgc2hvdWxkIHJldHVybiBkYXRhIGF0IGEgZ2l2ZW4gJ3JlbGF0aXZlJyBKU09OIHBvaW50ZXIgcGF0aGAsICgpID0+IHtcbiAgICBleHBlY3QoZ2V0RW50cmllc0F0RGF0YVBhdGgoZGF0YSwgJ29iamVjdC9hcnJheS8xL3Byb3AnKSkudG9TdHJpY3RFcXVhbCh7XG4gICAgICAnb2JqZWN0L2FycmF5LzEvcHJvcCc6ICdleHBlY3RlZCdcbiAgICB9KVxuICB9KVxuXG4gIGl0KCdzaG91bGQgdGhyb3cgYW4gZXJyb3Igd2l0aCBmYXVsdHkgcGF0aHMnLCAoKSA9PiB7XG4gICAgZXhwZWN0KCgpID0+IGdldEVudHJpZXNBdERhdGFQYXRoKGRhdGEsICdvYmplY3QvdW5rbm93bi9wcm9wJykpXG4gICAgICAudG9UaHJvdygnSW52YWxpZCBwYXRoOiBvYmplY3QvdW5rbm93bi9wcm9wJylcbiAgfSlcblxuICBpdCgnc2hvdWxkIHRocm93IGFuIGVycm9yIHdpdGggbnVsbGlzaCBvYmplY3RzJywgKCkgPT4ge1xuICAgIGV4cGVjdCgoKSA9PiBnZXRFbnRyaWVzQXREYXRhUGF0aChudWxsLCAnb2JqZWN0JykpXG4gICAgICAudG9UaHJvdygnSW52YWxpZCBwYXRoOiBvYmplY3QnKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgc3VwcG9ydCBjdXN0b20gZXJyb3IgaGFuZGxlcicsICgpID0+IHtcbiAgICBjb25zdCBoYW5kbGVFcnJvciA9IChvYmplY3QsIHBhcnQsIGluZGV4KSA9PiBgRXJyb3I6ICR7cGFydH0sICR7aW5kZXh9YFxuICAgIGV4cGVjdChnZXRFbnRyaWVzQXREYXRhUGF0aChkYXRhLCAnb2JqZWN0L3Vua25vd24vcHJvcCcsIGhhbmRsZUVycm9yKSlcbiAgICAgIC50b1N0cmljdEVxdWFsKHsgJ29iamVjdC91bmtub3duL3Byb3AnOiAnRXJyb3I6IHVua25vd24sIDEnIH0pXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBoYW5kbGUgbm9uLWV4aXN0aW5nIHBhdGhzIHdpdGggY3VzdG9tIGBoYW5kbGVFcnJvcigpYCcsICgpID0+IHtcbiAgICBjb25zdCBoYW5kbGVFcnJvciA9ICgpID0+IHVuZGVmaW5lZFxuICAgIGV4cGVjdChnZXRFbnRyaWVzQXREYXRhUGF0aChkYXRhLCAnb2JqZWN0L3Vua25vd24vcHJvcCcsIGhhbmRsZUVycm9yKSlcbiAgICAgIC50b1N0cmljdEVxdWFsKHt9KVxuICB9KVxuXG4gIGl0KCdzaG91bGQgcmV0dXJuIHdpbGRjYXJkIG1hdGNoZXMnLCAoKSA9PiB7XG4gICAgY29uc3QgZGF0YSA9IHtcbiAgICAgIG9iamVjdDE6IHtcbiAgICAgICAgYXJyYXk6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnb25lJyxcbiAgICAgICAgICAgIGFycmF5OiBbXG4gICAgICAgICAgICAgIHsgbmFtZTogJ29uZS5vbmUnIH0sXG4gICAgICAgICAgICAgIHsgbmFtZTogJ29uZS50d28nIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICd0d28nLFxuICAgICAgICAgICAgYXJyYXk6IFtcbiAgICAgICAgICAgICAgeyBuYW1lOiAndHdvLm9uZScgfSxcbiAgICAgICAgICAgICAgeyBuYW1lOiAndHdvLnR3bycgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIG9iamVjdDI6IHtcbiAgICAgICAgb2JqZWN0OiB7XG4gICAgICAgICAgb25lOiB7XG4gICAgICAgICAgICBuYW1lOiAnb25lJyxcbiAgICAgICAgICAgIG9iamVjdDoge1xuICAgICAgICAgICAgICBvbmU6IHsgbmFtZTogJ29uZS5vbmUnIH0sXG4gICAgICAgICAgICAgIHR3bzogeyBuYW1lOiAnb25lLnR3bycgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgdHdvOiB7XG4gICAgICAgICAgICBuYW1lOiAndHdvJyxcbiAgICAgICAgICAgIG9iamVjdDoge1xuICAgICAgICAgICAgICBvbmU6IHsgbmFtZTogJ3R3by5vbmUnIH0sXG4gICAgICAgICAgICAgIHR3bzogeyBuYW1lOiAndHdvLnR3bycgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9iamVjdDM6IHtcbiAgICAgICAgYXJyYXk6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBvbmU6IHsgbmFtZTogJ29uZS5vbmUnIH0sXG4gICAgICAgICAgICB0d286IHsgbmFtZTogJ29uZS50d28nIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG9uZTogeyBuYW1lOiAndHdvLm9uZScgfSxcbiAgICAgICAgICAgIHR3bzogeyBuYW1lOiAndHdvLnR3bycgfVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIH1cblxuICAgIGV4cGVjdChnZXRFbnRyaWVzQXREYXRhUGF0aChkYXRhLCAnb2JqZWN0MS9hcnJheS8qL25hbWUnKSlcbiAgICAgIC50b1N0cmljdEVxdWFsKHtcbiAgICAgICAgJ29iamVjdDEvYXJyYXkvMC9uYW1lJzogJ29uZScsXG4gICAgICAgICdvYmplY3QxL2FycmF5LzEvbmFtZSc6ICd0d28nXG4gICAgICB9KVxuICAgIGV4cGVjdChnZXRFbnRyaWVzQXREYXRhUGF0aChkYXRhLCAnb2JqZWN0MS5hcnJheVsqXS5uYW1lJykpXG4gICAgICAudG9TdHJpY3RFcXVhbCh7XG4gICAgICAgICdvYmplY3QxL2FycmF5LzAvbmFtZSc6ICdvbmUnLFxuICAgICAgICAnb2JqZWN0MS9hcnJheS8xL25hbWUnOiAndHdvJ1xuICAgICAgfSlcbiAgICBleHBlY3QoZ2V0RW50cmllc0F0RGF0YVBhdGgoZGF0YSwgJ29iamVjdDEvYXJyYXkvKi9hcnJheS8qL25hbWUnKSlcbiAgICAgIC50b1N0cmljdEVxdWFsKHtcbiAgICAgICAgJ29iamVjdDEvYXJyYXkvMC9hcnJheS8wL25hbWUnOiAnb25lLm9uZScsXG4gICAgICAgICdvYmplY3QxL2FycmF5LzAvYXJyYXkvMS9uYW1lJzogJ29uZS50d28nLFxuICAgICAgICAnb2JqZWN0MS9hcnJheS8xL2FycmF5LzAvbmFtZSc6ICd0d28ub25lJyxcbiAgICAgICAgJ29iamVjdDEvYXJyYXkvMS9hcnJheS8xL25hbWUnOiAndHdvLnR3bydcbiAgICAgIH0pXG4gICAgZXhwZWN0KGdldEVudHJpZXNBdERhdGFQYXRoKGRhdGEsICdvYmplY3QyL29iamVjdC8qL25hbWUnKSlcbiAgICAgIC50b1N0cmljdEVxdWFsKHtcbiAgICAgICAgJ29iamVjdDIvb2JqZWN0L29uZS9uYW1lJzogJ29uZScsXG4gICAgICAgICdvYmplY3QyL29iamVjdC90d28vbmFtZSc6ICd0d28nXG4gICAgICB9KVxuICAgIGV4cGVjdChnZXRFbnRyaWVzQXREYXRhUGF0aChkYXRhLCAnb2JqZWN0Mi9vYmplY3QvKi9vYmplY3QvKi9uYW1lJykpXG4gICAgICAudG9TdHJpY3RFcXVhbCh7XG4gICAgICAgICdvYmplY3QyL29iamVjdC9vbmUvb2JqZWN0L29uZS9uYW1lJzogJ29uZS5vbmUnLFxuICAgICAgICAnb2JqZWN0Mi9vYmplY3Qvb25lL29iamVjdC90d28vbmFtZSc6ICdvbmUudHdvJyxcbiAgICAgICAgJ29iamVjdDIvb2JqZWN0L3R3by9vYmplY3Qvb25lL25hbWUnOiAndHdvLm9uZScsXG4gICAgICAgICdvYmplY3QyL29iamVjdC90d28vb2JqZWN0L3R3by9uYW1lJzogJ3R3by50d28nXG4gICAgICB9KVxuICAgIGV4cGVjdChnZXRFbnRyaWVzQXREYXRhUGF0aChkYXRhLCAnb2JqZWN0My9hcnJheS8qLyovbmFtZScpKVxuICAgICAgLnRvU3RyaWN0RXF1YWwoe1xuICAgICAgICAnb2JqZWN0My9hcnJheS8wL29uZS9uYW1lJzogJ29uZS5vbmUnLFxuICAgICAgICAnb2JqZWN0My9hcnJheS8wL3R3by9uYW1lJzogJ29uZS50d28nLFxuICAgICAgICAnb2JqZWN0My9hcnJheS8xL29uZS9uYW1lJzogJ3R3by5vbmUnLFxuICAgICAgICAnb2JqZWN0My9hcnJheS8xL3R3by9uYW1lJzogJ3R3by50d28nXG4gICAgICB9KVxuICB9KVxufSlcbiJdfQ==