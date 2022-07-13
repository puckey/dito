"use strict";

var _getValueAtDataPath = require("./getValueAtDataPath");

describe('getValueAtDataPath()', function () {
  var data = {
    object: {
      array: [null, {
        prop: 'expected'
      }]
    }
  };
  it('should return data at a given path in property access notation', function () {
    expect((0, _getValueAtDataPath.getValueAtDataPath)(data, 'object.array[1].prop')).toBe('expected');
  });
  it('should return data at a given JSON pointer path', function () {
    expect((0, _getValueAtDataPath.getValueAtDataPath)(data, '/object/array/1/prop')).toBe('expected');
  });
  it("should return data at a given 'relative' JSON pointer path", function () {
    expect((0, _getValueAtDataPath.getValueAtDataPath)(data, 'object/array/1/prop')).toBe('expected');
  });
  it('should throw an error with faulty paths', function () {
    expect(function () {
      return (0, _getValueAtDataPath.getValueAtDataPath)(data, 'object/unknown/prop');
    }).toThrow('Invalid path: object/unknown/prop');
  });
  it('should throw an error with nullish objects', function () {
    expect(function () {
      return (0, _getValueAtDataPath.getValueAtDataPath)(null, 'object');
    }).toThrow('Invalid path: object');
  });
  it('should support custom error handler', function () {
    var handleError = function handleError(object, part, index) {
      return "Error: " + part + ", " + index;
    };

    expect((0, _getValueAtDataPath.getValueAtDataPath)(data, 'object/unknown/prop', handleError)).toBe('Error: unknown, 1');
  });
  it('should return wildcard matches', function () {
    var data = {
      object1: {
        array: [{
          name: 'one'
        }, {
          name: 'two'
        }]
      },
      object2: {
        object: {
          one: {
            name: 'one'
          },
          two: {
            name: 'two'
          }
        }
      }
    };
    expect((0, _getValueAtDataPath.getValueAtDataPath)(data, 'object1/array/*/name')).toEqual(['one', 'two']);
    expect((0, _getValueAtDataPath.getValueAtDataPath)(data, 'object1.array[*].name')).toEqual(['one', 'two']);
    expect((0, _getValueAtDataPath.getValueAtDataPath)(data, 'object2/object/*/name')).toEqual(['one', 'two']);
    expect((0, _getValueAtDataPath.getValueAtDataPath)(data, 'object2.object[*].name')).toEqual(['one', 'two']);
    expect((0, _getValueAtDataPath.getValueAtDataPath)(data, '*/*/*')).toEqual([{
      name: 'one'
    }, {
      name: 'two'
    }, {
      name: 'one'
    }, {
      name: 'two'
    }]);
    expect((0, _getValueAtDataPath.getValueAtDataPath)(data, '*/*/*/name')).toEqual(['one', 'two', 'one', 'two']);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRhUGF0aC9nZXRWYWx1ZUF0RGF0YVBhdGgudGVzdC5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsImRhdGEiLCJvYmplY3QiLCJhcnJheSIsInByb3AiLCJpdCIsImV4cGVjdCIsInRvQmUiLCJ0b1Rocm93IiwiaGFuZGxlRXJyb3IiLCJwYXJ0IiwiaW5kZXgiLCJvYmplY3QxIiwibmFtZSIsIm9iamVjdDIiLCJvbmUiLCJ0d28iLCJ0b0VxdWFsIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUVBQSxRQUFRLENBQUMsc0JBQUQsRUFBeUIsWUFBTTtBQUNyQyxNQUFNQyxJQUFJLEdBQUc7QUFDWEMsSUFBQUEsTUFBTSxFQUFFO0FBQ05DLE1BQUFBLEtBQUssRUFBRSxDQUNMLElBREssRUFFTDtBQUNFQyxRQUFBQSxJQUFJLEVBQUU7QUFEUixPQUZLO0FBREQ7QUFERyxHQUFiO0FBV0FDLEVBQUFBLEVBQUUsQ0FBQyxnRUFBRCxFQUFtRSxZQUFNO0FBQ3pFQyxJQUFBQSxNQUFNLENBQUMsNENBQW1CTCxJQUFuQixFQUF5QixzQkFBekIsQ0FBRCxDQUFOLENBQXlETSxJQUF6RCxDQUE4RCxVQUE5RDtBQUNELEdBRkMsQ0FBRjtBQUlBRixFQUFBQSxFQUFFLENBQUMsaURBQUQsRUFBb0QsWUFBTTtBQUMxREMsSUFBQUEsTUFBTSxDQUFDLDRDQUFtQkwsSUFBbkIsRUFBeUIsc0JBQXpCLENBQUQsQ0FBTixDQUF5RE0sSUFBekQsQ0FBOEQsVUFBOUQ7QUFDRCxHQUZDLENBQUY7QUFJQUYsRUFBQUEsRUFBRSwrREFBK0QsWUFBTTtBQUNyRUMsSUFBQUEsTUFBTSxDQUFDLDRDQUFtQkwsSUFBbkIsRUFBeUIscUJBQXpCLENBQUQsQ0FBTixDQUF3RE0sSUFBeEQsQ0FBNkQsVUFBN0Q7QUFDRCxHQUZDLENBQUY7QUFJQUYsRUFBQUEsRUFBRSxDQUFDLHlDQUFELEVBQTRDLFlBQU07QUFDbERDLElBQUFBLE1BQU0sQ0FBQztBQUFBLGFBQU0sNENBQW1CTCxJQUFuQixFQUF5QixxQkFBekIsQ0FBTjtBQUFBLEtBQUQsQ0FBTixDQUNHTyxPQURILENBQ1csbUNBRFg7QUFFRCxHQUhDLENBQUY7QUFLQUgsRUFBQUEsRUFBRSxDQUFDLDRDQUFELEVBQStDLFlBQU07QUFDckRDLElBQUFBLE1BQU0sQ0FBQztBQUFBLGFBQU0sNENBQW1CLElBQW5CLEVBQXlCLFFBQXpCLENBQU47QUFBQSxLQUFELENBQU4sQ0FDR0UsT0FESCxDQUNXLHNCQURYO0FBRUQsR0FIQyxDQUFGO0FBS0FILEVBQUFBLEVBQUUsQ0FBQyxxQ0FBRCxFQUF3QyxZQUFNO0FBQzlDLFFBQU1JLFdBQVcsR0FBRyxTQUFkQSxXQUFjLENBQUNQLE1BQUQsRUFBU1EsSUFBVCxFQUFlQyxLQUFmO0FBQUEseUJBQW1DRCxJQUFuQyxVQUE0Q0MsS0FBNUM7QUFBQSxLQUFwQjs7QUFDQUwsSUFBQUEsTUFBTSxDQUFDLDRDQUFtQkwsSUFBbkIsRUFBeUIscUJBQXpCLEVBQWdEUSxXQUFoRCxDQUFELENBQU4sQ0FDR0YsSUFESCxDQUNRLG1CQURSO0FBRUQsR0FKQyxDQUFGO0FBTUFGLEVBQUFBLEVBQUUsQ0FBQyxnQ0FBRCxFQUFtQyxZQUFNO0FBQ3pDLFFBQU1KLElBQUksR0FBRztBQUNYVyxNQUFBQSxPQUFPLEVBQUU7QUFDUFQsUUFBQUEsS0FBSyxFQUFFLENBQ0w7QUFBRVUsVUFBQUEsSUFBSSxFQUFFO0FBQVIsU0FESyxFQUVMO0FBQUVBLFVBQUFBLElBQUksRUFBRTtBQUFSLFNBRks7QUFEQSxPQURFO0FBT1hDLE1BQUFBLE9BQU8sRUFBRTtBQUNQWixRQUFBQSxNQUFNLEVBQUU7QUFDTmEsVUFBQUEsR0FBRyxFQUFFO0FBQUVGLFlBQUFBLElBQUksRUFBRTtBQUFSLFdBREM7QUFFTkcsVUFBQUEsR0FBRyxFQUFFO0FBQUVILFlBQUFBLElBQUksRUFBRTtBQUFSO0FBRkM7QUFERDtBQVBFLEtBQWI7QUFlQVAsSUFBQUEsTUFBTSxDQUFDLDRDQUFtQkwsSUFBbkIsRUFBeUIsc0JBQXpCLENBQUQsQ0FBTixDQUNHZ0IsT0FESCxDQUNXLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FEWDtBQUVBWCxJQUFBQSxNQUFNLENBQUMsNENBQW1CTCxJQUFuQixFQUF5Qix1QkFBekIsQ0FBRCxDQUFOLENBQ0dnQixPQURILENBQ1csQ0FBQyxLQUFELEVBQVEsS0FBUixDQURYO0FBRUFYLElBQUFBLE1BQU0sQ0FBQyw0Q0FBbUJMLElBQW5CLEVBQXlCLHVCQUF6QixDQUFELENBQU4sQ0FDR2dCLE9BREgsQ0FDVyxDQUFDLEtBQUQsRUFBUSxLQUFSLENBRFg7QUFFQVgsSUFBQUEsTUFBTSxDQUFDLDRDQUFtQkwsSUFBbkIsRUFBeUIsd0JBQXpCLENBQUQsQ0FBTixDQUNHZ0IsT0FESCxDQUNXLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FEWDtBQUVBWCxJQUFBQSxNQUFNLENBQUMsNENBQW1CTCxJQUFuQixFQUF5QixPQUF6QixDQUFELENBQU4sQ0FDR2dCLE9BREgsQ0FDVyxDQUNQO0FBQUVKLE1BQUFBLElBQUksRUFBRTtBQUFSLEtBRE8sRUFFUDtBQUFFQSxNQUFBQSxJQUFJLEVBQUU7QUFBUixLQUZPLEVBR1A7QUFBRUEsTUFBQUEsSUFBSSxFQUFFO0FBQVIsS0FITyxFQUlQO0FBQUVBLE1BQUFBLElBQUksRUFBRTtBQUFSLEtBSk8sQ0FEWDtBQU9BUCxJQUFBQSxNQUFNLENBQUMsNENBQW1CTCxJQUFuQixFQUF5QixZQUF6QixDQUFELENBQU4sQ0FDR2dCLE9BREgsQ0FDVyxDQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixLQUF0QixDQURYO0FBRUQsR0FqQ0MsQ0FBRjtBQWtDRCxDQTFFTyxDQUFSIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0VmFsdWVBdERhdGFQYXRoIH0gZnJvbSAnLi9nZXRWYWx1ZUF0RGF0YVBhdGgnXG5cbmRlc2NyaWJlKCdnZXRWYWx1ZUF0RGF0YVBhdGgoKScsICgpID0+IHtcbiAgY29uc3QgZGF0YSA9IHtcbiAgICBvYmplY3Q6IHtcbiAgICAgIGFycmF5OiBbXG4gICAgICAgIG51bGwsXG4gICAgICAgIHtcbiAgICAgICAgICBwcm9wOiAnZXhwZWN0ZWQnXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIH1cblxuICBpdCgnc2hvdWxkIHJldHVybiBkYXRhIGF0IGEgZ2l2ZW4gcGF0aCBpbiBwcm9wZXJ0eSBhY2Nlc3Mgbm90YXRpb24nLCAoKSA9PiB7XG4gICAgZXhwZWN0KGdldFZhbHVlQXREYXRhUGF0aChkYXRhLCAnb2JqZWN0LmFycmF5WzFdLnByb3AnKSkudG9CZSgnZXhwZWN0ZWQnKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgcmV0dXJuIGRhdGEgYXQgYSBnaXZlbiBKU09OIHBvaW50ZXIgcGF0aCcsICgpID0+IHtcbiAgICBleHBlY3QoZ2V0VmFsdWVBdERhdGFQYXRoKGRhdGEsICcvb2JqZWN0L2FycmF5LzEvcHJvcCcpKS50b0JlKCdleHBlY3RlZCcpXG4gIH0pXG5cbiAgaXQoYHNob3VsZCByZXR1cm4gZGF0YSBhdCBhIGdpdmVuICdyZWxhdGl2ZScgSlNPTiBwb2ludGVyIHBhdGhgLCAoKSA9PiB7XG4gICAgZXhwZWN0KGdldFZhbHVlQXREYXRhUGF0aChkYXRhLCAnb2JqZWN0L2FycmF5LzEvcHJvcCcpKS50b0JlKCdleHBlY3RlZCcpXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCB0aHJvdyBhbiBlcnJvciB3aXRoIGZhdWx0eSBwYXRocycsICgpID0+IHtcbiAgICBleHBlY3QoKCkgPT4gZ2V0VmFsdWVBdERhdGFQYXRoKGRhdGEsICdvYmplY3QvdW5rbm93bi9wcm9wJykpXG4gICAgICAudG9UaHJvdygnSW52YWxpZCBwYXRoOiBvYmplY3QvdW5rbm93bi9wcm9wJylcbiAgfSlcblxuICBpdCgnc2hvdWxkIHRocm93IGFuIGVycm9yIHdpdGggbnVsbGlzaCBvYmplY3RzJywgKCkgPT4ge1xuICAgIGV4cGVjdCgoKSA9PiBnZXRWYWx1ZUF0RGF0YVBhdGgobnVsbCwgJ29iamVjdCcpKVxuICAgICAgLnRvVGhyb3coJ0ludmFsaWQgcGF0aDogb2JqZWN0JylcbiAgfSlcblxuICBpdCgnc2hvdWxkIHN1cHBvcnQgY3VzdG9tIGVycm9yIGhhbmRsZXInLCAoKSA9PiB7XG4gICAgY29uc3QgaGFuZGxlRXJyb3IgPSAob2JqZWN0LCBwYXJ0LCBpbmRleCkgPT4gYEVycm9yOiAke3BhcnR9LCAke2luZGV4fWBcbiAgICBleHBlY3QoZ2V0VmFsdWVBdERhdGFQYXRoKGRhdGEsICdvYmplY3QvdW5rbm93bi9wcm9wJywgaGFuZGxlRXJyb3IpKVxuICAgICAgLnRvQmUoJ0Vycm9yOiB1bmtub3duLCAxJylcbiAgfSlcblxuICBpdCgnc2hvdWxkIHJldHVybiB3aWxkY2FyZCBtYXRjaGVzJywgKCkgPT4ge1xuICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICBvYmplY3QxOiB7XG4gICAgICAgIGFycmF5OiBbXG4gICAgICAgICAgeyBuYW1lOiAnb25lJyB9LFxuICAgICAgICAgIHsgbmFtZTogJ3R3bycgfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgb2JqZWN0Mjoge1xuICAgICAgICBvYmplY3Q6IHtcbiAgICAgICAgICBvbmU6IHsgbmFtZTogJ29uZScgfSxcbiAgICAgICAgICB0d286IHsgbmFtZTogJ3R3bycgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZXhwZWN0KGdldFZhbHVlQXREYXRhUGF0aChkYXRhLCAnb2JqZWN0MS9hcnJheS8qL25hbWUnKSlcbiAgICAgIC50b0VxdWFsKFsnb25lJywgJ3R3byddKVxuICAgIGV4cGVjdChnZXRWYWx1ZUF0RGF0YVBhdGgoZGF0YSwgJ29iamVjdDEuYXJyYXlbKl0ubmFtZScpKVxuICAgICAgLnRvRXF1YWwoWydvbmUnLCAndHdvJ10pXG4gICAgZXhwZWN0KGdldFZhbHVlQXREYXRhUGF0aChkYXRhLCAnb2JqZWN0Mi9vYmplY3QvKi9uYW1lJykpXG4gICAgICAudG9FcXVhbChbJ29uZScsICd0d28nXSlcbiAgICBleHBlY3QoZ2V0VmFsdWVBdERhdGFQYXRoKGRhdGEsICdvYmplY3QyLm9iamVjdFsqXS5uYW1lJykpXG4gICAgICAudG9FcXVhbChbJ29uZScsICd0d28nXSlcbiAgICBleHBlY3QoZ2V0VmFsdWVBdERhdGFQYXRoKGRhdGEsICcqLyovKicpKVxuICAgICAgLnRvRXF1YWwoW1xuICAgICAgICB7IG5hbWU6ICdvbmUnIH0sXG4gICAgICAgIHsgbmFtZTogJ3R3bycgfSxcbiAgICAgICAgeyBuYW1lOiAnb25lJyB9LFxuICAgICAgICB7IG5hbWU6ICd0d28nIH1cbiAgICAgIF0pXG4gICAgZXhwZWN0KGdldFZhbHVlQXREYXRhUGF0aChkYXRhLCAnKi8qLyovbmFtZScpKVxuICAgICAgLnRvRXF1YWwoWydvbmUnLCAndHdvJywgJ29uZScsICd0d28nXSlcbiAgfSlcbn0pXG4iXX0=